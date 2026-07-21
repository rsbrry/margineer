// Days until next review, indexed by mastery_level. Higher mastery ->
// longer gap before the word reappears in a quiz. This array's length
// also defines the maximum mastery_level (index 8 = capped).
const INTERVAL_DAYS = [0, 1, 2, 4, 7, 14, 30, 60, 120];
const MAX_MASTERY = INTERVAL_DAYS.length - 1;

export function nextReviewFromMastery(masteryLevel: number): { nextQuizDate: string } {
  const clamped = Math.max(0, Math.min(masteryLevel, MAX_MASTERY));
  const days = INTERVAL_DAYS[clamped];
  const date = new Date();
  date.setDate(date.getDate() + days);
  return { nextQuizDate: date.toISOString() };
}

export function applyQuizResult(currentMastery: number, correct: boolean) {
  const newMastery = correct
    ? Math.min(currentMastery + 1, MAX_MASTERY)
    : Math.max(currentMastery - 1, 0);

  const { nextQuizDate } = nextReviewFromMastery(newMastery);
  return { newMastery, nextQuizDate };
}