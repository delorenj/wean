import React, { createContext, useEffect, useState, useCallback, ReactNode } from 'react';
import Purchases, {
  CustomerInfo,
  PurchasesOffering,
  LOG_LEVEL,
  PurchasesPackage,
} from 'react-native-purchases';
import { Platform } from 'react-native';

const REVENUECAT_API_KEY = 'test_tuPNhqfNktYarhJUIrxbmJTwSfj';
const ENTITLEMENT_ID = 'Wean Pro';

interface RevenueCatContextType {
  customerInfo: CustomerInfo | null;
  offerings: PurchasesOffering | null;
  isProUser: boolean;
  isLoading: boolean;
  error: string | null;
  purchasePackage: (pkg: PurchasesPackage) => Promise<{ customerInfo: CustomerInfo; success: boolean }>;
  restorePurchases: () => Promise<CustomerInfo>;
  refreshCustomerInfo: () => Promise<void>;
}

export const RevenueCatContext = createContext<RevenueCatContextType | null>(null);

interface RevenueCatProviderProps {
  children: ReactNode;
}

export const RevenueCatProvider: React.FC<RevenueCatProviderProps> = ({ children }) => {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user has Pro entitlement
  const isProUser = customerInfo?.entitlements.active[ENTITLEMENT_ID] !== undefined;

  // Initialize RevenueCat SDK
  useEffect(() => {
    const initializeRevenueCat = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Configure SDK with API key
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);

        if (Platform.OS === 'ios') {
          Purchases.configure({ apiKey: REVENUECAT_API_KEY });
        } else if (Platform.OS === 'android') {
          Purchases.configure({ apiKey: REVENUECAT_API_KEY });
        } else {
          // Web platform - RevenueCat doesn't support web
          console.warn('RevenueCat is not supported on web platform');
          setIsLoading(false);
          return;
        }

        // Get initial customer info
        const info = await Purchases.getCustomerInfo();
        setCustomerInfo(info);

        // Fetch available offerings
        const availableOfferings = await Purchases.getOfferings();
        if (availableOfferings.current) {
          setOfferings(availableOfferings.current);
        } else {
          console.warn('No current offering found');
        }

        // Set up listener for customer info updates
        Purchases.addCustomerInfoUpdateListener((info) => {
          setCustomerInfo(info);
        });

      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Failed to initialize RevenueCat';
        console.error('RevenueCat initialization error:', errorMessage);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    initializeRevenueCat();

    // Cleanup listener on unmount
    return () => {
      // RevenueCat listener cleanup is handled automatically
    };
  }, []);

  // Purchase a package
  const purchasePackage = useCallback(async (pkg: PurchasesPackage) => {
    try {
      setError(null);
      const { customerInfo: updatedInfo } = await Purchases.purchasePackage(pkg);
      setCustomerInfo(updatedInfo);
      return { customerInfo: updatedInfo, success: true };
    } catch (e: any) {
      // Handle user cancellation
      if (e.userCancelled) {
        console.log('User cancelled purchase');
        return { customerInfo: customerInfo!, success: false };
      }

      const errorMessage = e.message || 'Purchase failed';
      console.error('Purchase error:', errorMessage);
      setError(errorMessage);
      throw e;
    }
  }, [customerInfo]);

  // Restore purchases
  const restorePurchases = useCallback(async () => {
    try {
      setError(null);
      const info = await Purchases.restorePurchases();
      setCustomerInfo(info);
      return info;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to restore purchases';
      console.error('Restore purchases error:', errorMessage);
      setError(errorMessage);
      throw e;
    }
  }, []);

  // Refresh customer info
  const refreshCustomerInfo = useCallback(async () => {
    try {
      setError(null);
      const info = await Purchases.getCustomerInfo();
      setCustomerInfo(info);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to refresh customer info';
      console.error('Refresh customer info error:', errorMessage);
      setError(errorMessage);
    }
  }, []);

  return (
    <RevenueCatContext.Provider
      value={{
        customerInfo,
        offerings,
        isProUser,
        isLoading,
        error,
        purchasePackage,
        restorePurchases,
        refreshCustomerInfo,
      }}
    >
      {children}
    </RevenueCatContext.Provider>
  );
};
