import {StyleSheet} from "react-native";
import {useMemo} from "react";

export const useMainStyles = theme => {
  return useMemo(() => {
    return StyleSheet.create({
      container: {
        backgroundColor: theme.colors.surface,
      },
      card:{
        padding: 10,
        marginTop: 30,
        marginLeft: 10,
        marginRight: 10,
      },
    });
  }, [theme])
}
