export interface LumaEvent {
  title: string;
  start: Date;
  end?: Date | null;
  url?: string | null;
  location?: string | null;
  modeLabel: string;
  timeZone?: string | null;
}

const LUMA_API_KEY = import.meta.env.LUMA_API_KEY || process.env.LUMA_API_KEY;
const LUMA_CALENDAR_ID =
  import.meta.env.LUMA_CALENDAR_ID || process.env.LUMA_CALENDAR_ID;

if (!LUMA_API_KEY || !LUMA_CALENDAR_ID) {
  console.warn(
    'LUMA_API_KEY or LUMA_CALENDAR_ID is not set. Events will not be fetched.'
  );
}

function pickFirstArray(value: unknown): any[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') {
    const objectValue = value as Record<string, unknown>;
    const candidates = [
      objectValue.events,
      objectValue.items,
      objectValue.data,
      objectValue.results,
    ];
    for (const candidate of candidates) {
      if (Array.isArray(candidate)) return candidate;
    }
  }
  return [];
}

function normalizeLumaEvent(raw: any): LumaEvent | null {
  if (!raw || typeof raw !== 'object') return null;

  const title =
    raw.name ||
    raw.title ||
    raw.event_name ||
    raw.event?.name ||
    'Upcoming event';

  const startRaw =
    raw.start_at ||
    raw.start_time ||
    raw.start_datetime ||
    raw.start ||
    raw.event?.start_at ||
    raw.event?.start;

  if (!startRaw) return null;

  const endRaw =
    raw.end_at ||
    raw.end_time ||
    raw.end_datetime ||
    raw.end ||
    raw.event?.end_at ||
    raw.event?.end;

  const start = new Date(startRaw);
  const end = endRaw ? new Date(endRaw) : null;

  const url =
    raw.url ||
    raw.event_url ||
    raw.public_url ||
    raw.share_url ||
    raw.event?.url ||
    raw.event?.public_url ||
    null;

  const location =
    raw.location ||
    raw.venue?.name ||
    raw.address ||
    raw.city ||
    raw.event?.location ||
    null;

  const meetingUrl = raw.meeting_url || raw.online_url || raw.zoom_url || null;

  let modeLabel = 'Online';
  if (meetingUrl && location) modeLabel = 'Online + In person';
  else if (location) modeLabel = 'In person';

  const timeZone = raw.timezone || raw.start_timezone || raw.event?.timezone || null;

  return {
    title,
    start,
    end,
    url,
    location,
    modeLabel,
    timeZone,
  };
}

export async function getNextLumaEvent(): Promise<LumaEvent | null> {
  if (!LUMA_API_KEY || !LUMA_CALENDAR_ID) {
    return null;
  }

  const params = new URLSearchParams({
    calendar_id: LUMA_CALENDAR_ID,
    limit: '1',
    after: new Date().toISOString(),
  });

  try {
    const response = await fetch(
      `https://public-api.luma.com/v1/calendar/list-events?${params.toString()}`,
      {
        headers: {
          'x-luma-api-key': LUMA_API_KEY,
        },
      }
    );

    if (!response.ok) {
      console.warn('Luma events fetch failed:', response.status);
      return null;
    }

    const data = await response.json();
    const events = pickFirstArray(data);
    const nextEvent = events.length > 0 ? normalizeLumaEvent(events[0]) : null;

    return nextEvent;
  } catch (error) {
    console.error('Error fetching Luma events:', error);
    return null;
  }
}
