export type DoseUnitPreference = 'g' | 'oz';
export type SortOrderPreference = 'newest' | 'oldest';

export interface Settings {
  darkMode: boolean;
  defaultDoseUnit: DoseUnitPreference;
  sortOrder: SortOrderPreference;
  notificationsEnabled: boolean;
  reminderTimes: string[];
}

export const DEFAULT_SETTINGS: Settings = {
  darkMode: true,
  defaultDoseUnit: 'g',
  sortOrder: 'newest',
  notificationsEnabled: false,
  reminderTimes: [],
};

const isDoseUnitPreference = (value: unknown): value is DoseUnitPreference => {
  return value === 'g' || value === 'oz';
};

const isSortOrderPreference = (value: unknown): value is SortOrderPreference => {
  return value === 'newest' || value === 'oldest';
};

const normalizeReminderTimes = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return DEFAULT_SETTINGS.reminderTimes;
  }

  return value
    .filter((entry): entry is string => typeof entry === 'string')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
};

export const normalizeSettings = (value: unknown): Settings => {
  const input = typeof value === 'object' && value !== null
    ? (value as Partial<Settings>)
    : {};

  return {
    darkMode: typeof input.darkMode === 'boolean'
      ? input.darkMode
      : DEFAULT_SETTINGS.darkMode,
    defaultDoseUnit: isDoseUnitPreference(input.defaultDoseUnit)
      ? input.defaultDoseUnit
      : DEFAULT_SETTINGS.defaultDoseUnit,
    sortOrder: isSortOrderPreference(input.sortOrder)
      ? input.sortOrder
      : DEFAULT_SETTINGS.sortOrder,
    notificationsEnabled: typeof input.notificationsEnabled === 'boolean'
      ? input.notificationsEnabled
      : DEFAULT_SETTINGS.notificationsEnabled,
    reminderTimes: normalizeReminderTimes(input.reminderTimes),
  };
};

export const mergeSettings = (
  currentSettings: Settings,
  updates: Partial<Settings>
): Settings => {
  return normalizeSettings({
    ...currentSettings,
    ...updates,
  });
};
