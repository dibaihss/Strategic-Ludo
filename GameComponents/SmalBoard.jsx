import { View, Text, StyleSheet, Pressable } from "react-native";
import React, { useState } from 'react';
import Player from './Player';

export default function SmalBoard() {
    const colors = ["red", "yellow", "blue", "green"];
    const directions = ["left", "top", "bottom", "right"];

    const [player, setPlayerPosition] = useState('1a')

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

    const movePlayer = () => {
        setPlayerPosition(prev => {
            const numbers = prev.match(/\d+/)[0];
            const letters = prev.match(/[a-zA-Z]+/)[0];
            console.log("First letter:", letters);

            const nextPosition = parseInt(prev) + 1;

            let categorie = letters
            switch (prev) {
                case '12a':
                    return '1b';
                case '12b':
                    return '1c';
                case '12c':
                    return '1d';
                default:
                    break;
            }

            // console.log(categorie)
            return nextPosition.toString() + categorie;
        });
    };

    const renderBox = (number, i, color) => (
        <View key={`${color}-${i}`} style={[styles.verbBox, { position: 'relative' }]}>
            <Text style={styles.verbText}>{number}</Text>
            {number === player && <Player color={color} />}
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.cross}>
                <View style={styles.verticalContainer}>
                    <View style={styles.verticalColumn}>
                        {verbs.column1.map((number, i) => renderBox(number, i, 'blue'))}
                    </View>
                    <View style={styles.verticalColumn}>
                        {verbs.column2.map((number, i) => renderBox(number, i, 'red'))}
                    </View>
                </View>

                <View style={[styles.verticalContainer, { marginLeft: 100 }]}>
                    <View style={styles.verticalColumn}>
                        {verbs.column3.map((number, i) => renderBox(number, i, 'yellow'))}
                    </View>
                    <View style={styles.verticalColumn}>
                        {verbs.column4.map((number, i) => renderBox(number, i, 'green'))}
                    </View>
                </View>

                <View style={styles.horizontalContainer}>
                    <View style={[styles.horizontalRow, { transform: [{ rotate: "90deg" }] }]}>
                        {verbs.row1.map((number, i) => renderBox(number, i, 'blue'))}
                    </View>
                    <View style={styles.horizontalRow}>
                        {verbs.row2.map((number, i) => renderBox(number, i, 'red'))}
                    </View>
                </View>

                <View style={[styles.horizontalContainer, { marginTop: 100 }]}>
                    <View style={styles.horizontalRow}>
                        {verbs.row3.map((number, i) => renderBox(number, i, 'yellow'))}
                    </View>
                    <View style={[styles.horizontalRow, { transform: [{ rotate: "90deg" }] }]}>
                        {verbs.row4.map((number, i) => renderBox(number, i, 'green'))}
                    </View>
                </View>

                <View style={styles.controls}>
                    <Pressable
                        style={styles.button}
                        onPress={movePlayer}
                    >

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

