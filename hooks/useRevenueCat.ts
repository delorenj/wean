import { useContext } from 'react';
import { RevenueCatContext } from '../context/revenueCatProvider';

/**
 * Hook to access RevenueCat subscription functionality
 *
 * @example
 * const { isProUser, offerings, purchasePackage } = useRevenueCat();
 *
 * // Check if user has Pro subscription
 * if (isProUser) {
 *   // Show pro features
 * }
 *
 * // Purchase a package
 * const monthlyPackage = offerings?.availablePackages.find(p => p.identifier === '$rc_monthly');
 * if (monthlyPackage) {
 *   await purchasePackage(monthlyPackage);
 * }
 */
export const useRevenueCat = () => {
  const context = useContext(RevenueCatContext);

  if (!context) {
    throw new Error('useRevenueCat must be used within a RevenueCatProvider');
  }

  return context;
};

export default useRevenueCat;
