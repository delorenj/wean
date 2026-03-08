import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  PanResponder,
  PanResponderGestureState,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  View,
} from 'react-native';
import useDesignTokens from '../../hooks/useDesignTokens';
import { DailyDoseTimelineEntry, formatTimelineDoseAmount } from './helpers';
import {
  DELETE_ACTION_WIDTH,
  clampDeleteSwipeTranslate,
  shouldOpenDeleteAction,
} from './deleteDose.helpers';

interface DoseCardProps {
  entry: DailyDoseTimelineEntry;
  isFirst: boolean;
  isLast: boolean;
  onPress: () => void;
  onDeletePress: () => void;
}

const toTextStyle = (
  typographyStyle: (typeof import('../../src/tokens').Typography)[keyof (typeof import('../../src/tokens').Typography)]
): TextStyle => typographyStyle as TextStyle;

const DoseCard: React.FC<DoseCardProps> = ({
  entry,
  isFirst,
  isLast,
  onPress,
  onDeletePress,
}) => {
  const tokens = useDesignTokens();
  const translateX = useRef(new Animated.Value(0)).current;
  const openedRef = useRef(false);

  const closeSwipeAction = () => {
    openedRef.current = false;

    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 0,
    }).start();
  };

  const openSwipeAction = () => {
    openedRef.current = true;

    Animated.spring(translateX, {
      toValue: -DELETE_ACTION_WIDTH,
      useNativeDriver: true,
      bounciness: 0,
    }).start();
  };

  useEffect(() => {
    translateX.setValue(0);
    openedRef.current = false;
  }, [entry.key, translateX]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState: PanResponderGestureState) => {
          const isHorizontalSwipe = Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
          return isHorizontalSwipe && gestureState.dx < -4;
        },
        onPanResponderMove: (_, gestureState: PanResponderGestureState) => {
          translateX.setValue(clampDeleteSwipeTranslate(gestureState.dx));
        },
        onPanResponderRelease: (_, gestureState: PanResponderGestureState) => {
          if (shouldOpenDeleteAction(gestureState.dx)) {
            openSwipeAction();
            return;
          }

          closeSwipeAction();
        },
        onPanResponderTerminate: closeSwipeAction,
      }),
    [translateX]
  );

  const handlePressCard = () => {
    if (openedRef.current) {
      closeSwipeAction();
      return;
    }

    onPress();
  };

  const handleDeletePress = () => {
    closeSwipeAction();
    onDeletePress();
  };

  return (
    <View
      style={[
        styles.timelineEntryRow,
        {
          paddingHorizontal: tokens.spacing[16],
        },
      ]}
    >
      <View
        style={[
          styles.timelineRail,
          {
            width: tokens.spacing[24],
            marginRight: tokens.spacing[12],
          },
        ]}
      >
        <View
          style={{
            flex: 1,
            minHeight: tokens.spacing[12],
            width: tokens.spacing[2],
            backgroundColor: tokens.colors.primary[200],
            opacity: isFirst ? 0 : 1,
          }}
        />

        <View
          style={{
            width: tokens.spacing[12],
            height: tokens.spacing[12],
            borderRadius: tokens.borderRadius.full,
            backgroundColor: tokens.colors.primary[400],
            borderWidth: tokens.spacing[2],
            borderColor: tokens.colors.surface,
          }}
        />

        <View
          style={{
            flex: 1,
            minHeight: tokens.spacing[12],
            width: tokens.spacing[2],
            backgroundColor: tokens.colors.primary[200],
            opacity: isLast ? 0 : 1,
          }}
        />
      </View>

      <View style={styles.swipeContainer}>
        <View
          style={[
            styles.deleteActionContainer,
            {
              width: DELETE_ACTION_WIDTH,
              borderRadius: tokens.borderRadius.lg,
            },
          ]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Delete ${entry.substance || 'dose'} logged at ${entry.timeLabel}`}
            onPress={handleDeletePress}
            style={[
              styles.deleteAction,
              {
                borderRadius: tokens.borderRadius.lg,
                backgroundColor: tokens.colors.error,
              },
            ]}
          >
            <Text
              style={{
                color: tokens.colors.neutral[0],
                ...toTextStyle(tokens.typography.labelLarge),
              }}
            >
              Delete
            </Text>
          </Pressable>
        </View>

        <Animated.View
          style={[
            styles.swipeableCard,
            {
              transform: [{ translateX }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Edit ${entry.substance || 'dose'} logged at ${entry.timeLabel}`}
            onPress={handlePressCard}
            style={[
              styles.entryCard,
              {
                padding: tokens.spacing[12],
                borderRadius: tokens.borderRadius.lg,
                backgroundColor: tokens.componentStates.card.default.backgroundColor,
                borderColor: tokens.componentStates.card.default.borderColor,
                borderWidth: tokens.spacing[2],
                gap: tokens.spacing[8],
                ...tokens.shadows.z1,
              },
            ]}
          >
            <View style={styles.entryMetaRow}>
              <Text
                style={{
                  color: tokens.colors.onSurfaceVariant,
                  ...toTextStyle(tokens.typography.labelLarge),
                }}
              >
                {entry.timeLabel}
              </Text>

              {entry.isEdited ? (
                <Text
                  style={{
                    color: tokens.colors.primary[600],
                    ...toTextStyle(tokens.typography.labelMedium),
                  }}
                >
                  Edited
                </Text>
              ) : null}
            </View>

            <View style={[styles.amountRow, { gap: tokens.spacing[6] }]}>
              <Text
                style={{
                  color: tokens.colors.onSurface,
                  ...toTextStyle(tokens.typography.titleLarge),
                }}
              >
                {formatTimelineDoseAmount(entry.amount)}
              </Text>
              <Text
                style={{
                  color: tokens.colors.onSurfaceVariant,
                  ...toTextStyle(tokens.typography.titleMedium),
                }}
              >
                {entry.unit}
              </Text>
            </View>

            {entry.substance ? (
              <Text
                style={{
                  color: tokens.colors.onSurfaceVariant,
                  ...toTextStyle(tokens.typography.bodySmall),
                }}
              >
                {entry.substance}
              </Text>
            ) : null}
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  timelineEntryRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  timelineRail: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeContainer: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
  },
  swipeableCard: {
    flex: 1,
  },
  deleteActionContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  deleteAction: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryCard: {
    flex: 1,
  },
  entryMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
});

export default DoseCard;
