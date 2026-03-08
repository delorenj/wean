import {
  normalizeDoseAmountForEntry,
  normalizeDoseUnitForEntry,
  resolveDoseMode,
  toEntryTimestampDate,
} from '../dose.helpers';

describe('dose page helpers', () => {
  it('resolves route mode safely', () => {
    expect(resolveDoseMode({ mode: 'edit', doseId: 'dose-1' })).toBe('edit');
    expect(resolveDoseMode({ mode: 'edit', doseId: '' })).toBe('add');
    expect(resolveDoseMode({ mode: 'add', doseId: 'dose-1' })).toBe('add');
    expect(resolveDoseMode()).toBe('add');
  });

  it('normalizes dose units for QuickDoseEntry', () => {
    expect(normalizeDoseUnitForEntry('mg')).toBe('mg');
    expect(normalizeDoseUnitForEntry(' gram ')).toBe('g');
    expect(normalizeDoseUnitForEntry('ounce')).toBe('g');
    expect(normalizeDoseUnitForEntry(undefined)).toBe('g');
  });

  it('normalizes dose amounts including legacy ounce values', () => {
    expect(normalizeDoseAmountForEntry(2, 'g')).toBe(2);
    expect(normalizeDoseAmountForEntry(1, 'oz')).toBeCloseTo(28.3495, 4);
    expect(normalizeDoseAmountForEntry(Number.NaN, 'oz')).toBe(0);
    expect(normalizeDoseAmountForEntry(-4, 'g')).toBe(0);
  });

  it('converts timestamp-like values to safe Date objects', () => {
    const fromTimestamp = toEntryTimestampDate({
      toDate: () => new Date('2026-03-07T21:35:00.000Z'),
    } as never);

    expect(fromTimestamp.toISOString()).toBe('2026-03-07T21:35:00.000Z');

    const directDate = toEntryTimestampDate(new Date('2026-03-07T22:35:00.000Z'));
    expect(directDate.toISOString()).toBe('2026-03-07T22:35:00.000Z');

    const fallback = toEntryTimestampDate(undefined);
    expect(fallback instanceof Date).toBe(true);
    expect(Number.isNaN(fallback.getTime())).toBe(false);
  });
});
