import { View, Text, StyleSheet } from "react-native";
import React from 'react';
import Player from './Player';
import { MaterialIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';

export default function Goals() {
    // Get soldiers from Redux store
    const blueSoldiers = useSelector(state => state.game.blueSoldiers);
    const redSoldiers = useSelector(state => state.game.redSoldiers);
    const yellowSoldiers = useSelector(state => state.game.yellowSoldiers);
    const greenSoldiers = useSelector(state => state.game.greenSoldiers);
    const theme = useSelector(state => state.theme.current);
    const styles = StyleSheet.create({
        centerCircle: {
            position: 'absolute',
            width: 120,
            height: 120,
            borderRadius: 15,
            backgroundColor: theme.colors.background,
            borderWidth: 2,
            borderColor: theme.colors.border,
            overflow: 'hidden',
            zIndex: 1,
            top: '50%',
            left: '50%',
            transform: [
                { translateX: -60 },
                { translateY: -60 }
            ],
            // transform: [
            //     { translateX: "-50%" },
            //     { translateY: "-50%" }
            // ],
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
            borderColor: '#000',
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
    })

    return (
        <View style={styles.centerCircle}>
            <View style={styles.centerQuadrants}>

                <View style={[styles.quadrant, styles.yellow]}>
                    <MaterialIcons name="home" size={24} color="goldenrod" />
                    {yellowSoldiers.find(obj => obj.isOut === true) &&
                        <Player color={yellowSoldiers[0].color} />}
                    {yellowSoldiers.find(obj => obj.isOut === false) === undefined &&
                        <Text style={{ color: 'black', fontSize: 20 }}>Yellow won the Game</Text>}
                </View>
                {/* Green quadrant */}
                <View style={[styles.quadrant, styles.green]}>
                    <MaterialIcons name="home" size={24} color="darkgreen" />
                    {greenSoldiers.find(obj => obj.isOut === true) &&
                        <Player color={greenSoldiers[0].color} />}
                </View>
                {/* Red quadrant */}
                <View style={[styles.quadrant, styles.red]}>
                    <MaterialIcons name="home" size={24} color="darkred" />
                    {redSoldiers.find(obj => obj.isOut === true) &&
                        <Player color={redSoldiers[0].color} />}
                </View>
                {/* Blue quadrant */}
                <View style={[styles.quadrant, styles.blue]}>
                    <MaterialIcons name="home" size={24} color="darkblue" />
                    {blueSoldiers.find(obj => obj.isOut === true) &&
                        <Player color={blueSoldiers[0].color} />}
                </View>
            </View>
        </View>
    );
}

