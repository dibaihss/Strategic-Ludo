import { View, Text, StyleSheet, Pressable } from "react-native";
import React, { useState } from 'react';
import Player from './Player';
import { MaterialIcons } from '@expo/vector-icons';

export default function SmalBoard() {
    const directions = ["left", "top", "bottom", "right"];
    const playerType = ["red", "yellow", "blue", "green"]

    const [playerBlue1, setPlayerBlue1Position] = useState({ position: '1a', color: "blue", initialPosition: '1a', onBoard: false })
    const [playerBlue2, setPlayerBlue2Position] = useState({ position: '2blue', color: "blue", initialPosition: '2blue', onBoard: false })
    const [playerBlue3, setPlayerBlue3Position] = useState({ position: '3blue', color: "blue", initialPosition: '3blue', onBoard: false })
    const [playerBlue4, setPlayerBlue4Position] = useState({ position: '4blue', color: "blue", initialPosition: '4blue', onBoard: false })

    const [playerRed1, setPlayerRed1Position] = useState({ position: '1b', color: "red", initialPosition: '1b', onBoard: false })
    const [playerRed2, setPlayerRed2Position] = useState({ position: '2red', color: "red", initialPosition: '2red', onBoard: false })
    const [playerRed3, setPlayerRed3Position] = useState({ position: '3red', color: "red", initialPosition: '3red', onBoard: false })
    const [playerRed4, setPlayerRed4Position] = useState({ position: '4red', color: "red", initialPosition: '4red', onBoard: false })

    const [player3, setPlayerPosition3] = useState({ position: '1c', color: "yellow", initialPosition: '1c' })

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
    const CheckOutOfBoardCondition = (prev) => {

        switch (prev.color) {
            case 'blue':
                if (prev.position === '6d') {
                    return { ...prev, position: "", onBoard: true };
                }
                break;
            case 'red':
                if (prev.position === '6a') {
                    return { ...prev, position: "", onBoard: true };
                }
                break;
            case 'yellow':
                if (prev.position === '6b') {
                    return { ...prev, position: "", onBoard: false };
                }
                break;
            case 'green':
                if (prev.position === '6c') {
                    return { ...prev, position: "", onBoard: false };
                }
                break;
            default:
                break;
        }

    }

    const updatePlayerPosition = (prev) => {
        if (prev.onBoard === true) {
            return prev;
        }

        if (!CheckOutOfBoardCondition(prev)) {
          
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
                ...prev,  // Spread existing state to preserve other properties
                // Update only the position
                // position: newPosition,}
                position: newPosition,

            };
        } else {
            return CheckOutOfBoardCondition(prev)

        }
    }
    const movePlayer = (playerNum) => {
        switch (playerNum) {
            case 1:
                setPlayerBlue1Position(prev => updatePlayerPosition(prev)
                );
                break;
            case 2:
                setPlayerRed1Position(prev => updatePlayerPosition(prev)
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

    const enterNewSoldier = (color) => {
        // Check if the player is already on the board
    
        switch (color) {
            case 'blue':
                setPlayerBlue1Position(prev => ({ ...prev, position: '1a', onBoard: true }));
                break;
            case 'red':
                setPlayerRed1Position(prev => ({ ...prev, position: '1b', onBoard: true }));
                break;
            case 'yellow':
                setPlayerPosition3(prev => ({ ...prev, position: '1c', onBoard: true }));
                break;
            case 'green':
                setPlayerPosition3(prev => ({ ...prev, position: '1d', onBoard: true }));
                break;
            default:
                break;
        }
    };

    const renderBox = (number, i) => (
        <View key={i + playerBlue1.position} style={[styles.verbBox, { position: 'relative' }]}>
            <Text style={styles.verbText}>{number}</Text>
            {number === playerBlue1.position && <Player color={playerBlue1.color} />}
            {number === playerRed1.position && <Player color={playerRed1.color} />}
            {number === player3.position && <Player color={player3.color} />}
        </View>
    );

    const renderInCirclePlayers = (j, playerType, i) => (
        <>
            {[
                { player: playerBlue1 },
                { player: playerBlue2 },
                { player: playerBlue3 },
                { player: playerBlue4 },
                { player: playerRed1 },
                { player: playerRed2 },
                { player: playerRed3 },
                { player: playerRed4 },
                { player: player3 }
            ].map((item, index) => (
                item.player.initialPosition === `${j + 1}${playerType[i]}` && (
                    <Player
                        key={`player-${index}`}
                        color={item.player.color}
                        size={20}
                        style={styles.cornerPlayer}
                    />
                )
            ))}
        </>
    );

    return (
        <View style={styles.container}>
            <View style={styles.cross}>
                <View style={styles.verticalContainer}>
                    <View style={[styles.verticalColumn, { marginBottom: 100, marginTop: 0 }]}>
                        {verbs.column1.map((number, i) => renderBox(number, i))}
                    </View>
                    <View style={styles.verticalColumn}>
                        {verbs.column2.map((number, i) => renderBox(number, i))}
                    </View>
                </View>

                <View style={[styles.verticalContainer, { marginLeft: 100 }]}>
                    <View style={[styles.verticalColumn, { marginBottom: 100 }]}>
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
                    <Pressable
                        style={styles.button}
                        onPress={() => enterNewSoldier('blue')}
                    >
                        <MaterialIcons name="plus" size={24} color="black" />
                        <Text style={styles.buttonText}>Roll</Text>
                    </Pressable>
                </View>
            </View>
            <View style={styles.centerCircle}>
                <View style={styles.centerQuadrants}>
                    {/* Yellow quadrant */}
                    <View style={[styles.quadrant, { backgroundColor: '#ff8' }]}>
                        <MaterialIcons name="home" size={24} color="goldenrod" />
                    </View>
                    {/* Green quadrant */}
                    <View style={[styles.quadrant, { backgroundColor: '#8f8' }]}>
                        <MaterialIcons name="home" size={24} color="darkgreen" />
                    </View>
                    {/* Red quadrant */}
                    <View style={[styles.quadrant, { backgroundColor: '#f88' }]}>
                        <MaterialIcons name="home" size={24} color="darkred" />
                        {playerRed1.onBoard && <Player color={playerRed1.color} />}
                    </View>
                    {/* Blue quadrant */}
                    <View style={[styles.quadrant, { backgroundColor: '#88f' }]}>
                        <MaterialIcons name="home" size={24} color="darkblue" />
                        {playerBlue1.onBoard && <Player color={playerBlue1.color} />}
                    </View>
                </View>
            </View>

            {playerType.map((color, i) => (
                <View
                    key={color}
                    style={[styles.corner, styles[color], styles[directions[i]]]}
                >
                    {[...Array(4)].map((_, j) => (
                        <View key={j} style={styles.circle}>
                            {renderInCirclePlayers(j, playerType, i)}
                        </View>
                    ))}
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    centerCircle: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'white',
        borderWidth: 2,
        borderColor: '#000',
        overflow: 'hidden',
        zIndex: 1,
        top: '50%',
        left: '50%',
        transform: [
            { translateX: -36 },
            { translateY: -35 }
        ],
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
    container: {
        flex: 1,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
    },
    cross: {
        position: "absolute",
        width: "90%",
        height: "90%",
        justifyContent: "center",
        alignItems: "center",
    },
    verticalContainer: {
        position: "absolute",
        top: 80,  // Reduced from 100 to give more room
        bottom: 80, // Reduced from 100 to give more room
        width: 50,
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
    },
    horizontalContainer: {
        position: "absolute",
        left: 80,  // Reduced from 100
        right: 80, // Reduced from 100
        height: 50,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    verticalColumn: {
        width: "auto",
        padding: 3,
        marginHorizontal: 15, // Added margin between columns
    },
    horizontalRow: {
        width: "auto",
        padding: 3,
        marginVertical: 15, // Added margin between rows
        transform: [{ rotate: "-90deg" }],
    },
    verbBox: {
        backgroundColor: "#eee",
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 6,
        margin: 2,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    verbText: {
        textAlign: 'center',
        fontSize: 14,
    },
    corner: {
        position: "absolute",
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
    controls: {
        position: 'absolute',
        bottom: -60,
        flexDirection: 'row',
        gap: 20,
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
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
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
});