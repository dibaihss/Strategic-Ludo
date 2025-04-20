import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform, Dimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { updateTimer, setTimerRunning, resetTimer, setActivePlayer } from '../assets/store/gameSlice';

export default function Timer() {
    const dispatch = useDispatch();
    const timeRemaining = useSelector(state => state.game.timeRemaining);
    const isTimerRunning = useSelector(state => state.game.isTimerRunning);
    const theme = useSelector(state => state.theme.current);
    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height;
    const isSmallScreen = windowWidth < 375 || windowHeight < 667;

    const styles = StyleSheet.create({
        container: {
            // display: Platform.OS === 'android' ? "none" : "flex",
            position: 'absolute',
            top: isSmallScreen ? 10 : 20,
            left: isSmallScreen ? "30%" : "",
            paddingHorizontal: isSmallScreen ? 15 : 20,
            paddingVertical: isSmallScreen ? 8 : 10,
            borderRadius: 20,
            zIndex: 1000,
            elevation: isSmallScreen ? 4 : 0,
        },
        text: {
            fontSize: isSmallScreen ? 16 : 18,
            fontWeight: isSmallScreen ? 'bold' : 'bold',
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
        <View style={[styles.container, { backgroundColor: theme.colors.button }]}>
            <Text style={[styles.text, { color: theme.colors.buttonText }]}>
                Time: {timeRemaining}s
            </Text>
        </View>
    );
}

