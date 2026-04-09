import {
  adjustDoseAmount,
  adjustTimestampByMinutes,
  clampDoseAmount,
  convertDoseAmount,
  formatDoseInput,
  formatEntryTimestampLabel,
  parseDoseAmount,
  validateDoseAmount,
  validateDoseEntry,
  validateTimestamp,
} from './helpers';

describe('QuickDoseEntry helpers', () => {
  describe('parseDoseAmount', () => {
    it('parses decimal and comma-formatted input', () => {
      expect(parseDoseAmount('1.5')).toBe(1.5);
      expect(parseDoseAmount('1,5')).toBe(1.5);
    });

    it('returns null for invalid input', () => {
      expect(parseDoseAmount('')).toBeNull();
      expect(parseDoseAmount('abc')).toBeNull();
      expect(parseDoseAmount(Number.NaN)).toBeNull();
    });
  });

  describe('dose math helpers', () => {
    it('clamps and adjusts gram doses using fine-grained steps', () => {
      expect(clampDoseAmount(-2, 'g')).toBe(0);
      expect(adjustDoseAmount(1, 'increment', 'g')).toBe(1.1);
      expect(adjustDoseAmount(1, 'decrement', 'g')).toBe(0.9);
    });

    it('clamps and adjusts milligram doses using larger steps', () => {
      expect(adjustDoseAmount(100, 'increment', 'mg')).toBe(150);
      expect(adjustDoseAmount(100, 'decrement', 'mg')).toBe(50);
      expect(adjustDoseAmount(0, 'decrement', 'mg')).toBe(0);
    });

    it('converts doses between units', () => {
      expect(convertDoseAmount(1.5, 'g', 'mg')).toBe(1500);
      expect(convertDoseAmount(1500, 'mg', 'g')).toBe(1.5);
    });

    it('formats input strings by unit precision', () => {
      expect(formatDoseInput(1.25, 'g')).toBe('1.25');
      expect(formatDoseInput(1250.7, 'mg')).toBe('1251');
    });
  });

  describe('validation', () => {
    it('rejects invalid, negative, and unreasonably large doses', () => {
      expect(validateDoseAmount(Number.NaN, 'g')).toBe('Enter a valid dose amount.');
      expect(validateDoseAmount(-1, 'g')).toBe('Dose amount must be greater than 0.');
      expect(validateDoseAmount(100.1, 'g')).toBe('Dose amount looks too high for g.');
    });

    it('rejects timestamps far in the future', () => {
      const now = new Date('2026-03-07T21:35:00.000Z');
      const farFuture = new Date('2026-03-07T21:50:30.000Z');

      expect(validateTimestamp(farFuture, now)).toBe('Timestamp cannot be in the future.');
      expect(validateTimestamp(new Date('2026-03-07T21:39:00.000Z'), now)).toBeUndefined();
    });

    it('returns full validation status for dose entry payloads', () => {
      const now = new Date('2026-03-07T21:35:00.000Z');

      expect(
        validateDoseEntry({
          amount: 1.2,
          unit: 'g',
          timestamp: new Date('2026-03-07T21:33:00.000Z'),
          now,
        })
      ).toEqual({
        isValid: true,
        amountError: undefined,
        timestampError: undefined,
      });

      expect(
        validateDoseEntry({
          amount: 0,
          unit: 'g',
          timestamp: new Date('2026-03-07T21:33:00.000Z'),
          now,
        })
      ).toEqual({
        isValid: false,
        amountError: 'Dose amount must be greater than 0.',
        timestampError: undefined,
      });
    });
  });

  describe('timestamp helpers', () => {
    it('adjusts timestamps by minute delta', () => {
      const timestamp = new Date('2026-03-07T21:35:00.000Z');

      expect(adjustTimestampByMinutes(timestamp, -15).toISOString()).toBe('2026-03-07T21:20:00.000Z');
      expect(adjustTimestampByMinutes(timestamp, 15).toISOString()).toBe('2026-03-07T21:50:00.000Z');
    });

    it('formats timestamp labels safely', () => {
      const timestamp = new Date('2026-03-07T21:35:00.000Z');
      const label = formatEntryTimestampLabel(timestamp, 'en-US');

      expect(typeof label).toBe('string');
      expect(label.length).toBeGreaterThan(0);
      expect(formatEntryTimestampLabel(new Date('invalid'))).toBe('Invalid time');
    });
  });
});
