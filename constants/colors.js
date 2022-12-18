import {Colors} from "react-native/Libraries/NewAppScreen";
import {MD3LightTheme, MD3DarkTheme} from "react-native-paper";
export const mediumSeaGreen = '#58BC82';
export const lightGreen = '#8FE388';
export const darkJungleGreen = '#1C2321';
export const rufousRed = '#A50104';
export const selectiveYellow = '#FCBA04';

export const customTheme = {
  ...MD3LightTheme,
  fonts: {
    regular: 'Helvetica Neue',
    medium: 'Helvetica Neue Light',
  },
  "colors": {
    "primary": "rgb(1, 110, 33)",
    "onPrimary": "rgb(255, 255, 255)",
    "primaryContainer": "rgb(153, 248, 153)",
    "onPrimaryContainer": "rgb(0, 33, 5)",
    "secondary": "rgb(82, 99, 79)",
    "onSecondary": "rgb(255, 255, 255)",
    "secondaryContainer": "rgb(213, 232, 207)",
    "onSecondaryContainer": "rgb(16, 31, 16)",
    "tertiary": "rgb(57, 101, 107)",
    "onTertiary": "rgb(255, 255, 255)",
    "tertiaryContainer": "rgb(188, 235, 241)",
    "onTertiaryContainer": "rgb(0, 31, 35)",
    "error": "rgb(186, 26, 26)",
    "onError": "rgb(255, 255, 255)",
    "errorContainer": "rgb(255, 218, 214)",
    "onErrorContainer": "rgb(65, 0, 2)",
    "background": "rgb(252, 253, 246)",
    "onBackground": "rgb(26, 28, 25)",
    "surface": "rgb(252, 253, 246)",
    "onSurface": "rgb(26, 28, 25)",
    "surfaceVariant": "rgb(222, 229, 217)",
    "onSurfaceVariant": "rgb(66, 73, 64)",
    "outline": "rgb(114, 121, 111)",
    "outlineVariant": "rgb(194, 201, 189)",
    "shadow": "rgb(0, 0, 0)",
    "scrim": "rgb(0, 0, 0)",
    "inverseSurface": "rgb(47, 49, 45)",
    "inverseOnSurface": "rgb(240, 241, 235)",
    "inversePrimary": "rgb(126, 219, 127)",
    "elevation": {
      "level0": "transparent",
      "level1": "rgb(239, 246, 235)",
      "level2": "rgb(232, 242, 229)",
      "level3": "rgb(224, 237, 223)",
      "level4": "rgb(222, 236, 220)",
      "level5": "rgb(217, 233, 216)"
    },
    "surfaceDisabled": "rgba(26, 28, 25, 0.12)",
    "onSurfaceDisabled": "rgba(26, 28, 25, 0.38)",
    "backdrop": "rgba(44, 50, 42, 0.4)"
  }
}

export const customDarkTheme = {
  ...MD3DarkTheme,
  fonts: {
    regular: 'Helvetica Neue',
    medium: 'Helvetica Neue Light',
  },
  "colors": {
    "primary": "rgb(126, 219, 127)",
    "onPrimary": "rgb(0, 57, 13)",
    "primaryContainer": "rgb(0, 83, 22)",
    "onPrimaryContainer": "rgb(153, 248, 153)",
    "secondary": "rgb(185, 204, 180)",
    "onSecondary": "rgb(37, 52, 35)",
    "secondaryContainer": "rgb(59, 75, 57)",
    "onSecondaryContainer": "rgb(213, 232, 207)",
    "tertiary": "rgb(161, 206, 213)",
    "onTertiary": "rgb(0, 54, 60)",
    "tertiaryContainer": "rgb(31, 77, 83)",
    "onTertiaryContainer": "rgb(188, 235, 241)",
    "error": "rgb(255, 180, 171)",
    "onError": "rgb(105, 0, 5)",
    "errorContainer": "rgb(147, 0, 10)",
    "onErrorContainer": "rgb(255, 180, 171)",
    "background": "rgb(26, 28, 25)",
    "onBackground": "rgb(226, 227, 221)",
    "surface": "rgb(26, 28, 25)",
    "onSurface": "rgb(226, 227, 221)",
    "surfaceVariant": "rgb(66, 73, 64)",
    "onSurfaceVariant": "rgb(194, 201, 189)",
    "outline": "rgb(140, 147, 136)",
    "outlineVariant": "rgb(66, 73, 64)",
    "shadow": "rgb(0, 0, 0)",
    "scrim": "rgb(0, 0, 0)",
    "inverseSurface": "rgb(226, 227, 221)",
    "inverseOnSurface": "rgb(47, 49, 45)",
    "inversePrimary": "rgb(1, 110, 33)",
    "elevation": {
      "level0": "transparent",
      "level1": "rgb(31, 38, 30)",
      "level2": "rgb(34, 43, 33)",
      "level3": "rgb(37, 49, 36)",
      "level4": "rgb(38, 51, 37)",
      "level5": "rgb(40, 55, 39)"
    },
    "surfaceDisabled": "rgba(226, 227, 221, 0.12)",
    "onSurfaceDisabled": "rgba(226, 227, 221, 0.38)",
    "backdrop": "rgba(44, 50, 42, 0.4)"
  }
}
