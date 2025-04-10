import { View, Text, StyleSheet, Pressable } from "react-native";
import React, { useState } from 'react';
import Player from './Player';

export default function SmalBoard() {
    const colors = ["red", "yellow", "blue", "green"];
    const directions = ["left", "top", "bottom", "right"];

    const [player, setPlayerPosition] = useState('1')

    const verbs = {
        column1: ["48", "47", "46", "45", "44", "43"],
        column2: ["42", "41", "40", "39", "38", "37"],
        column3: ["36", "35", "34", "33", "32", "31"],
        column4: ["30", "29", "28", "27", "26", "25"],
        row1: ["24", "23", "22", "21", "20", "19"],
        row2: ["18", "17", "16", "15", "14", "13"],
        row3: ["12", "11", "10", "9", "8", "7"],
        row4: ["6", "5", "4", "3", "2", "1"]
    };

    const movePlayer = () => {
        setPlayerPosition(prev => {
            const nextPosition = parseInt(prev) - 1;
            return nextPosition < 1 ? '48' : nextPosition.toString();
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
                    <View style={styles.horizontalRow}>
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
                    <View style={styles.horizontalRow}>
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

