type OnboardingResetListener = () => void;

const onboardingResetListeners = new Set<OnboardingResetListener>();

export const subscribeToOnboardingReset = (listener: OnboardingResetListener): (() => void) => {
  onboardingResetListeners.add(listener);

  return () => {
    onboardingResetListeners.delete(listener);
  };
};

export const requestOnboardingReset = (): void => {
  onboardingResetListeners.forEach((listener) => {
    listener();
  });
};
