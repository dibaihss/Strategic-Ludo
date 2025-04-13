import { View, Pressable, Text, StyleSheet } from "react-native";
import React from 'react';
import Player from './Player';
import { useDispatch, useSelector } from 'react-redux';
import {
    enterNewSoldier
} from '../assets/store/gameSlice.jsx';

import { directions, playerType } from "../assets/shared/hardCodedData.js";
import { MaterialIcons } from '@expo/vector-icons';
import Feather from '@expo/vector-icons/Feather';

export default function Bases() {
    // Get soldiers from Redux store
    const blueSoldiers = useSelector(state => state.game.blueSoldiers);
    const redSoldiers = useSelector(state => state.game.redSoldiers);

    const dispatch = useDispatch();

    const handleEnterNewSoldier = (color) => {
        dispatch(enterNewSoldier({ color }));
    };
    const getCorrectArrow = (color) => {
        switch (color) {
            case "red":
                return "arrow-downward";
            case "blue":
                return "arrow-forward";
            case "green":
                return "arrow-downward";
            default:
                return "arrow-forward-ios";
        }
    };

    const renderInCirclePlayers = (j, playerType, i) => (
        <>
            {[
                ...blueSoldiers.map(soldier => ({ player: soldier })),
                ...redSoldiers.map(soldier => ({ player: soldier }))
            ].map((item, index) => (
                item.player.position === `${j + 1}${playerType[i]}` && (
                    <Player
                        key={`circle-player-${item.player.id}-${index}`}
                        color={item.player.color}
                        size={20}
                        style={styles.cornerPlayer}
                    />
                )
            ))}
        </>
    );


    return (
        <>
            {playerType.map((color, i) => (
                <View key={color} style={[styles.circleContainer, styles[directions[i]]]}>
                    <View style={{ flexDirection: 'column' }}>
                        <View style={{ display: "flex" }}>
                            <Pressable style={[styles.button, { marginVertical: 5 }]} onPress={() => handleEnterNewSoldier(color)}>
                                <Text style={styles.buttonText}>1</Text>
                            </Pressable>
                            <Pressable style={[styles.button, { marginVertical: 5 }]} onPress={() => handleEnterNewSoldier(color)}>
                                <Text style={styles.buttonText}>2</Text>
                            </Pressable>
                            <Pressable style={[styles.button, { marginVertical: 5 }]} onPress={() => handleEnterNewSoldier(color)}>
                                <Text style={styles.buttonText}>3</Text>
                            </Pressable>
                            <Pressable style={[styles.button, { marginVertical: 5 }]} onPress={() => handleEnterNewSoldier(color)}>
                                <Text style={styles.buttonText}>4</Text>
                            </Pressable>
                            <Pressable style={[styles.button, { marginVertical: 5 }]} onPress={() => handleEnterNewSoldier(color)}>
                                <Text style={styles.buttonText}>5</Text>
                            </Pressable>
                            <Pressable style={[styles.button, { marginVertical: 5 }]} onPress={() => handleEnterNewSoldier(color)}>
                                <Text style={styles.buttonText}>1</Text>
                            </Pressable>
                        </View>


                    </View>
                    <View style={[styles.corner, styles[color]]}>
                        {[...Array(4)].map((_, j) => (
                            <View key={j} style={styles.circle}>
                                {renderInCirclePlayers(j, playerType, i)}
                            </View>
                        ))}
                    </View>
                    <Pressable style={[styles.button, { marginVertical: 5 }]} onPress={() => handleEnterNewSoldier(color)}>
                        {
                            color === "yellow" ?
                                <Feather name="arrow-right" size={24} color="black" /> :
                                <MaterialIcons name={getCorrectArrow(color)} size={24} color="black" />
                        }
                    </Pressable>
                </View>
            ))}
        </>
    );
}

const styles = StyleSheet.create({
    circleContainer: {
        position: "absolute",
        flexDirection: 'row',
        alignItems: 'center',
        gap: 40,
    },
    corner: {
        width: 120,
        height: 120,
        borderRadius: 10,
        flexWrap: "wrap",
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        padding: 10,
        borderWidth: 2,
        borderColor: '#000',
    },
    circle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: "white",
        margin: 5,
        borderWidth: 1,
        borderColor: "#000",
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden', // Add this to keep player within circle
    },
    cornerPlayer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [
            { translateX: -10 },
            { translateY: -10 }
        ],
    },
    red: {
        backgroundColor: "#f88",
    },
    yellow: {
        backgroundColor: "#ff8",
    },
    blue: {
        backgroundColor: "#88f",
    },
    green: {
        backgroundColor: "#8f8",
    },
    left: {
        top: 20,
        left: 20,
    },
    top: {
        top: 20,
        right: 20,
        transform: [{ rotate: '180deg' }]
    },
    bottom: {
        bottom: 20,
        left: 20,
    },
    right: {
        bottom: 20,
        right: 20,
        transform: [{ rotate: '180deg' }]
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        gap: 8,
    },
    buttonText: {
        fontSize: 10,
        color: '#333',
        fontWeight: '1000',
    },

});


