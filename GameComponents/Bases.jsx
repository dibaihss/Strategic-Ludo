import { View, Pressable, Text, StyleSheet } from "react-native";
import React from 'react';
import Player from './Player';
import { useDispatch, useSelector } from 'react-redux';
import {
    setCurrentPlayer,
    moveSoldier,
    enterNewSoldier,
    updateBlueCards,
    updateRedCards
} from '../assets/store/gameSlice.jsx';


import { categories, directions, playerType } from "../assets/shared/hardCodedData.js";
import { MaterialIcons } from '@expo/vector-icons';
import Feather from '@expo/vector-icons/Feather';

export default function Bases() {
    // Get soldiers from Redux store
    const blueSoldiers = useSelector(state => state.game.blueSoldiers);
    const redSoldiers = useSelector(state => state.game.redSoldiers);
    const currentPlayer = useSelector(state => state.game.currentPlayer);
    const yellowSoldiers = useSelector(state => state.game.yellowSoldiers);
    const greenSoldiers = useSelector(state => state.game.greenSoldiers);

    const blueCards = useSelector(state => state.game.blueCards);
    const redCards = useSelector(state => state.game.redCards);
    const yellowCards = useSelector(state => state.game.yellowCards);
    const greenCards = useSelector(state => state.game.greenCards);

    const dispatch = useDispatch();

    const handleEnterNewSoldier = (color) => {
        dispatch(enterNewSoldier({ color }));
    };

    const movePlayer = (color, steps) => {
        if (!currentPlayer || currentPlayer.isOut) return;
        if (currentPlayer.color !== color) return; // Check if the current player is the one who is trying to move


        if (checkIfCardUsed(color, steps)) return; // Check if the card is already used

        const newPosition = calculateNewPosition(currentPlayer, steps);

        dispatch(moveSoldier({
            color: currentPlayer.color,
            position: newPosition,
            soldierID: currentPlayer.id,
            steps
        }));
        dispatch(setCurrentPlayer({ ...currentPlayer, position: newPosition })); // Clear current player after moving



        // Redudances
        if (currentPlayer.color === 'blue') {
            const checkIfGotEnemy = redSoldiers.filter(soldier => soldier.position === newPosition);
            //    console.log("checkIfGotEnemy", checkIfGotEnemy , currentPlayer.position);
            if (checkIfGotEnemy.length === 1) {
                dispatch(moveSoldier({
                    color: 'red',
                    position: checkIfGotEnemy[0].initialPosition,
                    soldierID: checkIfGotEnemy[0].id,
                    steps: 0
                    , returenToBase: true
                }));
            }
        }

        if (currentPlayer.color === 'red') {
            const checkIfGotEnemy = blueSoldiers.filter(soldier => soldier.position === newPosition);
            //    console.log("checkIfGotEnemy", checkIfGotEnemy , currentPlayer.position);
            if (checkIfGotEnemy.length === 1) {
                dispatch(moveSoldier({
                    color: 'blue',
                    position: checkIfGotEnemy[0].initialPosition,
                    soldierID: checkIfGotEnemy[0].id,
                    steps: 0,
                    returenToBase: true
                }));
            }
        }
    };
    checkIfGotEnemy = (color, position) => {
        if (color === "red") {
            const enemySoldiers = [...blueSoldiers];
        }
        if (color === 'blue') {
            const checkIfGotEnemy = redSoldiers.filter(soldier => soldier.position === position);
            return checkIfGotEnemy.length === 1;
        } else if (color === 'red') {
            const checkIfGotEnemy = blueSoldiers.filter(soldier => soldier.position === position);
            return checkIfGotEnemy.length === 1;
        }
        return false;
    }

    calculateNewPosition = (player, steps) => {
        console.log("Calculating new position for player: ", player);
        if (!player.position || player.isOut) return;
        let numbers = parseInt(player.position.match(/\d+/)[0]);
        let categorie = player.position.match(/[a-zA-Z]+/)[0];

        console.log("Current Player: ", player);

        if (steps === 1) {
            numbers = numbers === 12 ? 1 : numbers + 1;
            categorie = numbers === 1 ? getNextCatergory(categorie) : categorie;
            if (CheckOutOfBoardCondition(numbers + categorie)) {
                return "";
            }
            return numbers + categorie;
        }

        for (let i = 0; i < steps; i++) {
            numbers = numbers === 12 ? 1 : numbers + 1;
            categorie = numbers === 1 ? getNextCatergory(categorie) : categorie;

            if (CheckOutOfBoardCondition(numbers + categorie)) {
                return "";
            }
        }
        return numbers + categorie;
    }

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

    const checkIfCardUsed = (color, steps) => {

        if (color === 'blue') {
            const checkIfareUsed = blueCards.filter(card => card.used === false);


            if (checkIfareUsed.length === 1) {
                dispatch(updateBlueCards({ used: false, value: 0, updateAll: true }));
                return false;
            }
            const card = blueCards.find(card => card.value === steps);

            if (card && card.used) {
                return true;
            }
            dispatch(updateBlueCards({ used: true, value: steps }));
            return false;

        }
        if (color === 'red') {
            const checkIfareUsed = redCards.filter(card => card.used === false);


            if (checkIfareUsed.length === 1) {
                dispatch(updateRedCards({ used: false, value: 0, updateAll: true }));
                return false;
            }
            const card = redCards.find(card => card.value === steps);

            if (card && card.used) {
                return true;
            }
            dispatch(updateRedCards({ used: true, value: steps }));
            return false;

        }
    }

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
                ...redSoldiers.map(soldier => ({ player: soldier })),
                ...yellowSoldiers.map(soldier => ({ player: soldier })),
                ...greenSoldiers.map(soldier => ({ player: soldier }))
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
                            {blueCards.map((card) => (
                                color === "blue" && (
                                    <Pressable
                                        key={card.id}
                                        disabled={card.used}
                                        style={[
                                            styles.button,
                                            { marginVertical: 5 },
                                            card.used && { backgroundColor: '#ddd', opacity: 0.7 }
                                        ]}
                                        onPress={() => movePlayer(color, card.value)}
                                    >
                                        <Text style={[
                                            styles.buttonText,
                                            card.used && { color: '#999' }
                                        ]}>{card.value}</Text>
                                    </Pressable>
                                )
                            ))}
                            {redCards.map((card) => (
                                color === "red" && (
                                    <Pressable
                                        key={card.id}
                                        disabled={card.used}
                                        style={[
                                            styles.button,
                                            { marginVertical: 5 },
                                            card.used && { backgroundColor: '#ddd', opacity: 0.7 }
                                        ]}
                                        onPress={() => movePlayer(color, card.value)}
                                    >
                                        <Text style={[
                                            styles.buttonText,
                                            card.used && { color: '#999' }
                                        ]}>{card.value}</Text>
                                    </Pressable>
                                )
                            ))}
                            {yellowCards.map((card) => (
                                color === "yellow" && (
                                    <Pressable
                                        key={card.id}
                                        disabled={card.used}
                                        style={[
                                            styles.button,
                                            { marginVertical: 5 },
                                            card.used && { backgroundColor: '#ddd', opacity: 0.7 }
                                        ]}
                                        onPress={() => movePlayer(color, card.value)}
                                    >
                                        <Text style={[
                                            styles.buttonText,
                                            card.used && { color: '#999' }
                                        ]}>{card.value}</Text>
                                    </Pressable>
                                )
                            ))}
                            {greenCards.map((card) => (
                                color === "green" && (
                                    <Pressable
                                        key={card.id}
                                        disabled={card.used}
                                        style={[
                                            styles.button,
                                            { marginVertical: 5 },
                                            card.used && { backgroundColor: '#ddd', opacity: 0.7 }
                                        ]}
                                        onPress={() => movePlayer(color, card.value)}
                                    >
                                        <Text style={[
                                            styles.buttonText,
                                            card.used && { color: '#999' }
                                        ]}>{card.value}</Text>
                                    </Pressable>
                                )
                            ))}
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
        fontSize: 14,
        color: '#333',
        fontWeight: '1000',
    },

});


