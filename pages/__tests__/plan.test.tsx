/**
 * Plan Page Integration Tests
 * 
 * Validates that the taper calculator is properly integrated.
 * Note: UI rendering tests require @testing-library/react-native
 * which is not yet installed. These tests verify the integration logic.
 */

import { generateLinearTaperSchedule } from '../../utils/taperCalculator';

describe('PlanPage Integration Logic', () => {
  describe('default sample schedule', () => {
    const sampleSchedule = generateLinearTaperSchedule({
      currentDailyDose: 20,
      targetDose: 0,
      timelineDays: 30,
      unit: 'g'
    });

    it('generates correct sample data for plan page', () => {
      expect(sampleSchedule.schedule).toHaveLength(30);
      expect(sampleSchedule.totalReduction).toBe(20);
      expect(sampleSchedule.unit).toBe('g');
    });

    it('has correct first day for display', () => {
      const firstDay = sampleSchedule.schedule[0];
      expect(firstDay.day).toBe(1);
      expect(firstDay.targetDose).toBeCloseTo(19.33, 2);
    });

    it('has correct last day for display', () => {
      const lastDay = sampleSchedule.schedule[29];
      expect(lastDay.day).toBe(30);
      expect(lastDay.targetDose).toBe(0);
    });

    it('provides preview slice (first 7 days)', () => {
      const previewDays = sampleSchedule.schedule.slice(0, 7);
      expect(previewDays).toHaveLength(7);
      
      // Verify sequential days
      previewDays.forEach((day, index) => {
        expect(day.day).toBe(index + 1);
      });
    });

    it('calculates daily reduction for summary display', () => {
      const dailyReduction = sampleSchedule.averageReductionPerDay;
      expect(dailyReduction).toBeCloseTo(0.667, 3);
      
      // Format check for UI display
      const formattedReduction = dailyReduction.toFixed(2);
      expect(formattedReduction).toBe('0.67');
    });

    it('calculates total reduction for summary display', () => {
      const totalReduction = sampleSchedule.totalReduction;
      expect(totalReduction).toBe(20);
      
      // Format check for UI display
      const formattedTotal = totalReduction.toFixed(2);
      expect(formattedTotal).toBe('20.00');
    });

    it('provides overflow count for schedule preview', () => {
      const visibleDays = 7;
      const totalDays = sampleSchedule.schedule.length;
      const hiddenDays = totalDays - visibleDays;
      
      expect(hiddenDays).toBe(23);
    });
  });

  describe('edge cases for UI integration', () => {
    it('handles very short timelines', () => {
      const schedule = generateLinearTaperSchedule({
        currentDailyDose: 10,
        targetDose: 5,
        timelineDays: 3,
        unit: 'mg'
      });

      // All days visible, no overflow
      const visibleDays = Math.min(schedule.schedule.length, 7);
      expect(visibleDays).toBe(3);
      expect(schedule.schedule.length - visibleDays).toBe(0);
    });

    it('handles exactly 7 days (no overflow indicator)', () => {
      const schedule = generateLinearTaperSchedule({
        currentDailyDose: 14,
        targetDose: 0,
        timelineDays: 7,
        unit: 'g'
      });

      expect(schedule.schedule.length).toBe(7);
      const overflowCount = Math.max(0, schedule.schedule.length - 7);
      expect(overflowCount).toBe(0);
    });

    it('formats decimal doses correctly for display', () => {
      const schedule = generateLinearTaperSchedule({
        currentDailyDose: 2.5,
        targetDose: 0.5,
        timelineDays: 10,
        unit: 'g'
      });

      // All doses should be formatted to 2 decimal places max
      schedule.schedule.forEach(day => {
        const formatted = day.targetDose.toString();
        const decimalPart = formatted.split('.')[1];
        if (decimalPart) {
          expect(decimalPart.length).toBeLessThanOrEqual(2);
        }
      });
    });
  });

  describe('data transformation for UI', () => {
    it('provides all necessary data for summary card', () => {
      const input = {
        currentDailyDose: 15,
        targetDose: 3,
        timelineDays: 21,
        unit: 'mg'
      };

      const schedule = generateLinearTaperSchedule(input);

      // Verify all summary fields are available
      expect(schedule.totalReduction).toBeDefined();
      expect(schedule.averageReductionPerDay).toBeDefined();
      expect(schedule.unit).toBeDefined();
      expect(schedule.schedule.length).toBe(input.timelineDays);

      // Verify derivable fields
      const startingDose = input.currentDailyDose;
      const targetDose = input.targetDose;
      expect(startingDose - targetDose).toBe(schedule.totalReduction);
    });

    it('provides data for list items with icons', () => {
      const schedule = generateLinearTaperSchedule({
        currentDailyDose: 20,
        targetDose: 0,
        timelineDays: 30,
        unit: 'g'
      });

      const previewDays = schedule.schedule.slice(0, 7);

      previewDays.forEach(day => {
        // Each day has all fields needed for List.Item
        expect(day.day).toBeDefined();
        expect(day.targetDose).toBeDefined();
        
        // Can construct title
        const title = `Day ${day.day}`;
        expect(title).toMatch(/^Day \d+$/);
        
        // Can construct description
        const description = `Target: ${day.targetDose} ${schedule.unit}`;
        expect(description).toMatch(/^Target: [\d.]+ g$/);
      });
    });
  });
});
