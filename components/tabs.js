import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import DailyPage from '../pages/daily';
import DosePage from '../pages/dose';
import TrendsPage from '../pages/trends';
import PlanPage from '../pages/plan';
import GoalsPage from '../pages/goals';
import TaperPlanPage from '../pages/taper-plan';
import SettingsPage from '../pages/settings';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DebugPage from '../pages/debug';
import { useTheme } from 'react-native-paper';
import useDesignTokens from '../hooks/useDesignTokens';

export const TABS_INITIAL_ROUTES = {
  DAILY: 'Daily',
  DOSE: 'Dose',
};

/**
 * @typedef {'Daily' | 'Dose'} TabsInitialRouteName
 */

/**
 * @param {{ initialRouteName?: TabsInitialRouteName }} props
 */
export const Tabs = ({ initialRouteName = TABS_INITIAL_ROUTES.DAILY }) => {
  const Tab = createMaterialTopTabNavigator();
  const theme = useTheme();
  const tokens = useDesignTokens();

  return (
    <Tab.Navigator
      initialRouteName={initialRouteName}
      tabBarPosition="bottom"
      screenOptions={{
        tabBarActiveTintColor: tokens.colors.primary[400],
        tabBarInactiveTintColor: tokens.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: tokens.colors.neutral[200],
          borderTopWidth: 1,
          paddingTop: tokens.spacing[4],
          paddingBottom: tokens.spacing[8],
          minHeight: 72,
        },
        tabBarIndicatorStyle: {
          backgroundColor: tokens.colors.primary[400],
          height: 3,
          borderRadius: tokens.borderRadius.full,
        },
        tabBarLabelStyle: {
          fontSize: tokens.typography.labelSmall.fontSize,
          fontWeight: tokens.typography.labelSmall.fontWeight,
          textTransform: 'none',
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen name="Debug" component={DebugPage} options={{
        tabBarLabel: 'Debug',
        tabBarIcon: ({ color }) => (
          <MaterialCommunityIcons name="bug" color={color} size={26} />
        ),
      }} />
      <Tab.Screen name="Daily" component={DailyPage} options={{
        tabBarLabel: 'Daily',
        tabBarIcon: ({ color }) => (
          <MaterialCommunityIcons name="home" color={color} size={26} />
        ),
      }} />
      <Tab.Screen name="Dose" component={DosePage} options={{
        tabBarLabel: 'Dose',
        tabBarIcon: ({ color }) => (
          <MaterialCommunityIcons name="bottle-tonic-skull" color={color} size={26} />
        ),
      }} />
      <Tab.Screen name="Trends" component={TrendsPage} options={{
        tabBarLabel: 'Trends',
        tabBarIcon: ({ color }) => (
          <MaterialCommunityIcons name="chart-bar" color={color} size={26} />
        ),
      }} />
      <Tab.Screen name="Plan" component={PlanPage} options={{
        tabBarLabel: 'Plan',
        tabBarIcon: ({ color }) => (
          <MaterialCommunityIcons name="clipboard-text-clock" color={color} size={26} />
        ),
      }} />
      <Tab.Screen name="Goals" component={GoalsPage} options={{
        tabBarLabel: 'Goals',
        tabBarIcon: ({ color }) => (
          <MaterialCommunityIcons name="flag-checkered" color={color} size={26} />
        ),
      }} />
      <Tab.Screen name="Taper" component={TaperPlanPage} options={{
        tabBarLabel: 'Taper',
        tabBarIcon: ({ color }) => (
          <MaterialCommunityIcons name="stairs-down" color={color} size={26} />
        ),
      }} />
      <Tab.Screen name="Settings" component={SettingsPage} options={{
        tabBarLabel: 'Settings',
        tabBarIcon: ({ color }) => (
          <MaterialCommunityIcons name="cog" color={color} size={26} />
        ),
      }} />
    </Tab.Navigator>
  );
};
