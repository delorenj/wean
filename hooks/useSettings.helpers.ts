export type ThemePreference = 'dark' | 'light';
export type DoseUnitPreference = 'g' | 'oz';
export type SortOrderPreference = 'newest' | 'oldest';

export interface Settings {
  theme: ThemePreference;
  defaultDoseUnit: DoseUnitPreference;
  sortOrder: SortOrderPreference;
  notificationsEnabled: boolean;
  reminderTimes: string[];
}

export interface PersistedSettingsDocument extends Settings {
  darkMode: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  defaultDoseUnit: 'g',
  sortOrder: 'newest',
  notificationsEnabled: false,
  reminderTimes: [],
};

const isThemePreference = (value: unknown): value is ThemePreference => {
  return value === 'dark' || value === 'light';
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

const resolveThemePreference = (theme: unknown, darkMode: unknown): ThemePreference => {
  if (isThemePreference(theme)) {
    return theme;
  }

  if (typeof darkMode === 'boolean') {
    return darkMode ? 'dark' : 'light';
  }

  return DEFAULT_SETTINGS.theme;
};

export const normalizeSettings = (value: unknown): Settings => {
  const input = typeof value === 'object' && value !== null
    ? (value as Partial<Settings> & { darkMode?: unknown })
    : {};

  return {
    theme: resolveThemePreference(input.theme, input.darkMode),
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

export const toSettingsDocument = (settings: Settings): PersistedSettingsDocument => {
  const normalized = normalizeSettings(settings);

  return {
    ...normalized,
    darkMode: normalized.theme === 'dark',
  };
};
