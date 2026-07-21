// Spaced-repetition intervals in days, indexed by mastery_level.
// mastery_level 0 -> reviewed again tomorrow; higher mastery -> longer gaps.
const INTERVAL_DAYS = [1, 1, 2, 2, 3, 3, 4, 7, 10, 14, 30, 60, 90, 120];
const MAX_MASTERY = INTERVAL_DAYS.length - 1;

// Midnight (00:00:00.000 local time), N days from today, as an ISO string.
// Storing only midnight timestamps means "due today" is a simple <= check
// against today's midnight, with no time-of-day edge cases.
function midnightPlusDays(days: number): string {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export function todayMidnightISO(): string {
  return midnightPlusDays(0);
}

export function tomorrowMidnightISO(): string {
  return midnightPlusDays(1);
}

export function msUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}

// Only called for Daily Quiz answers -- Practice Quiz never touches this.
export function applyDailyQuizResult(currentMastery: number, correct: boolean) {
  const newMastery = correct
    ? Math.min(currentMastery + 1, MAX_MASTERY)
    : Math.max(currentMastery - 1, 0);

  const nextDailyQuiz = midnightPlusDays(INTERVAL_DAYS[newMastery]);
  return { newMastery, nextDailyQuiz };
}