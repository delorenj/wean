import {useDaily} from "../../context/dailyProvider";
import {Card, Title, useTheme} from "react-native-paper";
import CircularProgress from "react-native-circular-progress-indicator";
import {useMainStyles} from "../../hooks/useMainStyles";
import {Animated, StyleSheet, Text} from "react-native";
import View = Animated.View;
import React from "react";

export const DailyDoseGauge = () => {
    const theme = useTheme();
    const styles = useMainStyles(theme);
    const {selectedDate} = useDaily();

    // @ts-ignore
    // @ts-ignore
    return (
        <Card style={[styles.card, {flex: 0, justifyContent: 'center', alignItems: 'center'}]}>
            <Title style={{textAlign: 'center' as 'center', marginBottom: 10}}>Daily Dose</Title>
            <CircularProgress
                value={60}
                radius={120}
                progressValueColor={theme.colors.onSurface}
                activeStrokeColor={theme.colors.onPrimary}
                inActiveStrokeColor={theme.colors.primary}
                inActiveStrokeOpacity={0.5}
                inActiveStrokeWidth={30}
                activeStrokeWidth={20}
            />
            <View style={localStyles.container}>
                <View style={localStyles.left}>
                    <Text style={localStyles.text}>Daily Total</Text>
                </View>
                <View style={localStyles.divider}/>
                <View style={localStyles.right}>
                    <Text style={localStyles.text}>Daily Goal</Text>
                </View>
            </View>
        </Card>
    )
}
const localStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        margin: 20,
        height: 40,
        backgroundColor: "blue"
    },
    left: {
        flex: 1,
    },
    divider: {
        width: 1,
        backgroundColor: '#aaa',
    },
    right: {
        flex: 1,
    },
    text: {
        textAlign: "center"
    }
});
