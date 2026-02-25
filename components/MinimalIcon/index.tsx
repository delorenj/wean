/**
 * Minimal Icon Component
 * Only includes the 16 icons actually used in the app
 * Replaces MaterialCommunityIcons (1.15 MB) with a lightweight subset
 */

import React from 'react';
import { Text } from 'react-native';

// Icon name to unicode character mapping (using Material Design Icons)
const ICON_MAP: Record<string, string> = {
  'home': '󰋜',           // home
  'bug': '󰕈',            // bug
  'bottle-tonic-skull': '󰡨', // skull bottle
  'alarm-light': '󰍬',    // alarm
  'clipboard-text-clock': '󰔐', // clipboard with clock
  'cog': '󰒓',             // settings
  'check-circle': '󰅄',    // checkmark circle
  'lock': '󰌾',            // lock
  'crown': '󰜘',           // crown
  'loading': '󰔀',         // sync/loading
  'Daily': '󰋜',           // daily icon (home)
  'Debug': '󰕈',           // debug icon (bug)
  'Dose': '󰡨',            // dose icon (bottle)
  'Insight': '󰍬',         // insight icon (alarm/notification)
  'Plan': '󰔐',            // plan icon (clipboard)
  'Settings': '󰒓',        // settings icon (cog)
};

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: any;
}

export const MinimalIcon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = '#000',
  style,
}) => {
  const character = ICON_MAP[name] || '?';

  return (
    <Text
      style={[
        {
          fontSize: size,
          color,
          fontFamily: 'MaterialIcons',
          textAlignVertical: 'center',
          lineHeight: size,
        },
        style,
      ]}
    >
      {character}
    </Text>
  );
};

export default MinimalIcon;
