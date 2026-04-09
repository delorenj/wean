import {
  clampOnboardingIndex,
  getNextOnboardingIndex,
  getOnboardingAnnouncement,
  isLastOnboardingScreen,
  ONBOARDING_SCREENS,
} from '../onboarding.helpers';

describe('onboarding helpers', () => {
  it('defines required onboarding screen titles in order', () => {
    expect(ONBOARDING_SCREENS.map((screen) => screen.title)).toEqual([
      'Track your doses effortlessly',
      'See your progress visually',
      'Create a personalized taper plan',
      "Let's log your first dose",
    ]);
  });

  it('clamps invalid screen indices safely', () => {
    expect(clampOnboardingIndex(-10)).toBe(0);
    expect(clampOnboardingIndex(999)).toBe(ONBOARDING_SCREENS.length - 1);
    expect(clampOnboardingIndex(Number.NaN)).toBe(0);
  });

  it('resolves next screen index without overflowing', () => {
    expect(getNextOnboardingIndex(0)).toBe(1);
    expect(getNextOnboardingIndex(1)).toBe(2);
    expect(getNextOnboardingIndex(ONBOARDING_SCREENS.length - 1)).toBe(ONBOARDING_SCREENS.length - 1);
  });

  it('identifies when the current screen is the final screen', () => {
    expect(isLastOnboardingScreen(0)).toBe(false);
    expect(isLastOnboardingScreen(2)).toBe(false);
    expect(isLastOnboardingScreen(3)).toBe(true);
    expect(isLastOnboardingScreen(99)).toBe(true);
  });

  it('builds screen-reader friendly announcements', () => {
    const firstAnnouncement = getOnboardingAnnouncement(0);
    expect(firstAnnouncement).toContain('Screen 1 of 4.');
    expect(firstAnnouncement).toContain('Track your doses effortlessly');

    const lastAnnouncement = getOnboardingAnnouncement(3);
    expect(lastAnnouncement).toContain('Screen 4 of 4.');
    expect(lastAnnouncement).toContain("Let's log your first dose");
  });
});
