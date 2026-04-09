export interface OnboardingScreen {
  id: string;
  title: string;
  description: string;
  placeholderLabel: string;
  icon: string;
}

export const ONBOARDING_SCREENS: OnboardingScreen[] = [
  {
    id: 'track-doses',
    title: 'Track your doses effortlessly',
    description: 'Log each dose in seconds and keep your timeline clear and organized.',
    placeholderLabel: 'Dose tracker illustration placeholder',
    icon: 'notebook-plus-outline',
  },
  {
    id: 'visual-progress',
    title: 'See your progress visually',
    description: 'View trends and progress gauges so daily changes are easy to understand.',
    placeholderLabel: 'Progress gauge preview placeholder',
    icon: 'gauge',
  },
  {
    id: 'taper-plan',
    title: 'Create a personalized taper plan',
    description: 'Build a plan that matches your pace, with premium features ready when you are.',
    placeholderLabel: 'Premium taper planner teaser placeholder',
    icon: 'chart-line-variant',
  },
  {
    id: 'first-dose',
    title: "Let's log your first dose",
    description: 'Start now and begin building consistency from day one.',
    placeholderLabel: 'First dose call-to-action placeholder',
    icon: 'bottle-tonic-plus-outline',
  },
];

export const clampOnboardingIndex = (
  index: number,
  totalScreens: number = ONBOARDING_SCREENS.length,
): number => {
  if (totalScreens <= 0) {
    return 0;
  }

  if (!Number.isFinite(index)) {
    return 0;
  }

  return Math.min(Math.max(0, Math.floor(index)), totalScreens - 1);
};

export const getNextOnboardingIndex = (
  currentIndex: number,
  totalScreens: number = ONBOARDING_SCREENS.length,
): number => {
  const safeCurrentIndex = clampOnboardingIndex(currentIndex, totalScreens);
  return clampOnboardingIndex(safeCurrentIndex + 1, totalScreens);
};

export const isLastOnboardingScreen = (
  index: number,
  totalScreens: number = ONBOARDING_SCREENS.length,
): boolean => {
  if (totalScreens <= 0) {
    return true;
  }

  return clampOnboardingIndex(index, totalScreens) === totalScreens - 1;
};

export const getOnboardingAnnouncement = (
  index: number,
  screens: OnboardingScreen[] = ONBOARDING_SCREENS,
): string => {
  if (!Array.isArray(screens) || screens.length === 0) {
    return 'Welcome to Wean onboarding';
  }

  const safeIndex = clampOnboardingIndex(index, screens.length);
  const screen = screens[safeIndex];

  return `Screen ${safeIndex + 1} of ${screens.length}. ${screen.title}. ${screen.description}`;
};
