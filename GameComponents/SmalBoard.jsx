import { View, Text, StyleSheet, Pressable } from "react-native";
import React, { useState } from 'react';
import Player from './Player';
import { MaterialIcons } from '@expo/vector-icons';

export default function SmalBoard() {
    const colors = ["red", "yellow", "blue", "green"];
    const directions = ["left", "top", "bottom", "right"];

    const [player, setPlayerPosition] = useState({ position: '1a', color: "blue" })
    const [player2, setPlayerPosition2] = useState({ position: '1b', color: "red" })
    const [player3, setPlayerPosition3] = useState({ position: '1c', color: "yellow" })

    const verbs = {
        column1: ["12b", "11b", "10b", "9b", "8b", "7b"],
        column2: ["6a", "5a", "4a", "3a", "2a", "1a"],
        column3: ["1c", "2c", "3c", "4c", "5c", "6c"],
        column4: ["7d", "8d", "9d", "10d", "11d", "12d"],
        row1: ["6b", "5b", "4b", "3b", "2b", "1b"],
        row2: ["7c", "8c", "9c", "10c", "11c", "12c"],
        row3: ["12a", "11a", "10a", "9a", "8a", "7a"],
        row4: ["1d", "2d", "3d", "4d", "5d", "6d"]
    };

    const updatePlayerPosition = (prev) => {
        const numbers = prev.position.match(/\d+/)[0];
        const letters = prev.position.match(/[a-zA-Z]+/)[0];

        let nextPosition = parseInt(prev.position) + 1;

        let categorie = letters
        switch (prev.position) {
            case '12a':
                return {
                    ...prev,  // Spread existing state to preserve other properties
                    position: `1b` // Update only the position
                };
            case '12b':
                return {
                    ...prev,  // Spread existing state to preserve other properties
                    position: `1c` // Update only the position
                };
            case '12c':
                return {
                    ...prev,  // Spread existing state to preserve other properties
                    position: `1d` // Update only the position
                };
            case '12d':
                return {
                    ...prev,  // Spread existing state to preserve other properties
                    position: `1a` // Update only the position
                };
            default:
                break;
        }

        // console.log(categorie)
        let newPosition = nextPosition.toString() + categorie;

        return {
            position: newPosition,
            color: prev.color
        };
    }
    const movePlayer = (playerNum) => {
        switch (playerNum) {
            case 1:
                setPlayerPosition(prev => updatePlayerPosition(prev)
                );
                break;
            case 2:
                setPlayerPosition2(prev => updatePlayerPosition(prev)
                );
                break;
            case 3:
                setPlayerPosition3(prev => updatePlayerPosition(prev)
                );
                break;
            default:
                break;
        }

    };

    const renderBox = (number, i) => (
        <View key={i + player.position} style={[styles.verbBox, { position: 'relative' }]}>
            <Text style={styles.verbText}>{number}</Text>
            {number === player.position && <Player color={player.color} />}
            {number === player2.position && <Player color={player2.color} />}
            {number === player3.position && <Player color={player3.color} />}
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.cross}>
                <View style={styles.verticalContainer}>
                    <View style={styles.verticalColumn}>
                        {verbs.column1.map((number, i) => renderBox(number, i))}
                    </View>
                    <View style={styles.verticalColumn}>
                        {verbs.column2.map((number, i) => renderBox(number, i))}
                    </View>
                </View>

                <View style={[styles.verticalContainer, { marginLeft: 100 }]}>
                    <View style={styles.verticalColumn}>
                        {verbs.column3.map((number, i) => renderBox(number, i))}
                    </View>
                    <View style={styles.verticalColumn}>
                        {verbs.column4.map((number, i) => renderBox(number, i))}
                    </View>
                </View>

                <View style={styles.horizontalContainer}>
                    <View style={[styles.horizontalRow, { transform: [{ rotate: "90deg" }] }]}>
                        {verbs.row1.map((number, i) => renderBox(number, i))}
                    </View>
                    <View style={styles.horizontalRow}>
                        {verbs.row2.map((number, i) => renderBox(number, i))}
                    </View>
                </View>

                <View style={[styles.horizontalContainer, { marginTop: 100 }]}>
                    <View style={styles.horizontalRow}>
                        {verbs.row3.map((number, i) => renderBox(number, i))}
                    </View>
                    <View style={[styles.horizontalRow, { transform: [{ rotate: "90deg" }] }]}>
                        {verbs.row4.map((number, i) => renderBox(number, i))}
                    </View>
                </View>

                <View style={styles.controls}>
                    <Pressable
                        style={styles.button}
                        onPress={() => movePlayer(1)}
                    >
                        <MaterialIcons name="arrow-forward" size={24} color="black" />
                        <Text style={styles.buttonText}>Move</Text>
                    </Pressable>
                    <Pressable
                        style={styles.button}
                        onPress={() => movePlayer(2)}
                    >
                        <MaterialIcons name="casino" size={24} color="black" />
                        <Text style={styles.buttonText}>Roll</Text>
                    </Pressable>
                </View>
            </View>

            {colors.map((color, i) => (
                <View
                    key={color}
                    style={[styles.corner, styles[color], styles[directions[i]]]}
                >
                    {[...Array(4)].map((_, j) => (
                        <View key={j} style={styles.circle} />
                    ))}
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
    },
    cross: {
        position: "absolute",
        width: "80%",
        height: "80%",
        justifyContent: "center",
        alignItems: "center",
    },
    crossInner: {
        width: "100%",
        height: "100%",
        position: "relative",
    },
    verticalContainer: {
        position: "absolute",
        top: 0,
        bottom: 0,
        width: "100%",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
    },
    horizontalContainer: {
        position: "absolute",
        left: 0,
        right: 0,
        height: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    verticalColumn: {
        width: "auto",
        padding: 3,
    },
    horizontalRow: {
        width: "auto",
        padding: 3,
        transform: [{ rotate: "-90deg" }],
    },
    verbBox: {
        backgroundColor: "#eee",
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 6,
        margin: 2,
        minWidth: 40,
        textAlign: "center",
    },
    corner: {
        position: "absolute",
        width: 100,
        height: 100,
        borderRadius: 10,
        flexWrap: "wrap",
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        padding: 10,
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
    },
    bottom: {
        bottom: 20,
        left: 20,
    },
    right: {
        bottom: 20,
        right: 20,
    },
    circle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: "white",
        margin: 5,
        borderWidth: 1,
        borderColor: "#000",
    },
    controls: {
        position: 'absolute',
        bottom: 20,
        flexDirection: 'row',
        gap: 10,
    },
    button: {
        padding: 10,
        backgroundColor: '#ddd',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#999',
    },
});


{/* 

<Text>ludoBoard</Text>
      {/* <View >
      <View style={{ width: 30, height: 30, backgroundColor: 'blue' }}></View>
      <View style={{ width: 30, height: 30, backgroundColor: 'red' }}></View>
        <View style={{ width: 30, height: 30, backgroundColor: 'green' }}></View>
        <View style={{ width: 30, height: 30, backgroundColor: 'yellow' }}></View>
        <View style={{ width: 30, height: 30, backgroundColor: 'red' }}></View>
        <View style={{ width: 30, height: 30, backgroundColor: 'green' }}></View>
        </View> */}

