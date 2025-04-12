import { View, Text, StyleSheet, Pressable } from "react-native";
import React, { useState } from 'react';
import Player from './Player';
import { MaterialIcons } from '@expo/vector-icons';


export default function SmalBoard() {
    const boxes = {
        column1: ["12b", "11b", "10b", "9b", "8b", "7b"],
        column2: ["6a", "5a", "4a", "3a", "2a", "1a"],
        column3: ["1c", "2c", "3c", "4c", "5c", "6c"],
        column4: ["7d", "8d", "9d", "10d", "11d", "12d"],
        row1: ["6b", "5b", "4b", "3b", "2b", "1b"],
        row2: ["7c", "8c", "9c", "10c", "11c", "12c"],
        row3: ["12a", "11a", "10a", "9a", "8a", "7a"],
        row4: ["1d", "2d", "3d", "4d", "5d", "6d"]
    };

    const categories = ["a", "b", "c", "d"];

    const directions = ["left", "top", "bottom", "right"];
    const playerType = ["red", "yellow", "blue", "green"]

    const [currentPlayer, setCurrentPlayer] = useState(1);

    const [blueSoldiers, setBlueSoldiers] = useState([
        { id: 1, position: '1a', color: "blue", initialPosition: '1a', onBoard: true, isOut: false },
        { id: 2, position: '2blue', color: "blue", initialPosition: '2blue', onBoard: false, isOut: false },
        { id: 3, position: '3blue', color: "blue", initialPosition: '3blue', onBoard: false, isOut: false },
        { id: 4, position: '4blue', color: "blue", initialPosition: '4blue', onBoard: false, isOut: false }
    ]);


    const [redSoldiers, setRedSoldiers] = useState([
        { id: 5, position: '1b', color: "red", initialPosition: '1b', onBoard: true, isOut: false },
        { id: 6, position: '2red', color: "red", initialPosition: '2red', onBoard: false, isOut: false },
        { id: 7, position: '3red', color: "red", initialPosition: '3red', onBoard: false, isOut: false },
        { id: 8, position: '4red', color: "red", initialPosition: '4red', onBoard: false, isOut: false }
    ]);

    const getNextCatergory = (currentCategory) => {
        const currentIndex = categories.indexOf(currentCategory);
        const nextIndex = (currentIndex + 1) % categories.length;
        return categories[nextIndex];
    };

    const CheckOutOfBoardCondition = (position) => {

        switch (currentPlayer.color) {
            case 'blue':
                if (position === '6d') {
                    setCurrentPlayer("")
                    return true;
                }
                break;
            case 'red':
                if (position === '6a') {
                    setCurrentPlayer("")
                    return true;
                }
                break;
            case 'yellow':
                if (position === '6b') {
                    setCurrentPlayer("")
                    return true;
                }
                break;
            case 'green':
                if (position === '6c') {
                    setCurrentPlayer("")
                    return true;
                }
                break;
            default:
                break;
        }

    }

    const updateObject = (prev, newPosition, options = {}) => {
        setCurrentPlayer((prev) => (
            console.log(prev),
            {
                ...prev,
                position: newPosition,
            }
        ));

        return prev.map((soldier) => {
            if (soldier.id === currentPlayer.id) {
                return {
                    ...soldier,
                    position: newPosition,
                    onBoard: options.onBoard ?? true,
                    isOut: options.isOut ?? false
                };
            }
            return soldier;
        });
    };
    const updatePlayerPosition = (prev, steps) => {

        if (currentPlayer.isOut === true) return prev;

        let numbers = parseInt(currentPlayer.position.match(/\d+/)[0]);
        let categorie = currentPlayer.position.match(/[a-zA-Z]+/)[0];

        if(steps === 1) {
            numbers = numbers === 12 ? 1 : numbers + 1;
            categorie = numbers === 1 ? getNextCatergory(categorie) : categorie;
            if (CheckOutOfBoardCondition(numbers + categorie)) {
                return updateObject(prev, "", { onBoard: false, isOut: true });
            }
            return updateObject(prev, numbers + categorie);
        }

        for(let i = 0; i < steps; i++) {
            numbers = numbers === 12 ? 1 : numbers + 1;
            categorie = numbers === 1 ? getNextCatergory(categorie) : categorie;
               
            if (CheckOutOfBoardCondition(numbers + categorie)) {
                return updateObject(prev, "", { onBoard: false, isOut: true });
            }
        }
        return updateObject(prev, numbers + categorie);
    }

    const movePlayer = (steps) => {
        if (!currentPlayer) return;
        switch (currentPlayer.color) {
            case "blue":
                setBlueSoldiers(prev => updatePlayerPosition(prev, steps));
                break;
            case 'red':
                setRedSoldiers(prev => updatePlayerPosition(prev, steps)
                );
                break;
            default:
                break;
        }
    };

    const enterNewSoldier = (color) => {

        switch (color) {
            case 'blue':
                const NotOnBoardSoldier = blueSoldiers.find(soldier =>
                    soldier.onBoard === false && soldier.isOut === false
                )
                if (!NotOnBoardSoldier) return; // No available soldier to place

                setBlueSoldiers(prev => prev.map(soldier =>
                    soldier.id === NotOnBoardSoldier.id
                        ? { ...soldier, position: "1a" }
                        : soldier
                ));

                break;
            case 'red':
                const NotOnBoardSoldier1 = redSoldiers.find(soldier =>
                    soldier.onBoard === false && soldier.isOut === false
                )
                console.log(NotOnBoardSoldier1)
                if (!NotOnBoardSoldier1) return; // No available soldier to place

                setRedSoldiers(prev => prev.map(soldier =>
                    soldier.id === NotOnBoardSoldier1.id
                        ? { ...soldier, position: "1b" }
                        : soldier
                ));
                break;
            // case 'yellow':
            //     setPlayerPosition3(prev => ({ ...prev, position: '1c', onBoard: true }));
            //     break;
            // case 'green':
            //     setPlayerPosition3(prev => ({ ...prev, position: '1d', onBoard: true }));
            //     break;
            default:
                break;
        }
    };

    const currentSelectedPlayer = (selectedPlayer) => {
        setCurrentPlayer(selectedPlayer);
    }


    const renderBox = (number, i) => (
        <View
            // Fix: Use string concatenation for the key instead of addition
            key={`box-${i}-${number}`}
            style={[styles.verbBox, { position: 'relative' }]}
        >
            <Text style={styles.verbText}>{number}</Text>
            {blueSoldiers.map((soldier, index) =>
                soldier.position === number && (
                    <Player
                        key={`blue-${soldier.id}`}
                        isSelected={currentPlayer.id === soldier.id}
                        onPress={() => currentSelectedPlayer(soldier)}
                        color={soldier.color}
                    />
                )
            )}
            {redSoldiers.map((soldier, index) =>
                soldier.position === number && (
                    <Player
                        key={`red-${soldier.id}`}
                        isSelected={currentPlayer.id === soldier.id}
                        onPress={() => currentSelectedPlayer(soldier)}
                        color={soldier.color}
                    />
                )
            )}
        </View>
    );

    const renderInCirclePlayers = (j, playerType, i) => (
        <>
            {[
                ...blueSoldiers.map(soldier => ({ player: soldier })),
                ...redSoldiers.map(soldier => ({ player: soldier }))
            ].map((item) => (
                item.player.position === `${j + 1}${playerType[i]}` && (
                    <Player
                        key={`circle-player-${item.player.id}`}
                        color={item.player.color}
                        size={20}
                        style={styles.cornerPlayer}
                    />
                )
            ))}
        </>
    );
    const renderControls = () => {
        return (
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
                    onPress={() => movePlayer(6)}
                >
                    <MaterialIcons name="casino" size={24} color="black" />
                    <Text style={styles.buttonText}>Roll</Text>
                </Pressable>
                <Pressable
                    style={styles.button}
                    onPress={() => enterNewSoldier(currentPlayer?.color)}
                >
                    <MaterialIcons name="add" size={24} color="black" />
                    <Text style={styles.buttonText}>Enter</Text>
                </Pressable>
            </View>
        );
    };
    const renderGoals = () => {
        return (
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
                        {redSoldiers.find(obj => obj.isOut === true) &&
                            <Player color={redSoldiers[0].color} />}
                    </View>
                    {/* Blue quadrant */}
                    <View style={[styles.quadrant, { backgroundColor: '#88f' }]}>
                        <MaterialIcons name="home" size={24} color="darkblue" />
                        {blueSoldiers.find(obj => obj.isOut === true) &&
                            <Player color={blueSoldiers[0].color} />}
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.cross}>
                <View style={styles.verticalContainer}>
                    <View style={[styles.verticalColumn, { marginBottom: 100, marginTop: 0 }]}>
                        {boxes.column1.map((number, i) => renderBox(number, i))}
                    </View>
                    <View style={styles.verticalColumn}>
                        {boxes.column2.map((number, i) => renderBox(number, i))}
                    </View>
                </View>

                <View style={[styles.verticalContainer, { marginLeft: 100 }]}>
                    <View style={[styles.verticalColumn, { marginBottom: 100 }]}>
                        {boxes.column3.map((number, i) => renderBox(number, i))}
                    </View>
                    <View style={styles.verticalColumn}>
                        {boxes.column4.map((number, i) => renderBox(number, i))}
                    </View>
                </View>

                <View style={styles.horizontalContainer}>
                    <View style={[styles.horizontalRow, { transform: [{ rotate: "90deg" }] }]}>
                        {boxes.row1.map((number, i) => renderBox(number, i))}
                    </View>
                    <View style={styles.horizontalRow}>
                        {boxes.row2.map((number, i) => renderBox(number, i))}
                    </View>
                </View>

                <View style={[styles.horizontalContainer, { marginTop: 100 }]}>
                    <View style={styles.horizontalRow}>
                        {boxes.row3.map((number, i) => renderBox(number, i))}
                    </View>
                    <View style={[styles.horizontalRow, { transform: [{ rotate: "90deg" }] }]}>
                        {boxes.row4.map((number, i) => renderBox(number, i))}
                    </View>
                </View>

                {renderControls()}

            </View>
            {renderGoals()}

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