import { View, StyleSheet, Dimensions } from "react-native";
import React from 'react';
import Soldier from './Soldier';
import { MaterialIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';


export default function Goals() {
    // Get soldiers from Redux store
    const blueSoldiers = useSelector(state => state.game.blueSoldiers);
    const redSoldiers = useSelector(state => state.game.redSoldiers);
    const yellowSoldiers = useSelector(state => state.game.yellowSoldiers);
    const greenSoldiers = useSelector(state => state.game.greenSoldiers);
    const theme = useSelector(state => state.theme.current);
    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height;
    const isSmallScreen = windowWidth < 375 || windowHeight < 667;

    const renderGoalQuadrant = (soldiers, colorStyle, iconColor) => {
        const soldiersAtHome = soldiers.filter((soldier) => soldier.isOut === true).slice(0, 4);

        return (
            <View style={[styles.quadrant, colorStyle]}>
                <MaterialIcons
                    name="home"
                    size={isSmallScreen ? 16 : 24}
                    color={iconColor}
                    style={styles.homeIcon}
                />
                <View style={styles.soldierGrid}>
                    {soldiersAtHome.map((soldier) => (
                        <View key={soldier.id} style={styles.soldierSlot}>
                            <Soldier color={soldier.color} sizeVariant="stacked" />
                        </View>
                    ))}
                </View>
            </View>
        );
    };


    const styles = StyleSheet.create({
        centerCircle: {
            position: 'absolute',
            width: isSmallScreen ? 60 : 120,
            height: isSmallScreen ? 60 : 120,
            borderRadius: 10,
            backgroundColor: theme.colors.background,
            borderWidth:  2,
            borderColor: theme.colors.border,
            overflow: 'hidden',
            zIndex: 1,
            top: '50%',
            left: '50%',
            transform: [
                { translateX: isSmallScreen ? -30 : -60 },
                { translateY: isSmallScreen ? -30 : -60 }
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
            borderWidth: 1,
            borderColor:  '#000',
            elevation:  0,
            position: 'relative',
        },
        homeIcon: {
            position: 'absolute',
            opacity: 0.45,
            zIndex: 0,
        },
        soldierGrid: {
            width: '100%',
            height: '100%',
            padding: isSmallScreen ? 2 : 6,
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignContent: 'center',
            zIndex: 1,
        },
        soldierSlot: {
            width: '50%',
            height: '50%',
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: theme.colors.background,
            backgroundColor: 'rgba(255, 255, 255, 0.18)',
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
                {renderGoalQuadrant(yellowSoldiers, styles.yellow, 'goldenrod')}
                {renderGoalQuadrant(greenSoldiers, styles.green, 'darkgreen')}
                {renderGoalQuadrant(redSoldiers, styles.red, 'darkred')}
                {renderGoalQuadrant(blueSoldiers, styles.blue, 'darkblue')}
            </View>
        </View>
    );
}

