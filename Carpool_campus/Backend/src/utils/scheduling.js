// Date#getDay() returns 0=Sun..6=Sat; map to the 3-letter day codes used by Route.daysOfWeek.
const DAY_CODES = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

function dayCodeFor(date) {
  return DAY_CODES[date.getDay()];
}

// Finds the earliest date (starting today) whose day-of-week is in daysOfWeek
// and isn't in skippedDates. Looks up to 2 weeks ahead as a safety bound.
function computeNextOccurrenceDate(daysOfWeek, skippedDates = [], fromDate = new Date()) {
  const skipped = new Set(skippedDates);
  for (let i = 0; i < 14; i += 1) {
    const candidate = new Date(fromDate);
    candidate.setDate(candidate.getDate() + i);
    const iso = toIsoDate(candidate);
    if (daysOfWeek.includes(dayCodeFor(candidate)) && !skipped.has(iso)) {
      return iso;
    }
  }
  return toIsoDate(fromDate); // fallback; shouldn't be reached with a valid daysOfWeek array
}

function isScheduledToday(daysOfWeek, skippedDates = [], today = new Date()) {
  const iso = toIsoDate(today);
  return daysOfWeek.includes(dayCodeFor(today)) && !skippedDates.includes(iso);
}

module.exports = { computeNextOccurrenceDate, isScheduledToday, toIsoDate, dayCodeFor };