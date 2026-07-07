import type { AnswerRecord, ExamStats } from '@/types';

const STORAGE_KEY = 'geo_exam_records';

function loadRecords(): AnswerRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecords(records: AnswerRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function saveAnswer(record: AnswerRecord): void {
  const records = loadRecords();
  const idx = records.findIndex((r) => r.questionId === record.questionId);
  if (idx >= 0) {
    records[idx] = record;
  } else {
    records.push(record);
  }
  saveRecords(records);
}

export function getStats(): ExamStats {
  const records = loadRecords();
  const wrongQuestionIds = records.filter((r) => !r.isCorrect).map((r) => r.questionId);
  const categoryStats: Record<string, { total: number; correct: number }> = {};

  return {
    totalAnswered: records.length,
    correctCount: records.filter((r) => r.isCorrect).length,
    wrongQuestionIds,
    categoryStats,
    recentRecords: records.slice(-20).reverse(),
  };
}

export function getWrongQuestionIds(): string[] {
  const records = loadRecords();
  return records.filter((r) => !r.isCorrect).map((r) => r.questionId);
}

export function getRecordByQuestionId(questionId: string): AnswerRecord | undefined {
  return loadRecords().find((r) => r.questionId === questionId);
}

export function removeWrongRecord(questionId: string): void {
  const records = loadRecords();
  saveRecords(records.filter((r) => r.questionId !== questionId));
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function exportData(): string {
  return JSON.stringify(loadRecords(), null, 2);
}