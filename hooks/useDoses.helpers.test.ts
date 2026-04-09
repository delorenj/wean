import {
  applyOptimisticDoseDelete,
  rollbackOptimisticDoseDelete,
} from './useDoses.helpers';

interface MockDose {
  id?: string;
  amount: number;
}

describe('useDoses.helpers', () => {
  const doses: MockDose[] = [
    { id: 'dose-1', amount: 1 },
    { id: 'dose-2', amount: 2 },
    { id: 'dose-3', amount: 3 },
  ];

  it('removes a dose optimistically and returns rollback metadata', () => {
    const result = applyOptimisticDoseDelete(doses, 'dose-2');

    expect(result.nextDoses).toEqual([
      { id: 'dose-1', amount: 1 },
      { id: 'dose-3', amount: 3 },
    ]);
    expect(result.removedDose).toEqual({ id: 'dose-2', amount: 2 });
    expect(result.removedDoseIndex).toBe(1);
  });

  it('returns untouched data when dose id is missing', () => {
    const result = applyOptimisticDoseDelete(doses, '');

    expect(result.nextDoses).toBe(doses);
    expect(result.removedDose).toBeNull();
    expect(result.removedDoseIndex).toBe(-1);
  });

  it('rolls back a deleted dose at the original index', () => {
    const optimistic = applyOptimisticDoseDelete(doses, 'dose-2');

    const rolledBack = rollbackOptimisticDoseDelete(
      optimistic.nextDoses,
      optimistic.removedDose,
      optimistic.removedDoseIndex
    );

    expect(rolledBack).toEqual(doses);
  });

  it('skips rollback when removed dose already exists', () => {
    const rolledBack = rollbackOptimisticDoseDelete(
      doses,
      { id: 'dose-2', amount: 2 },
      1
    );

    expect(rolledBack).toBe(doses);
  });
});
