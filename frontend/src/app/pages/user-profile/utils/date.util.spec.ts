import { sortByDate } from './date.util';

describe('sortByDate', () => {
  it('should sort by updatedAt in descending order', () => {
    const items = [
      { updatedAt: '2026-01-01T00:00:00.000Z' },
      { updatedAt: '2026-01-03T00:00:00.000Z' },
      { updatedAt: '2026-01-02T00:00:00.000Z' },
    ];

    const result = [...items].sort(sortByDate);

    expect(result).toEqual([
      { updatedAt: '2026-01-03T00:00:00.000Z' },
      { updatedAt: '2026-01-02T00:00:00.000Z' },
      { updatedAt: '2026-01-01T00:00:00.000Z' },
    ]);
  });
});
