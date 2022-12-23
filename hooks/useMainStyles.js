import {StyleSheet} from "react-native";
import {useMemo} from "react";

export const useMainStyles = theme => {
  return useMemo(() => {
    return StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: theme.colors.background,

      },
    });
  }, [theme])
}
