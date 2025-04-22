import { View, StyleSheet, Platform, Dimensions } from "react-native";
import React, { useEffect, useState } from 'react';
import Player from './Player';
import { MaterialIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { uiStrings, getLocalizedColor } from "../assets/shared/hardCodedData.js";
import Toast from 'react-native-toast-message';

export default function Goals() {
    // Get soldiers from Redux store
    const blueSoldiers = useSelector(state => state.game.blueSoldiers);
    const redSoldiers = useSelector(state => state.game.redSoldiers);
    const yellowSoldiers = useSelector(state => state.game.yellowSoldiers);
    const greenSoldiers = useSelector(state => state.game.greenSoldiers);
    const theme = useSelector(state => state.theme.current);
    const systemLang = useSelector(state => state.language.systemLang);
    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height;
    const isSmallScreen = windowWidth < 375 || windowHeight < 667;

    // Track winners to avoid multiple toasts
    const [winners, setWinners] = useState({
        yellow: false,
        green: false,
        red: false,
        blue: false
    });

    // Check for winners and show toasts
    useEffect(() => {
        const checkAndShowToast = (soldiers, color) => {
            if (soldiers.find(obj => obj.isOut === false) === undefined && !winners[color.toLowerCase()]) {
                // Use getLocalizedColor to translate the color name
                const localizedColor = getLocalizedColor(color.toLowerCase(), systemLang);
                Toast.show({
                    type: 'success',
                    text1: uiStrings[systemLang].wonGame.replace('{color}', localizedColor),
                    position: 'top',
                    visibilityTime: 5000,
                    autoHide: true,
                    topOffset: 60,
                    bottomOffset: 40,
                    props: { backgroundColor: theme.colors[color.toLowerCase()] }
                });
                setWinners(prev => ({ ...prev, [color.toLowerCase()]: true }));
            }
        };

        checkAndShowToast(yellowSoldiers, 'Yellow');
        checkAndShowToast(greenSoldiers, 'Green');
        checkAndShowToast(redSoldiers, 'Red');
        checkAndShowToast(blueSoldiers, 'Blue');
    }, [yellowSoldiers, greenSoldiers, redSoldiers, blueSoldiers, systemLang]);

    const styles = StyleSheet.create({
        centerCircle: {
            position: 'absolute',
            width: isSmallScreen ? 50 : 120,
            height: isSmallScreen ? 50 : 120,
            borderRadius: 15,
            backgroundColor: theme.colors.background,
            borderWidth: isSmallScreen ? 1 : 2,
            borderColor: theme.colors.border,
            overflow: 'hidden',
            zIndex: 1,
            elevation: isSmallScreen ? 4 : 0,
            top: '50%',
            left: '50%',
            transform: [
                { translateX: isSmallScreen ? -25 : -60 },
                { translateY: isSmallScreen ? -25 : -60 }
            ],
        },
        yellow: {
            backgroundColor: theme.colors.yellow
        },
        green: {
            backgroundColor: theme.colors.green
        },
        red: {
            backgroundColor: theme.colors.red
        },
        blue: {
            backgroundColor: theme.colors.blue
        },
        centerQuadrants: {
            flex: 1,
            flexDirection: 'row',
            flexWrap: 'wrap',
        },
        quadrant: {
            width: '50%',
            height: '50%',
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: isSmallScreen ? 0.5 : 1,
            borderColor: isSmallScreen ? 'rgba(0,0,0,0.2)' : '#000',
            elevation: isSmallScreen ? 2 : 0,
        },
        button: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 10,
            backgroundColor: '#e8ecf4',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#d1d9e6',
            gap: 8,
        },
        buttonText: {
            fontSize: 16,
            color: '#2a3f5f',
            fontWeight: '500',
        },
    });

    return (
        <View style={styles.centerCircle}>
            <View style={styles.centerQuadrants}>
                <View style={[styles.quadrant, styles.yellow]}>
                    <MaterialIcons name="home" size={24} color="goldenrod" />
                    {yellowSoldiers.find(obj => obj.isOut === true) &&
                        <Player color={yellowSoldiers[0].color} />}
                </View>

                <View style={[styles.quadrant, styles.green]}>
                    <MaterialIcons name="home" size={24} color="darkgreen" />
                    {greenSoldiers.find(obj => obj.isOut === true) &&
                        <Player color={greenSoldiers[0].color} />}
                </View>

                <View style={[styles.quadrant, styles.red]}>
                    <MaterialIcons name="home" size={24} color="darkred" />
                    {redSoldiers.find(obj => obj.isOut === true) &&
                        <Player color={redSoldiers[0].color} />}
                </View>

                <View style={[styles.quadrant, styles.blue]}>
                    <MaterialIcons name="home" size={24} color="darkblue" />
                    {blueSoldiers.find(obj => obj.isOut === true) &&
                        <Player color={blueSoldiers[0].color} />}
                </View>
            </View>
        </View>
    );
}

