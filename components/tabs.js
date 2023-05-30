import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import DailyPage from "../pages/daily";
import DosePage from "../pages/dose";
import InsightsPage from "../pages/insights";
import PlanPage from "../pages/plan";
import SettingsPage from "../pages/settings";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import DebugPage from "../pages/debug";
import useFireauth from "../hooks/useFireauth";

export const Tabs = () => {
  const {user} = useFireauth();
  const Tab = createMaterialTopTabNavigator();
  return (
    <Tab.Navigator
      initialRouteName="Daily"
      tabBarPosition="bottom"
    >
      <Tab.Screen name="Debug" component={DebugPage} options={{
        tabBarLabel: 'Debug',
        tabBarLabelStyle: {fontSize: 8},
        tabBarIcon: ({ color }) => (
          <MaterialCommunityIcons name="bug" color={color} size={26} />
        ),
      }}/>
      <Tab.Screen name="Daily" component={DailyPage} options={{
        tabBarLabel: 'Daily',
        tabBarLabelStyle: {fontSize: 8},
        tabBarIcon: ({ color }) => (
          <MaterialCommunityIcons name="home" color={color} size={26} />
        ),
      }}/>
      <Tab.Screen name="Dose" component={DosePage} options={{
        tabBarLabel: 'Dose',
        tabBarLabelStyle: {fontSize: 8},
        tabBarIcon: ({ color }) => (
          <MaterialCommunityIcons name="bottle-tonic-skull" color={color} size={26} />
        ),
      }}/>
      <Tab.Screen name="Insight" component={InsightsPage} options={{
        tabBarLabel: 'Insight',
        tabBarLabelStyle: {fontSize: 8},
        tabBarIcon: ({ color }) => (
          <MaterialCommunityIcons name="alarm-light" color={color} size={26} />
        ),
      }}/>
      <Tab.Screen name="Plan" component={PlanPage} options={{
        tabBarLabel: 'Plan',
        tabBarLabelStyle: {fontSize: 8},
        tabBarIcon: ({ color }) => (
          <MaterialCommunityIcons name="clipboard-text-clock" color={color} size={26} />
        ),
      }}/>
      <Tab.Screen name="Settings" component={SettingsPage} options={{
        tabBarLabel: 'Setting',
        tabBarLabelStyle: {fontSize: 8},
        tabBarIcon: ({ color }) => (
          <MaterialCommunityIcons name="cog" color={color} size={26} />
        ),
      }}/>
    </Tab.Navigator>
  )
}
