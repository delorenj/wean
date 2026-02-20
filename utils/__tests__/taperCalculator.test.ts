import {
  generateLinearTaperSchedule,
  getTargetDoseForDay,
  calculateTaperProgress,
  TaperScheduleOptions
} from '../taperCalculator';

describe('taperCalculator', () => {
  describe('generateLinearTaperSchedule', () => {
    describe('happy path', () => {
      it('generates correct 30-day taper from 20g to 0g', () => {
        const options: TaperScheduleOptions = {
          currentDailyDose: 20,
          targetDose: 0,
          timelineDays: 30
        };

        const result = generateLinearTaperSchedule(options);

        expect(result.schedule).toHaveLength(30);
        expect(result.schedule[0].day).toBe(1);
        expect(result.schedule[0].targetDose).toBeCloseTo(19.33, 2);
        expect(result.schedule[29].day).toBe(30);
        expect(result.schedule[29].targetDose).toBe(0);
        expect(result.totalReduction).toBe(20);
        expect(result.averageReductionPerDay).toBeCloseTo(0.667, 3);
        expect(result.unit).toBe('g');
      });

      it('generates correct 14-day taper from 10g to 2g', () => {
        const options: TaperScheduleOptions = {
          currentDailyDose: 10,
          targetDose: 2,
          timelineDays: 14,
          unit: 'grams'
        };

        const result = generateLinearTaperSchedule(options);

        expect(result.schedule).toHaveLength(14);
        expect(result.schedule[0].targetDose).toBeCloseTo(9.43, 2);
        expect(result.schedule[13].targetDose).toBe(2);
        expect(result.totalReduction).toBe(8);
        expect(result.unit).toBe('grams');
      });

      it('ensures doses decrease monotonically', () => {
        const options: TaperScheduleOptions = {
          currentDailyDose: 25,
          targetDose: 0,
          timelineDays: 50
        };

        const result = generateLinearTaperSchedule(options);

        for (let i = 1; i < result.schedule.length; i++) {
          expect(result.schedule[i].targetDose).toBeLessThanOrEqual(
            result.schedule[i - 1].targetDose
          );
        }
      });

      it('uses default unit when not specified', () => {
        const options: TaperScheduleOptions = {
          currentDailyDose: 5,
          targetDose: 0,
          timelineDays: 10
        };

        const result = generateLinearTaperSchedule(options);
        expect(result.unit).toBe('g');
      });
    });

    describe('edge cases', () => {
      it('handles 1-day taper', () => {
        const options: TaperScheduleOptions = {
          currentDailyDose: 10,
          targetDose: 5,
          timelineDays: 1
        };

        const result = generateLinearTaperSchedule(options);

        expect(result.schedule).toHaveLength(1);
        expect(result.schedule[0].targetDose).toBe(5);
      });

      it('handles same current and target dose', () => {
        const options: TaperScheduleOptions = {
          currentDailyDose: 5,
          targetDose: 5,
          timelineDays: 10
        };

        const result = generateLinearTaperSchedule(options);

        expect(result.schedule).toHaveLength(1);
        expect(result.schedule[0].targetDose).toBe(5);
        expect(result.totalReduction).toBe(0);
        expect(result.averageReductionPerDay).toBe(0);
      });

      it('handles very long taper (365 days)', () => {
        const options: TaperScheduleOptions = {
          currentDailyDose: 100,
          targetDose: 0,
          timelineDays: 365
        };

        const result = generateLinearTaperSchedule(options);

        expect(result.schedule).toHaveLength(365);
        expect(result.schedule[0].targetDose).toBeCloseTo(99.73, 2);
        expect(result.schedule[364].targetDose).toBe(0);
      });

      it('handles decimal doses', () => {
        const options: TaperScheduleOptions = {
          currentDailyDose: 2.5,
          targetDose: 0.5,
          timelineDays: 10
        };

        const result = generateLinearTaperSchedule(options);

        expect(result.schedule[0].targetDose).toBeCloseTo(2.3, 1);
        expect(result.schedule[9].targetDose).toBe(0.5);
      });

      it('rounds doses to 2 decimal places', () => {
        const options: TaperScheduleOptions = {
          currentDailyDose: 10,
          targetDose: 0,
          timelineDays: 7
        };

        const result = generateLinearTaperSchedule(options);

        result.schedule.forEach(day => {
          const decimalPlaces = (day.targetDose.toString().split('.')[1] || '').length;
          expect(decimalPlaces).toBeLessThanOrEqual(2);
        });
      });

      it('never goes below target dose (safety floor)', () => {
        const options: TaperScheduleOptions = {
          currentDailyDose: 10,
          targetDose: 2,
          timelineDays: 20
        };

        const result = generateLinearTaperSchedule(options);

        result.schedule.forEach(day => {
          expect(day.targetDose).toBeGreaterThanOrEqual(2);
        });
      });
    });

    describe('validation', () => {
      it('rejects negative current dose', () => {
        expect(() => {
          generateLinearTaperSchedule({
            currentDailyDose: -5,
            targetDose: 0,
            timelineDays: 10
          });
        }).toThrow('Current daily dose must be a non-negative number');
      });

      it('rejects NaN current dose', () => {
        expect(() => {
          generateLinearTaperSchedule({
            currentDailyDose: NaN,
            targetDose: 0,
            timelineDays: 10
          });
        }).toThrow('Current daily dose must be a non-negative number');
      });

      it('rejects negative target dose', () => {
        expect(() => {
          generateLinearTaperSchedule({
            currentDailyDose: 10,
            targetDose: -2,
            timelineDays: 10
          });
        }).toThrow('Target dose must be a non-negative number');
      });

      it('rejects target dose greater than current dose', () => {
        expect(() => {
          generateLinearTaperSchedule({
            currentDailyDose: 5,
            targetDose: 10,
            timelineDays: 10
          });
        }).toThrow('Target dose cannot be greater than current dose');
      });

      it('rejects zero timeline', () => {
        expect(() => {
          generateLinearTaperSchedule({
            currentDailyDose: 10,
            targetDose: 0,
            timelineDays: 0
          });
        }).toThrow('Timeline must be at least 1 day');
      });

      it('rejects negative timeline', () => {
        expect(() => {
          generateLinearTaperSchedule({
            currentDailyDose: 10,
            targetDose: 0,
            timelineDays: -5
          });
        }).toThrow('Timeline must be at least 1 day');
      });

      it('rejects non-integer timeline', () => {
        expect(() => {
          generateLinearTaperSchedule({
            currentDailyDose: 10,
            targetDose: 0,
            timelineDays: 7.5
          });
        }).toThrow('Timeline must be a whole number of days');
      });

      it('rejects negative minimum reduction', () => {
        expect(() => {
          generateLinearTaperSchedule({
            currentDailyDose: 10,
            targetDose: 0,
            timelineDays: 10,
            minimumReductionPerDay: -1
          });
        }).toThrow('Minimum reduction per day must be a non-negative number');
      });
    });
  });

  describe('getTargetDoseForDay', () => {
    const baseOptions: TaperScheduleOptions = {
      currentDailyDose: 20,
      targetDose: 0,
      timelineDays: 30
    };

    it('returns correct dose for day 1', () => {
      const dose = getTargetDoseForDay(1, baseOptions);
      expect(dose).toBeCloseTo(19.33, 2);
    });

    it('returns correct dose for day 15', () => {
      const dose = getTargetDoseForDay(15, baseOptions);
      expect(dose).toBeCloseTo(10, 1);
    });

    it('returns correct dose for day 30 (last day)', () => {
      const dose = getTargetDoseForDay(30, baseOptions);
      expect(dose).toBe(0);
    });

    it('returns target dose for days beyond timeline', () => {
      const dose = getTargetDoseForDay(50, baseOptions);
      expect(dose).toBe(0);
    });

    it('returns same dose when current equals target', () => {
      const dose = getTargetDoseForDay(5, {
        currentDailyDose: 10,
        targetDose: 10,
        timelineDays: 10
      });
      expect(dose).toBe(10);
    });

    it('rejects day less than 1', () => {
      expect(() => {
        getTargetDoseForDay(0, baseOptions);
      }).toThrow('Day must be a positive integer');
    });

    it('rejects non-integer day', () => {
      expect(() => {
        getTargetDoseForDay(5.5, baseOptions);
      }).toThrow('Day must be a positive integer');
    });

    it('validates taper options', () => {
      expect(() => {
        getTargetDoseForDay(5, {
          currentDailyDose: -10,
          targetDose: 0,
          timelineDays: 10
        });
      }).toThrow('Current daily dose must be a non-negative number');
    });
  });

  describe('calculateTaperProgress', () => {
    const baseOptions: TaperScheduleOptions = {
      currentDailyDose: 20,
      targetDose: 0,
      timelineDays: 30
    };

    it('returns 0% at start (current dose = starting dose)', () => {
      const progress = calculateTaperProgress(20, baseOptions);
      expect(progress).toBe(0);
    });

    it('returns 50% at halfway point', () => {
      const progress = calculateTaperProgress(10, baseOptions);
      expect(progress).toBe(50);
    });

    it('returns 100% at target', () => {
      const progress = calculateTaperProgress(0, baseOptions);
      expect(progress).toBe(100);
    });

    it('returns 100% when current and target are the same', () => {
      const progress = calculateTaperProgress(10, {
        currentDailyDose: 10,
        targetDose: 10,
        timelineDays: 10
      });
      expect(progress).toBe(100);
    });

    it('clamps progress at 100% if user goes below target', () => {
      const progress = calculateTaperProgress(-5, baseOptions);
      expect(progress).toBe(100);
    });

    it('clamps progress at 0% if user increases dose', () => {
      const progress = calculateTaperProgress(25, baseOptions);
      expect(progress).toBe(0);
    });

    it('rounds to 1 decimal place', () => {
      const progress = calculateTaperProgress(13.333, baseOptions);
      expect(progress).toBeCloseTo(33.3, 1);
    });

    it('validates taper options', () => {
      expect(() => {
        calculateTaperProgress(5, {
          currentDailyDose: 10,
          targetDose: 20,
          timelineDays: 10
        });
      }).toThrow('Target dose cannot be greater than current dose');
    });
  });

  describe('math invariants', () => {
    it('schedule length always equals timeline', () => {
      const timelines = [1, 7, 14, 30, 90, 365];
      
      timelines.forEach(days => {
        const result = generateLinearTaperSchedule({
          currentDailyDose: 20,
          targetDose: 0,
          timelineDays: days
        });
        
        expect(result.schedule).toHaveLength(days);
      });
    });

    it('total reduction equals current minus target', () => {
      const result = generateLinearTaperSchedule({
        currentDailyDose: 17.5,
        targetDose: 3.2,
        timelineDays: 20
      });

      expect(result.totalReduction).toBeCloseTo(14.3, 1);
    });

    it('average reduction times timeline equals total reduction', () => {
      const result = generateLinearTaperSchedule({
        currentDailyDose: 30,
        targetDose: 6,
        timelineDays: 40
      });

      const calculatedTotal = result.averageReductionPerDay * 40;
      expect(calculatedTotal).toBeCloseTo(result.totalReduction, 5);
    });

    it('first day dose is less than current dose', () => {
      const result = generateLinearTaperSchedule({
        currentDailyDose: 15,
        targetDose: 0,
        timelineDays: 10
      });

      expect(result.schedule[0].targetDose).toBeLessThan(15);
    });

    it('last day dose equals target dose', () => {
      const tests = [
        { current: 20, target: 0, days: 30 },
        { current: 10, target: 2, days: 14 },
        { current: 5.5, target: 1.2, days: 7 }
      ];

      tests.forEach(test => {
        const result = generateLinearTaperSchedule({
          currentDailyDose: test.current,
          targetDose: test.target,
          timelineDays: test.days
        });

        const lastDay = result.schedule[result.schedule.length - 1];
        expect(lastDay.targetDose).toBe(test.target);
      });
    });
  });
});
