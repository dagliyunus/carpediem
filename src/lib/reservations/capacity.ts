export const RESERVATION_TIME_ZONE = 'Europe/Berlin';

export const CLOSED_WEEKDAY_INDEXES = new Set([2, 3]); // Tuesday, Wednesday

export const RESERVATION_SEATING_AREAS = {
  indoorFourTopTables: { tables: 5, seatsPerTable: 4 },
  indoorLargeTable: { tables: 1, seatsPerTable: 8 },
  outdoorThreeTopTables: { tables: 7, seatsPerTable: 3 },
  outdoorFourTopTable: { tables: 1, seatsPerTable: 4 },
  // Assumption: high tables seat 2 guests each until exact floor-plan data is confirmed.
  highTables: { tables: 4, seatsPerTable: 2 },
} as const;

export const TOTAL_RESERVABLE_SEATS = Object.values(RESERVATION_SEATING_AREAS).reduce(
  (sum, area) => sum + area.tables * area.seatsPerTable,
  0
);

export const LEGACY_LARGE_PARTY_GUEST_COUNT = 9;

export type SeatAvailabilitySnapshot = {
  totalSeats: number;
  reservedSeats: number;
  availableSeats: number;
};

const getDatePart = (date: Date, timeZone: string, type: 'year' | 'month' | 'day') => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  return parts.find((part) => part.type === type)?.value ?? '';
};

export const getTodayIsoDate = (timeZone = RESERVATION_TIME_ZONE) => {
  const now = new Date();
  const year = getDatePart(now, timeZone, 'year');
  const month = getDatePart(now, timeZone, 'month');
  const day = getDatePart(now, timeZone, 'day');

  return `${year}-${month}-${day}`;
};

export const addDaysToIsoDate = (value: string, days: number) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);

  const nextYear = date.getUTCFullYear();
  const nextMonth = String(date.getUTCMonth() + 1).padStart(2, '0');
  const nextDay = String(date.getUTCDate()).padStart(2, '0');

  return `${nextYear}-${nextMonth}-${nextDay}`;
};

export const getWeekdayFromIsoDate = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utcDate = new Date(Date.UTC(year, month - 1, day));

  if (
    utcDate.getUTCFullYear() !== year ||
    utcDate.getUTCMonth() !== month - 1 ||
    utcDate.getUTCDate() !== day
  ) {
    return null;
  }

  return utcDate.getUTCDay();
};

export const isClosedDate = (value: string) => {
  const weekday = getWeekdayFromIsoDate(value);
  if (weekday === null) return false;
  return CLOSED_WEEKDAY_INDEXES.has(weekday);
};

const parseNumericGuestCount = (value: string) => {
  if (!/^\d+$/.test(value)) return null;

  const count = Number(value);
  if (!Number.isInteger(count) || count < 1 || count > TOTAL_RESERVABLE_SEATS) {
    return null;
  }

  return count;
};

export const parseRequestedGuestCount = (value: string) => parseNumericGuestCount(value.trim());

export const parseStoredGuestCount = (value: string) => {
  const normalized = value.trim();
  if (normalized === '9+') return LEGACY_LARGE_PARTY_GUEST_COUNT;
  return parseNumericGuestCount(normalized);
};

export const createSeatAvailabilitySnapshot = (reservedSeats: number): SeatAvailabilitySnapshot => {
  const safeReservedSeats = Math.max(0, reservedSeats);

  return {
    totalSeats: TOTAL_RESERVABLE_SEATS,
    reservedSeats: safeReservedSeats,
    availableSeats: Math.max(TOTAL_RESERVABLE_SEATS - safeReservedSeats, 0),
  };
};

export const formatIsoDateForDisplay = (value: string, locale = 'de-DE') => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  return new Intl.DateTimeFormat(locale, {
    timeZone: 'UTC',
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};
