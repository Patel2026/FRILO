export type FunnelEventName = 'view_template' | 'open_preview' | 'start_order' | 'submit_order';

export interface FunnelEventRecord {
  name: FunnelEventName;
  timestamp: string;
  path: string;
  payload: Record<string, unknown>;
}

const FUNNEL_STORAGE_KEY = 'frilo.analytics.funnel.v1';
const MAX_STORED_EVENTS = 200;

function readStoredEvents(): FunnelEventRecord[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = localStorage.getItem(FUNNEL_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is FunnelEventRecord => {
      return Boolean(
        item &&
        typeof item === 'object' &&
        typeof item.name === 'string' &&
        typeof item.timestamp === 'string' &&
        typeof item.path === 'string' &&
        item.payload &&
        typeof item.payload === 'object'
      );
    });
  } catch {
    return [];
  }
}

function writeStoredEvents(events: FunnelEventRecord[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  const limitedEvents = events.slice(-MAX_STORED_EVENTS);
  localStorage.setItem(FUNNEL_STORAGE_KEY, JSON.stringify(limitedEvents));
}

export function trackFunnelEvent(name: FunnelEventName, payload: Record<string, unknown> = {}): void {
  if (typeof window === 'undefined') {
    return;
  }

  const eventRecord: FunnelEventRecord = {
    name,
    timestamp: new Date().toISOString(),
    path: window.location.pathname,
    payload,
  };

  const existingEvents = readStoredEvents();
  writeStoredEvents([...existingEvents, eventRecord]);

  const windowWithDataLayer = window as Window & {
    dataLayer?: Array<Record<string, unknown>>;
  };

  if (Array.isArray(windowWithDataLayer.dataLayer)) {
    windowWithDataLayer.dataLayer.push({
      event: 'frilo_funnel_event',
      funnel_event_name: eventRecord.name,
      path: eventRecord.path,
      timestamp: eventRecord.timestamp,
      ...eventRecord.payload,
    });
  }

  if (process.env.NODE_ENV !== 'production') {
    // Keep this visible in dev to simplify validation of funnel instrumentation.
    console.info('[FRILO Funnel Event]', eventRecord);
  }
}

export function getStoredFunnelEvents(): FunnelEventRecord[] {
  return readStoredEvents();
}
