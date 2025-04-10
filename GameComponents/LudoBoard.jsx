import { View, Text, StyleSheet, Pressable } from "react-native";
import React, { useState } from 'react';
import Player from './Player';

export default function LudoBoard() {

    const colors = ["red", "yellow", "blue", "green"];
    const directions = ["left", "top", "bottom", "right"];

    const verbs = {
        red: ["1", "2", "3", "4", "5", "6"],
        yellow: ["1", "2", "3", "4", "5", "6"],
        green: ["1", "2", "3", "4", "5", "6"],
        blue: ["1", "2", "3", "4", "5", "6"]
    };

    const [playerPosition, setPlayerPosition] = useState({
        x: 20, // Starting position
        y: 20,
        currentBox: 0
    });

    const movePlayer = (steps) => {
        setPlayerPosition(prev => {
            const newBox = (prev.currentBox + steps) % 24; // 24 boxes total around the board
            
            // Calculate new position based on box number
            let newX = prev.x;
            let newY = prev.y;

            // This is a basic movement pattern - you'll need to adjust coordinates
            // based on your specific board layout
            if (newBox < 6) {
                newX = 20 + (newBox * 40);
                newY = 20;
            } else if (newBox < 12) {
                newX = 260;
                newY = 20 + ((newBox - 6) * 40);
            } else if (newBox < 18) {
                newX = 260 - ((newBox - 12) * 40);
                newY = 260;
            } else {
                newX = 20;
                newY = 260 - ((newBox - 18) * 40);
            }

            return {
                x: newX,
                y: newY,
                currentBox: newBox
            };
        });
    };

return (
    <View style={styles.container}>
        {/* Center cross */}
        <View style={styles.cross}>
            <View style={styles.crossInner}>
                {/* Vertical columns container */}
                <View style={styles.verticalContainer}>
                    <View style={styles.verticalColumn}>
                        {verbs.yellow.map((verb, i) => (
                            <Text key={`yellow-${i}`} style={styles.verbBox}>{verb}</Text>
                        ))}
                    </View>
                    <View style={styles.verticalColumn}>
                        {verbs.blue.map((verb, i) => (
                            <Text key={`blue-${i}`} style={styles.verbBox}>{verb}</Text>
                        ))}
                    </View>
                </View>
                <View style={[styles.verticalContainer, {marginLeft: 45}]}>
                    <View style={styles.verticalColumn}>
                        {verbs.yellow.map((verb, i) => (
                            <Text key={`yellow-${i}`} style={styles.verbBox}>{verb}</Text>
                        ))}
                    </View>
                    <View style={styles.verticalColumn}>
                        {verbs.blue.map((verb, i) => (
                            <Text key={`blue-${i}`} style={styles.verbBox}>{verb}</Text>
                        ))}
                    </View>
                </View>

                {/* Horizontal rows container */}
                <View style={styles.horizontalContainer}>
                    <View style={styles.horizontalRow}>
                        {verbs.red.map((verb, i) => (
                            <Text key={`red-${i}`} style={styles.verbBox}>{verb}</Text>
                        ))}
                    </View>
                    <View style={styles.horizontalRow}>
                        {verbs.green.map((verb, i) => (
                            <Text key={`green-${i}`} style={styles.verbBox}>{verb}</Text>
                        ))}
                    </View>
                </View>
                <View style={[styles.horizontalContainer, {marginTop: 45}]}>
                    <View style={styles.horizontalRow}>
                        {verbs.red.map((verb, i) => (
                            <Text key={`red-${i}`} style={styles.verbBox}>{verb}</Text>
                        ))}
                    </View>
                    <View style={styles.horizontalRow}>
                        {verbs.green.map((verb, i) => (
                            <Text key={`green-${i}`} style={styles.verbBox}>{verb}</Text>
                        ))}
                    </View>
                </View>
            </View>
            <Player 
                position={playerPosition}
                color="red"
            />

            {/* Add movement controls */}
            <View style={styles.controls}>
                <Pressable 
                    style={styles.button}
                    onPress={() => movePlayer(1)}
                >
                    <Text>Move 1 Step</Text>
                </Pressable>
                <Pressable 
                    style={styles.button}
                    onPress={() => movePlayer(6)}
                >
                    <Text>Move 6 Steps</Text>
                </Pressable>
            </View>
        </View>

        {/* Rest of the code... */}

            {/* Corners */}
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

    )
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
        transform: [{ rotate: "90deg" }],
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

