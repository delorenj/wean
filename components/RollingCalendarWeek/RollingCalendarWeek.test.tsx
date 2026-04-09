import {
  aggregateEntriesByDate,
  buildCalendarWeekDates,
  buildRollingCalendarWeekDayStates,
  formatDoseAmount,
  toDateKey,
} from './helpers';

describe('RollingCalendarWeek helpers', () => {
  it('aggregates multiple entries on the same day', () => {
    const entries = [
      { date: new Date(2026, 2, 4, 8), doseTaken: 1.2, targetDose: 2, unit: 'g' },
      { date: new Date(2026, 2, 4, 12), doseTaken: 0.8, unit: 'g' },
      { date: new Date(2026, 2, 5, 10), doseTaken: 1.5, targetDose: 1.4, unit: 'g' },
    ];

    const aggregated = aggregateEntriesByDate(entries);
    const key = toDateKey(new Date(2026, 2, 4));

    expect(aggregated[key]).toEqual({
      doseTaken: 2,
      targetDose: 2,
      unit: 'g',
    });
  });

  it('builds a seven-day week from the configured week start', () => {
    const dates = buildCalendarWeekDates(new Date(2026, 2, 4), 0, 0);

    expect(dates).toHaveLength(7);
    expect(toDateKey(dates[0])).toBe('2026-03-01');
    expect(toDateKey(dates[6])).toBe('2026-03-07');
  });

  it('marks today, future dates, adherence, and warning states correctly', () => {
    const now = new Date(2026, 2, 4, 13);
    const states = buildRollingCalendarWeekDayStates({
      anchorDate: now,
      now,
      weekStartsOn: 0,
      entries: [
        { date: new Date(2026, 2, 3), doseTaken: 1.0, targetDose: 2.0, unit: 'g' },
        { date: new Date(2026, 2, 4), doseTaken: 2.5, targetDose: 2.0, unit: 'g' },
        { date: new Date(2026, 2, 6), doseTaken: 1.5, targetDose: 2.0, unit: 'g' },
      ],
    });

    const marchThird = states.find((state) => state.key === '2026-03-03');
    const marchFourth = states.find((state) => state.key === '2026-03-04');
    const marchSixth = states.find((state) => state.key === '2026-03-06');

    expect(marchThird?.status).toBe('adherent');
    expect(marchFourth?.isToday).toBe(true);
    expect(marchFourth?.status).toBe('warning');
    expect(marchFourth?.isOverTarget).toBe(true);
    expect(marchSixth?.isFuture).toBe(true);
    expect(marchSixth?.status).toBe('future');
  });

  it('supports moving to previous weeks via negative offsets', () => {
    const now = new Date(2026, 2, 4, 13);
    const previousWeek = buildRollingCalendarWeekDayStates({
      anchorDate: now,
      now,
      weekOffset: -1,
      weekStartsOn: 0,
    });

    expect(previousWeek[0].key).toBe('2026-02-22');
    expect(previousWeek[6].key).toBe('2026-02-28');
  });

  it('formats dose values for display', () => {
    expect(formatDoseAmount(1.234, 1)).toBe('1.2');
    expect(formatDoseAmount(1.234, 2)).toBe('1.23');
    expect(formatDoseAmount(null, 2)).toBe('--');
  });
});
