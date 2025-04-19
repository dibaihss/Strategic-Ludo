import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { updateTimer, setTimerRunning, resetTimer, setActivePlayer } from '../assets/store/gameSlice';

export default function Timer() {
    const dispatch = useDispatch();
    const timeRemaining = useSelector(state => state.game.timeRemaining);
    const isTimerRunning = useSelector(state => state.game.isTimerRunning);
    const theme = useSelector(state => state.theme.current);


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

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 20,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        zIndex: 1000,
    },
    text: {
        fontSize: 18,
        fontWeight: 'bold',
    }
});