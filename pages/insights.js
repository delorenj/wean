import {StyleSheet, Text, SafeAreaView} from "react-native";
import {Card, useTheme} from "react-native-paper";
import {useMainStyles} from "../hooks/useMainStyles";
import Last7DaysGraph from "../components/Graphs/Last7DaysGraph";

export const InsightsPage = () => {
  const theme = useTheme()
  const styles = useMainStyles(theme)
  return (
    <SafeAreaView style={styles.container}>
      <Card>
        <Card.Title title="Insights" />
        <Card.Content>
            <Last7DaysGraph />
        </Card.Content>
      </Card>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 100,
    flex: 1,
  }
});

export default InsightsPage;
