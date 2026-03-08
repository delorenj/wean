interface DoseLike {
  id?: string;
}

export interface OptimisticDeleteResult<T extends DoseLike> {
  nextDoses: T[];
  removedDose: T | null;
  removedDoseIndex: number;
}

export const applyOptimisticDoseDelete = <T extends DoseLike>(
  doses: T[],
  doseId: string
): OptimisticDeleteResult<T> => {
  if (!doseId) {
    return {
      nextDoses: doses,
      removedDose: null,
      removedDoseIndex: -1,
    };
  }

  const removedDoseIndex = doses.findIndex((dose) => dose.id === doseId);

  if (removedDoseIndex === -1) {
    return {
      nextDoses: doses,
      removedDose: null,
      removedDoseIndex: -1,
    };
  }

  return {
    nextDoses: doses.filter((dose) => dose.id !== doseId),
    removedDose: doses[removedDoseIndex],
    removedDoseIndex,
  };
};

export const rollbackOptimisticDoseDelete = <T extends DoseLike>(
  doses: T[],
  removedDose: T | null,
  removedDoseIndex: number
): T[] => {
  if (!removedDose || removedDoseIndex < 0) {
    return doses;
  }

  const doseExists = doses.some((dose) => dose.id === removedDose.id);

  if (doseExists) {
    return doses;
  }

  if (removedDoseIndex >= doses.length) {
    return [...doses, removedDose];
  }

  return [
    ...doses.slice(0, removedDoseIndex),
    removedDose,
    ...doses.slice(removedDoseIndex),
  ];
};
