import React, { PropsWithChildren, useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, ViewStyle } from 'react-native';
import useDesignTokens from '../../hooks/useDesignTokens';

interface ScreenTransitionProps {
  delay?: number;
  duration?: number;
  distance?: number;
  style?: ViewStyle | ViewStyle[];
}

export const ScreenTransition: React.FC<PropsWithChildren<ScreenTransitionProps>> = ({
  children,
  delay = 0,
  duration,
  distance = 10,
  style,
}) => {
  const tokens = useDesignTokens();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(distance)).current;

  const resolvedDuration = useMemo(
    () => duration ?? tokens.animation.slow,
    [duration, tokens.animation.slow]
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: resolvedDuration,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: resolvedDuration,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, opacity, resolvedDuration, translateY]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

export default ScreenTransition;
