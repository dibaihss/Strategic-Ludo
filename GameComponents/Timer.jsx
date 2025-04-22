import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform, Dimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { updateTimer, setTimerRunning, resetTimer, setActivePlayer } from '../assets/store/gameSlice';
import { uiStrings } from "../assets/shared/hardCodedData.js";
import ActivePlayerIndicator from './ActivePlayerIndicator.jsx';

export default function Timer() {
    const dispatch = useDispatch();
    const timeRemaining = useSelector(state => state.game.timeRemaining);
    const isTimerRunning = useSelector(state => state.game.isTimerRunning);
    const theme = useSelector(state => state.theme.current);
    const systemLang = useSelector(state => state.language.systemLang);
    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height;
    const isSmallScreen = windowWidth < 375 || windowHeight < 667;

    const styles = StyleSheet.create({
        container: {
            position: 'absolute',
            top: isSmallScreen ? 10 : 20,
            left: "22%",
            right: "22%",
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: isSmallScreen ? 6 : 20,
            zIndex: 1000,
        },
        timerBox: {
            backgroundColor: theme.colors.button,
            paddingHorizontal: isSmallScreen ? 15 : 20,
            paddingVertical: isSmallScreen ? 8 : 10,
            borderRadius: 20,
            elevation: isSmallScreen ? 4 : 0,
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
        },
        text: {
            fontSize: isSmallScreen ? 16 : 18,
            fontWeight: 'bold',
        }
    });

    useEffect(() => {
        dispatch(setTimerRunning(true));
        return () => dispatch(setTimerRunning(false));
    }, []);

    useEffect(() => {
        let timer;
        if (isTimerRunning && timeRemaining > 0) {
            timer = setInterval(() => {
                dispatch(updateTimer(timeRemaining - 1));
            }, 1000);
        } else if (timeRemaining === 0) {
            dispatch(setActivePlayer());
            dispatch(resetTimer());
        }

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [timeRemaining, isTimerRunning]);

    return (
        <View style={styles.container}>
            <View style={styles.timerBox}>
                <Text style={[styles.text, { color: theme.colors.buttonText }]}>
                    {uiStrings[systemLang].timer.replace('{time}', timeRemaining)}
                </Text>
            </View>
            <ActivePlayerIndicator />
        </View>
    );
}

