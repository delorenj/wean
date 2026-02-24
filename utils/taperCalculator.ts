/**
 * Taper Algorithm - Core Product Logic
 * 
 * Generates personalized tapering schedules to help users gradually
 * reduce substance intake safely and sustainably.
 */

export interface TaperScheduleDay {
  day: number;
  targetDose: number;
}

export interface TaperScheduleOptions {
  currentDailyDose: number;
  targetDose: number;
  timelineDays: number;
  minimumReductionPerDay?: number;
  unit?: string;
}

export interface TaperSchedule {
  schedule: TaperScheduleDay[];
  totalReduction: number;
  averageReductionPerDay: number;
  unit: string;
}

/**
 * Validates taper schedule inputs
 * @throws Error if inputs are invalid
 */
function validateTaperInputs(options: TaperScheduleOptions): void {
  const { currentDailyDose, targetDose, timelineDays, minimumReductionPerDay } = options;

  if (typeof currentDailyDose !== 'number' || isNaN(currentDailyDose) || currentDailyDose < 0) {
    throw new Error('Current daily dose must be a non-negative number');
  }

  if (typeof targetDose !== 'number' || isNaN(targetDose) || targetDose < 0) {
    throw new Error('Target dose must be a non-negative number');
  }

  if (targetDose > currentDailyDose) {
    throw new Error('Target dose cannot be greater than current dose');
  }

  if (typeof timelineDays !== 'number' || isNaN(timelineDays) || timelineDays < 1) {
    throw new Error('Timeline must be at least 1 day');
  }

  if (!Number.isInteger(timelineDays)) {
    throw new Error('Timeline must be a whole number of days');
  }

  if (minimumReductionPerDay !== undefined) {
    if (typeof minimumReductionPerDay !== 'number' || isNaN(minimumReductionPerDay) || minimumReductionPerDay < 0) {
      throw new Error('Minimum reduction per day must be a non-negative number');
    }
  }
}

/**
 * Generates a linear taper schedule
 * 
 * Creates a day-by-day dose reduction plan using linear interpolation.
 * This is the foundational algorithm - more sophisticated strategies
 * (exponential, custom curves) can be added later.
 * 
 * @param options - Taper configuration
 * @returns Complete taper schedule with daily targets
 * 
 * @example
 * ```typescript
 * const schedule = generateLinearTaperSchedule({
 *   currentDailyDose: 20,
 *   targetDose: 0,
 *   timelineDays: 30,
 *   unit: 'g'
 * });
 * // Returns 30-day schedule reducing from 20g to 0g
 * ```
 */
export function generateLinearTaperSchedule(
  options: TaperScheduleOptions
): TaperSchedule {
  validateTaperInputs(options);

  const {
    currentDailyDose,
    targetDose,
    timelineDays,
    unit = 'g'
  } = options;

  // Edge case: already at target
  if (currentDailyDose === targetDose) {
    return {
      schedule: [{ day: 1, targetDose: currentDailyDose }],
      totalReduction: 0,
      averageReductionPerDay: 0,
      unit
    };
  }

  const totalReduction = currentDailyDose - targetDose;
  const reductionPerDay = totalReduction / timelineDays;

  const schedule: TaperScheduleDay[] = [];

  for (let day = 1; day <= timelineDays; day++) {
    // Linear interpolation
    const targetDoseForDay = currentDailyDose - (reductionPerDay * day);
    
    // Safety floor: never go below target
    const safeDose = Math.max(targetDoseForDay, targetDose);
    
    // Round to 2 decimal places for practical dosing
    const roundedDose = Math.round(safeDose * 100) / 100;

    schedule.push({
      day,
      targetDose: roundedDose
    });
  }

  return {
    schedule,
    totalReduction,
    averageReductionPerDay: reductionPerDay,
    unit
  };
}

/**
 * Calculates the target dose for a specific day in the taper schedule
 * 
 * Useful for quick lookups without generating the full schedule.
 * 
 * @param day - Day number (1-indexed)
 * @param options - Taper configuration
 * @returns Target dose for the specified day
 */
export function getTargetDoseForDay(
  day: number,
  options: TaperScheduleOptions
): number {
  if (day < 1 || !Number.isInteger(day)) {
    throw new Error('Day must be a positive integer');
  }

  validateTaperInputs(options);

  const { currentDailyDose, targetDose, timelineDays } = options;

  // Beyond timeline, return target dose
  if (day > timelineDays) {
    return targetDose;
  }

  if (currentDailyDose === targetDose) {
    return currentDailyDose;
  }

  const totalReduction = currentDailyDose - targetDose;
  const reductionPerDay = totalReduction / timelineDays;
  const targetDoseForDay = currentDailyDose - (reductionPerDay * day);
  
  const safeDose = Math.max(targetDoseForDay, targetDose);
  return Math.round(safeDose * 100) / 100;
}

/**
 * Calculates progress through a taper schedule
 * 
 * @param currentDose - User's actual current dose
 * @param options - Original taper configuration
 * @returns Progress percentage (0-100)
 */
export function calculateTaperProgress(
  currentDose: number,
  options: TaperScheduleOptions
): number {
  validateTaperInputs(options);

  const { currentDailyDose, targetDose } = options;

  if (currentDailyDose === targetDose) {
    return 100;
  }

  const totalReduction = currentDailyDose - targetDose;
  const reductionAchieved = currentDailyDose - currentDose;
  
  const progress = (reductionAchieved / totalReduction) * 100;
  
  // Clamp between 0 and 100
  return Math.max(0, Math.min(100, Math.round(progress * 10) / 10));
}
