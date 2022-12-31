import {StyleSheet} from "react-native";
import {useMemo} from "react";
import {MD3Colors} from "react-native-paper";

export const useMainStyles = theme => {
  return useMemo(() => {
    return StyleSheet.create({
      container: {
        backgroundColor: theme.colors.surface,

      },
    });
  }, [theme])
}
