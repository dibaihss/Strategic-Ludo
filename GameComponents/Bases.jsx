import { View, Pressable, Text, StyleSheet, Alert, Platform, Dimensions } from "react-native";
import React from 'react';
import Player from './Player';
import { useDispatch, useSelector } from 'react-redux';
import {
    setCurrentPlayer,
    enterNewSoldier,
    checkIfCardUsed,
    setActivePlayer,
    resetTimer,
    checkIfGotEnemy
} from '../assets/store/gameSlice.jsx';
import { setBoxesPosition } from '../assets/store/animationSlice.jsx'

import { boxes, categories, directions, playerType } from "../assets/shared/hardCodedData.js";
import { MaterialIcons } from '@expo/vector-icons';
import Feather from '@expo/vector-icons/Feather';

export default function Bases() {

    const dispatch = useDispatch();
    const currentPlayer = useSelector(state => state.game.currentPlayer);
    const activePlayer = useSelector(state => state.game.activePlayer);
    const blueSoldiers = useSelector(state => state.game.blueSoldiers);
    const redSoldiers = useSelector(state => state.game.redSoldiers);
    const yellowSoldiers = useSelector(state => state.game.yellowSoldiers);
    const greenSoldiers = useSelector(state => state.game.greenSoldiers);
    const blueCards = useSelector(state => state.game.blueCards);
    const redCards = useSelector(state => state.game.redCards);
    const yellowCards = useSelector(state => state.game.yellowCards);
    const greenCards = useSelector(state => state.game.greenCards);
    const theme = useSelector(state => state.theme.current);
    const showClone = useSelector(state => state.animation.showClone)

    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height;
    const isSmallScreen = windowWidth < 375 || windowHeight < 667;

    const styles = StyleSheet.create({
        circleContainer: {
            position: "absolute",
            flexDirection: 'row',
            alignItems: 'center',
            gap: isSmallScreen ? 5 : 40,
        },
        corner: {
            width: isSmallScreen ? 50 : 120,
            height: isSmallScreen ? 50 : 120,
            borderRadius: 10,
            flexWrap: "wrap",
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
            padding: isSmallScreen ? 5 : 10,
            borderWidth: isSmallScreen ? 1 : 2,
            elevation: isSmallScreen ? 4 : 5,
        },
        circle: {
            width: isSmallScreen ? 10 : 30,
            height: isSmallScreen ? 10 : 30,
            borderRadius: isSmallScreen ? 14 : 15,
            backgroundColor: "white",
            margin: isSmallScreen ? 4 : 5,
            borderWidth: isSmallScreen ? 0.5 : 1,
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
        },
        cornerPlayer: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: [
                { translateX: isSmallScreen ? -9 : -10 },
                { translateY: isSmallScreen ? -9 : -10 }
            ],
        },
        button: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: isSmallScreen ? 0 : 10,
            paddingHorizontal: isSmallScreen ? 12 : 15,
            backgroundColor: theme.colors.button,
            borderRadius: 8,
            borderWidth: isSmallScreen ? 0.5 : 1,
            borderColor: theme.colors.buttonBorder,
            gap: 8,
            elevation: isSmallScreen ? 2 : 0,
            minWidth: isSmallScreen ? 5 : 'auto',
        },
        buttonText: {
            fontSize: isSmallScreen ? 12 : 14,
            color: theme.colors.buttonText,
            fontWeight: isSmallScreen ? 'bold' : '1000',
        },
        // Update positioning for corners
        left: {
            top: isSmallScreen ? 3 : 20,
            left: isSmallScreen ? 3 : 20,
        },
        top: {
            top: isSmallScreen ? 3 : 20,
            right: isSmallScreen ? 3 : 20,
            transform: [{ rotate: '180deg' }]
        },
        bottom: {
            bottom: isSmallScreen ? 3 : 20,
            left: isSmallScreen ? 3 : 20,
        },
        right: {
            bottom: isSmallScreen ? 3 : 20,
            right: isSmallScreen ? 3 : 20,
            transform: [{ rotate: '180deg' }]
        },
        red: {
            backgroundColor: theme.colors.red,
            borderColor: theme.colors.border,
            shadowColor: activePlayer === "red" ? theme.colors.shadowColor : "",
            shadowOffset: {
                width: 0,
                height: 0,
            },
            shadowOpacity: 0.7,
            shadowRadius: 50,
        },
        yellow: {
            backgroundColor: theme.colors.yellow,
            borderColor: theme.colors.border,
            shadowColor: activePlayer === "yellow" ? theme.colors.shadowColor : "",
            shadowOffset: {
                width: 0,
                height: 0,
            },
            shadowOpacity: 0.7,
            shadowRadius: 50,
        },
        blue: {
            backgroundColor: theme.colors.blue,
            borderColor: theme.colors.border,
            shadowColor: activePlayer === "blue" ? theme.colors.shadowColor : "",
            shadowOffset: {
                width: 0,
                height: 0,
            },
            shadowOpacity: 0.7,
            shadowRadius: 50,
        },
        green: {
            backgroundColor: theme.colors.green,
            borderColor: theme.colors.border,
            shadowColor: activePlayer === "green" ? theme.colors.shadowColor : "",
            shadowOffset: {
                width: 0,
                height: 0,
            },
            shadowOpacity: 0.7,
            shadowRadius: 50,
        },
        blue2: {
            shadowColor: activePlayer === "blue" ? theme.colors.shadowColor : "",
            shadowOffset: {
                width: 0,
                height: 0,
            },
            shadowOpacity:activePlayer === "blue" ? 0.7: "",
            shadowRadius:activePlayer === "blue" ? 50: "",
        },
        red0: {
            shadowColor: activePlayer === "red" ? theme.colors.shadowColor : "",
            shadowOffset: {
                width: 0,
                height: 0,
            },
            shadowOpacity:activePlayer === "red" ? 0.7: "",
            shadowRadius:activePlayer === "red" ? 50: "",
        },
        yellow1: {
            shadowColor: activePlayer === "yellow" ? theme.colors.shadowColor : "",
            shadowOffset: {
                width: 0,
                height: 0,
            },
            shadowOpacity:activePlayer === "yellow" ? 0.7: "",
            shadowRadius:activePlayer === "yellow" ? 50: "",
        },
        green3: {
            shadowColor: activePlayer === "green" ? theme.colors.shadowColor : "",
            shadowOffset: {
                width: 0,
                height: 0,
            },
            shadowOpacity:activePlayer === "green" ? 0.7: "",
            shadowRadius:activePlayer === "green" ? 50: "",
        },
    });

    const handleEnterNewSoldier = (color) => {
        if (activePlayer !== color) {
            Alert.alert(
                'Wrong Turn',
                `It's ${activePlayer}'s turn to play`
            );
            return;
        }

        const startingPositions = {
            red: "1b",
            yellow: "1c",
            blue: "1a",
            green: "1d"
        };

        dispatch(checkIfGotEnemy({ color, position: startingPositions[color] }));
        dispatch(enterNewSoldier({ color }));
    
    };

    const movePlayer = (color, steps) => {
        console.log(activePlayer)
        if (!currentPlayer || currentPlayer.isOut) return;
        if (showClone) return
        if (currentPlayer.color !== color) {
            Alert.alert(
                'Wrong Color',
                `It's ${activePlayer}'s turn to play`
            );
            return;
        }
        if (activePlayer !== currentPlayer.color) {
            Alert.alert(
                'Wrong Turn',
                `It's ${activePlayer}'s turn to play`
            );
            return;
        }

        dispatch(checkIfCardUsed({ color, steps }));

        const newPosition = calculateNewPosition(currentPlayer, steps);

        if (newPosition === "") {
            if (currentPlayer.color === "red" || currentPlayer.color === "green") {
                dispatch(setBoxesPosition({ ySteps: steps, newPosition: newPosition }))
            } else {
                dispatch(setBoxesPosition({ xSteps: steps, newPosition: newPosition }))
            }
        } else {
            getXStepsYSteps(currentPlayer.position, newPosition)
        }

    };

    const getXStepsYSteps = (sourcePos, targetPos) => {
        let xSteps = 0;
        let ySteps = 0;
        let xSteps2 = 0;
        let ySteps2 = 0;

        let maxRow = 0;
        let maxCol = 0;

        let maxRow1 = 0
        let maxRow2 = 0

        let maxCol1 = 0
        let maxCol2 = 0

        const row2 = getInVolvedSteps(boxes.row2, sourcePos, targetPos)
        const row1 = getInVolvedSteps(boxes.row1, sourcePos, targetPos)

        const column2 = getInVolvedSteps(boxes.column2, sourcePos, targetPos)
        const column1 = getInVolvedSteps(boxes.column1, sourcePos, targetPos)

        if (row1.length > 0 && row2.length > 0) {

            maxRow1 = Math.max(...row1.map(x => parseInt(x.match(/\d+/)[0])))
            maxRow2 = Math.max(...row2.map(x => parseInt(x.match(/\d+/)[0])))

            if (maxRow1 > maxRow2) {
                xSteps += row1.length > 0 ? row1.length : 0
                xSteps2 += row2.length > 0 ? row2.length : 0
                xSteps2--
            } else {
                xSteps += row2.length > 0 ? row2.length : 0
                xSteps2 += row1.length > 0 ? row1.length : 0
                xSteps2--
            }

        } else if (column1.length > 0 && column2.length > 0) {
            maxCol1 = Math.max(...column1.map(x => parseInt(x.match(/\d+/)[0])))
            maxCol2 = Math.max(...column2.map(x => parseInt(x.match(/\d+/)[0])))

            if (maxCol1 > maxCol2) {
                ySteps += column1.length > 0 ? column1.length : 0
                ySteps2 += column2.length > 0 ? column2.length : 0
                ySteps2--
            } else {
                ySteps += column2.length > 0 ? column2.length : 0
                ySteps2 += column1.length > 0 ? column1.length : 0
                ySteps2--
            }
        }
        else {
            xSteps += row1.length > 0 ? row1.length : 0
            xSteps += row2.length > 0 ? row2.length : 0

            ySteps += column2.length > 0 ? column2.length : 0
            ySteps += column1.length > 0 ? column1.length : 0

            maxRow = Math.max(
                row1.length > 0 ? Math.max(...row1.map(x => parseInt(x))) : 0,
                row2.length > 0 ? Math.max(...row2.map(x => parseInt(x))) : 0
            );

            maxCol = Math.max(
                column1.length > 0 ? Math.max(...column1.map(x => parseInt(x))) : 0,
                column2.length > 0 ? Math.max(...column2.map(x => parseInt(x))) : 0
            );
        }

        dispatch(setBoxesPosition({ xSteps, xSteps2, ySteps, maxRow, maxCol, newPosition: targetPos, maxRow1, maxRow2, maxCol1, maxCol2, ySteps2 }))

    }

    getInVolvedSteps = (band, sourcePos, targetPos) => {
        let categorieTar = targetPos.match(/[a-zA-Z]+/)[0];
        let categorieSou = sourcePos.match(/[a-zA-Z]+/)[0];

        let elements
        if (categorieTar === getNextCatergory(categorieSou)) {
            elements = band.filter(box => {
                let cateBox = box.match(/[a-zA-Z]+/)[0];
                if (cateBox === categorieTar) {
                    return parseInt(box) <= parseInt(targetPos)
                } else if (cateBox === categorieSou) {
                    return parseInt(box) <= Math.max(...band.map(x => parseInt(x.match(/\d+/)[0]))) && parseInt(box) >= parseInt(sourcePos)
                }
            }
            );
        } else {
            elements = band.filter(box => {
                let cateBox = box.match(/[a-zA-Z]+/)[0];
                if (cateBox === categorieSou || cateBox === categorieTar) {
                    return parseInt(box) <= parseInt(targetPos) && parseInt(box) > parseInt(sourcePos)
                }
            });
        }
        return elements
    }

    calculateNewPosition = (player, steps) => {
        if (!player.position || player.isOut) return;

        let numbers = parseInt(player.position.match(/\d+/)[0]);
        let categorie = player.position.match(/[a-zA-Z]+/)[0];


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
                if (position === '7d') {
                    return true;
                }
                break;
            case 'red':
                if (position === '7a') {
                    return true;
                }
                break;
            case 'yellow':
                if (position === '7b') {
                    return true;
                }
                break;
            case 'green':
                if (position === '7c') {
                    return true;
                }
                break;
            default:
                break;
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
                                            card.used && { backgroundColor: '#ddd', opacity: 0.7 },
                                            styles[color+i]
                                            
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
                                            card.used && { backgroundColor: '#ddd', opacity: 0.7 },
                                            styles[color+i]
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
                                            card.used && { backgroundColor: '#ddd', opacity: 0.7 },
                                            styles[color+i]
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
                                            card.used && { backgroundColor: '#ddd', opacity: 0.7 },
                                            styles[color+i]
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
                    <Pressable style={[styles.button,styles[color+i], { marginVertical: 5 }]} onPress={() => handleEnterNewSoldier(color)}>
                        {
                            color === "yellow" ?
                                <Feather name="arrow-right" size={24} color={theme.name === "dark" ? "white" : "black"} /> :
                                <MaterialIcons name={getCorrectArrow(color)} size={24} color={theme.name === "dark" ? "white" : "black"} />
                        }
                    </Pressable>
                </View>
            ))}
        </>
    );
}


