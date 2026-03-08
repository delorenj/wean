import { StyleSheet } from 'react-native';
import { useMemo } from 'react';

export const useMainStyles = (theme) => {
  return useMemo(
    () =>
      StyleSheet.create({
        safeAreaView: {
          flex: 1,
          backgroundColor: theme.colors.background,
        },
        container: {
          flex: 1,
          backgroundColor: theme.colors.surface,
        },
        card: {
          padding: 16,
          marginTop: 16,
          marginHorizontal: 16,
          borderRadius: 14,
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outlineVariant,
          borderWidth: 1,
        },
      }),
    [theme]
  );
};
