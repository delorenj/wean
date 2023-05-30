import React from 'react';
import {StyleSheet, Text, View} from "react-native";
import {List, useTheme, Card, Title, Paragraph} from "react-native-paper";
import {useMainStyles} from "../hooks/useMainStyles";
import useFireauth from "../hooks/useFireauth";
import {useDoses} from "../hooks/useDoses";

export const DebugPage = () => {
  const theme = useTheme();
  const styles = useMainStyles(theme);
  const {user} = useFireauth();
  const {doses} = useDoses();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Debug</Text>

      {/* User Details Section */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>User Details</Title>
          <Paragraph>User ID: {user?.uid}</Paragraph>
        </Card.Content>
      </Card>
      {/* Dose Section */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Dose Details</Title>
          {doses.map((dose, index) => (
            <List.Item
              key={index}
              title={`${dose.amount} ${dose.doseUnit} of ${dose.substance}`}
              description={dose.notes}
            />
          ))}
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
  card: {
    marginTop: 16,
  },
});

export default DebugPage;
