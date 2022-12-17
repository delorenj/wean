import { Color } from 'expo';
import {Colors} from "react-native/Libraries/NewAppScreen";

export const mediumSeaGreen = new Color('#58BC82');
export const lightGreen = new Color('#8FE388');
export const darkJungleGreen = new Color('#1C2321');
export const rufousRed = new Color('#A50104');
export const selectiveYellow = new Color('#FCBA04');

const colorScheme = {
  primary: mediumSeaGreen,
  lightPrimary: lightGreen,
  secondary: selectiveYellow,
  tertiary: rufousRed,
  white: Colors.white,
  black: darkJungleGreen,
};

export const mainTheme = {
  colors: {
    primary: colorScheme.primary,
    secondary: colorScheme.secondary,
    white: colorScheme.white
  }
}
