import {Colors} from "react-native/Libraries/NewAppScreen";

export const mediumSeaGreen = '#58BC82';
export const lightGreen = '#8FE388';
export const darkJungleGreen = '#1C2321';
export const rufousRed = '#A50104';
export const selectiveYellow = '#FCBA04';

const mainColorScheme = {
  primary: mediumSeaGreen,
  lightPrimary: lightGreen,
  secondary: selectiveYellow,
  tertiary: rufousRed,
  white: Colors.white,
  black: darkJungleGreen,
};

export const mainTheme = {
  colors: {
    primary: '#58BC82',
    secondary: mainColorScheme.secondary,
    white: mainColorScheme.white
  }
}
