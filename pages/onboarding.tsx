import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  FlatList,
  ListRenderItem,
  StyleSheet,
  View,
  ViewToken,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Text } from 'react-native-paper';
import useDesignTokens from '../hooks/useDesignTokens';
import { markOnboardingCompleted } from '../utils/onboardingStorage';
import {
  OnboardingScreen,
  ONBOARDING_SCREENS,
  getNextOnboardingIndex,
  getOnboardingAnnouncement,
  isLastOnboardingScreen,
} from './onboarding.helpers';

interface OnboardingPageProps {
  onComplete: () => void;
}

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ onComplete }) => {
  const { colors, spacing, typography, borderRadius } = useDesignTokens();
  const { width } = useWindowDimensions();
  const flatListRef = useRef<FlatList<OnboardingScreen>>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  const styles = useMemo(() => StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing[16],
      paddingTop: spacing[8],
      minHeight: spacing[40],
    },
    progressLabel: {
      color: colors.onSurfaceVariant,
      fontSize: typography.labelLarge.fontSize,
      lineHeight: typography.labelLarge.lineHeight,
      fontWeight: typography.labelLarge.fontWeight as '500',
    },
    slide: {
      flex: 1,
      paddingHorizontal: spacing[20],
      justifyContent: 'center',
      gap: spacing[20],
    },
    illustrationBox: {
      height: spacing[56] + spacing[56],
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.primary[200],
      backgroundColor: colors.primary[50],
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing[8],
      paddingHorizontal: spacing[16],
    },
    placeholderText: {
      color: colors.onSurfaceVariant,
      fontSize: typography.bodySmall.fontSize,
      lineHeight: typography.bodySmall.lineHeight,
      textAlign: 'center',
    },
    title: {
      color: colors.onSurface,
      fontSize: typography.headlineMedium.fontSize,
      lineHeight: typography.headlineMedium.lineHeight,
      fontWeight: typography.headlineMedium.fontWeight as '600',
    },
    description: {
      color: colors.onSurfaceVariant,
      fontSize: typography.bodyLarge.fontSize,
      lineHeight: typography.bodyLarge.lineHeight,
      fontWeight: typography.bodyLarge.fontWeight as '400',
    },
    dotsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing[8],
      paddingBottom: spacing[16],
    },
    dot: {
      width: spacing[8],
      height: spacing[8],
      borderRadius: borderRadius.full,
      backgroundColor: colors.neutral[300],
    },
    activeDot: {
      width: spacing[20],
      backgroundColor: colors.primary[400],
    },
    footer: {
      paddingHorizontal: spacing[20],
      paddingBottom: spacing[20],
    },
    ctaButtonContent: {
      minHeight: spacing[48],
    },
  }), [borderRadius.full, borderRadius.lg, colors, spacing, typography]);

  const currentScreen = ONBOARDING_SCREENS[currentIndex] ?? ONBOARDING_SCREENS[0];
  const isLastScreen = isLastOnboardingScreen(currentIndex);

  useEffect(() => {
    if (!currentScreen) {
      return;
    }

    AccessibilityInfo.announceForAccessibility(
      getOnboardingAnnouncement(currentIndex),
    );
  }, [currentIndex, currentScreen]);

  const handleComplete = async () => {
    if (isCompleting) {
      return;
    }

    setIsCompleting(true);

    try {
      await markOnboardingCompleted();
      onComplete();
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      setIsCompleting(false);
    }
  };

  const handleNext = () => {
    if (isLastScreen) {
      void handleComplete();
      return;
    }

    const nextIndex = getNextOnboardingIndex(currentIndex);
    flatListRef.current?.scrollToIndex({
      index: nextIndex,
      animated: true,
    });
    setCurrentIndex(nextIndex);
  };

  const handleSkip = () => {
    void handleComplete();
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
    const nextIndex = viewableItems[0]?.index;

    if (typeof nextIndex === 'number') {
      setCurrentIndex(nextIndex);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
  }).current;

  const renderItem: ListRenderItem<OnboardingScreen> = ({ item }) => {
    return (
      <View
        style={[styles.slide, { width }]}
        accessible
        accessibilityRole="text"
        accessibilityLabel={`${item.title}. ${item.description}`}
      >
        <View style={styles.illustrationBox}>
          <View
            style={{
              width: spacing[32],
              height: spacing[32],
              borderRadius: borderRadius.full,
              backgroundColor: colors.primary[200],
            }}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          />
          <Text style={styles.placeholderText}>{item.placeholderLabel}</Text>
        </View>

        <View style={{ gap: spacing[12] }}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <Text style={styles.progressLabel}>
          {`Screen ${currentIndex + 1} of ${ONBOARDING_SCREENS.length}`}
        </Text>
        {!isLastScreen ? (
          <Button
            mode="text"
            onPress={handleSkip}
            disabled={isCompleting}
            accessibilityLabel="Skip onboarding and open the app"
          >
            Skip
          </Button>
        ) : <View />}
      </View>

      <FlatList
        ref={flatListRef}
        data={ONBOARDING_SCREENS}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      <View style={styles.dotsRow}>
        {ONBOARDING_SCREENS.map((screen, index) => (
          <View
            key={screen.id}
            style={[styles.dot, index === currentIndex ? styles.activeDot : null]}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          />
        ))}
      </View>

      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handleNext}
          loading={isCompleting}
          disabled={isCompleting}
          contentStyle={styles.ctaButtonContent}
          accessibilityLabel={
            isLastScreen
              ? 'Get started and log your first dose'
              : `Next screen: ${ONBOARDING_SCREENS[getNextOnboardingIndex(currentIndex)]?.title}`
          }
        >
          {isLastScreen ? 'Get Started' : 'Next'}
        </Button>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingPage;
