import {
  buildDailyDoseTimelineEntries,
  formatTimelineDoseAmount,
  formatTimelineTime,
  parseDoseTimestamp,
} from './helpers';
import { Dose } from '../../hooks/useDoses';

const toDose = (overrides: Partial<Dose>): Dose => ({
  substance: 'Kratom',
  amount: 0,
  doseUnit: 'g',
  date: {
    toDate: () => new Date('2026-03-07T00:00:00.000Z'),
  } as Dose['date'],
  toString: () => '',
  ...overrides,
});

describe('DailyDoseTimeline helpers', () => {
  it('parses firebase-like timestamps safely', () => {
    const parsed = parseDoseTimestamp({
      toDate: () => new Date('2026-03-07T21:35:00.000Z'),
    });

    expect(parsed?.toISOString()).toBe('2026-03-07T21:35:00.000Z');
    expect(parseDoseTimestamp('not-a-date')).toBeNull();
  });

  it('builds timeline entries sorted newest-first and with fallback units', () => {
    const doses: Dose[] = [
      toDose({
        amount: 1,
        doseUnit: 'g',
        date: { toDate: () => new Date('2026-03-07T08:15:00.000Z') } as Dose['date'],
      }),
      toDose({
        amount: 0.75,
        doseUnit: '   ',
        date: { toDate: () => new Date('2026-03-07T12:00:00.000Z') } as Dose['date'],
      }),
      toDose({
        amount: -2,
        doseUnit: 'mg',
        date: { toDate: () => new Date('2026-03-07T06:30:00.000Z') } as Dose['date'],
      }),
      toDose({
        amount: 2,
        date: 'invalid-date-value' as unknown as Dose['date'],
      }),
    ];

    const entries = buildDailyDoseTimelineEntries(doses, {
      fallbackUnit: 'g',
      locale: 'en-US',
      timeZone: 'UTC',
    });

    expect(entries).toHaveLength(3);
    expect(entries[0].timestamp.toISOString()).toBe('2026-03-07T12:00:00.000Z');
    expect(entries[0].unit).toBe('g');
    expect(entries[1].timestamp.toISOString()).toBe('2026-03-07T08:15:00.000Z');
    expect(entries[2].amount).toBe(0);
  });

  it('formats timeline labels and amounts safely', () => {
    const time = formatTimelineTime(new Date('2026-03-07T21:05:00.000Z'), {
      locale: 'en-US',
      timeZone: 'UTC',
    });

    expect(time).toContain('9:05');
    expect(formatTimelineTime(new Date('invalid'))).toBe('--');
    expect(formatTimelineDoseAmount(1.234)).toBe('1.23');
    expect(formatTimelineDoseAmount(-10)).toBe('0');
  });
});
