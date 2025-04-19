import { View, Pressable, Text, StyleSheet } from "react-native";
import React from 'react';
import Player from './Player';
import { useDispatch, useSelector } from 'react-redux';
import {
    setCurrentPlayer,
    moveSoldier,
    enterNewSoldier,
    checkIfCardUsed
} from '../assets/store/gameSlice.jsx';
import { setBoxesPosition, setShowClone } from '../assets/store/animationSlice.jsx'

import { boxes, categories, directions, playerType } from "../assets/shared/hardCodedData.js";
import { MaterialIcons } from '@expo/vector-icons';
import Feather from '@expo/vector-icons/Feather';


export default function Bases() {

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
        
        if(color === "red"){
            checkIfGotEnemy(color, "1b")
        }else if(color === "yellow"){
            checkIfGotEnemy(color, "1c")
        }else if(color === "blue"){
            checkIfGotEnemy(color, "1a")
        }else if(color === "green"){
            checkIfGotEnemy(color, "1d")
        }
        dispatch(enterNewSoldier({ color }));
    };

    const movePlayer = (color, steps) => {
        if (!currentPlayer || currentPlayer.isOut) return;
        if (currentPlayer.color !== color) return;

        dispatch(checkIfCardUsed({ color, steps }));

        const newPosition = calculateNewPosition(currentPlayer, steps);

        console.log(newPosition)
        if(newPosition === ""){
            dispatch(setShowClone(false))
            if(currentPlayer.color === "red" || currentPlayer.color === "green"){
                dispatch(setBoxesPosition({ ySteps: steps, newPosition: newPosition}))
            }else{
                dispatch(setBoxesPosition({ xSteps: steps, newPosition: newPosition}))
            }
        }else{
            getXStepsYSteps(currentPlayer.position, newPosition)
        }
       
        checkIfGotEnemy(color, newPosition);
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

        if(row1.length > 0 && row2.length > 0){
            
            maxRow1 = Math.max(...row1.map(x => parseInt(x.match(/\d+/)[0])))
            maxRow2 = Math.max(...row2.map(x => parseInt(x.match(/\d+/)[0])))

            if(maxRow1 > maxRow2){
                xSteps += row1.length > 0 ? row1.length : 0
                xSteps2 += row2.length > 0 ? row2.length : 0
                xSteps2--
            }else{
                xSteps += row2.length > 0 ? row2.length : 0
                xSteps2 += row1.length > 0 ? row1.length : 0
                xSteps2--
            }
           
        }else if(column1.length > 0 && column2.length > 0){
            console.log(column1, column2)
            maxCol1 = Math.max(...column1.map(x => parseInt(x.match(/\d+/)[0])))
            maxCol2 = Math.max(...column2.map(x => parseInt(x.match(/\d+/)[0])))

            if(maxCol1 > maxCol2){
                ySteps += column1.length > 0 ? column1.length : 0
                ySteps2 += column2.length > 0 ? column2.length : 0
                ySteps2--
            }else{
                ySteps += column2.length > 0 ? column2.length : 0
                ySteps2 += column1.length > 0 ? column1.length : 0
                ySteps2--
            }
        }
        else{
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
       

        dispatch(setShowClone(false))
        dispatch(setBoxesPosition({ xSteps, xSteps2, ySteps,maxRow, maxCol, newPosition: targetPos, maxRow1, maxRow2, maxCol1, maxCol2, ySteps2}))

    }

    getInVolvedSteps = (band, sourcePos, targetPos) => {
        let categorieTar = targetPos.match(/[a-zA-Z]+/)[0];
        let categorieSou = sourcePos.match(/[a-zA-Z]+/)[0];

        let elements
        if(categorieTar === getNextCatergory(categorieSou)){
            elements = band.filter(box => {
                let cateBox = box.match(/[a-zA-Z]+/)[0];
                if (cateBox === categorieTar) {
                return parseInt(box) <= parseInt(targetPos)
            }else if(cateBox === categorieSou){
                return parseInt(box) <= Math.max(...band.map(x => parseInt(x.match(/\d+/)[0]))) && parseInt(box) >= parseInt(sourcePos)
            }
        }
            );
        }else{
            elements = band.filter(box => {
                let cateBox = box.match(/[a-zA-Z]+/)[0];
                if (cateBox === categorieSou || cateBox === categorieTar) {
                    return parseInt(box) <= parseInt(targetPos) && parseInt(box) > parseInt(sourcePos)
                }
            });
        }
        return elements
    }

    checkIfGotEnemy = (color, position) => {
        let checkIfGotEnemy = [];
        if (!position) return;
        switch (color) {
            case 'blue':
                const enemySoldiers = [...redSoldiers, ...yellowSoldiers, ...greenSoldiers];
                checkIfGotEnemy = enemySoldiers.filter(soldier => soldier.position === position);
                break;
            case 'red':
                const redEnemySoldiers = [...blueSoldiers, ...yellowSoldiers, ...greenSoldiers];
                checkIfGotEnemy = redEnemySoldiers.filter(soldier => soldier.position === position);
                break;
            case 'yellow':
                const yellowEnemySoldiers = [...redSoldiers, ...blueSoldiers, ...greenSoldiers];
                checkIfGotEnemy = yellowEnemySoldiers.filter(soldier => soldier.position === position);
                break;
            case 'green':
                const greenEnemySoldiers = [...redSoldiers, ...yellowSoldiers, ...blueSoldiers];
                checkIfGotEnemy = greenEnemySoldiers.filter(soldier => soldier.position === position);
                break;
        }
        if (checkIfGotEnemy.length >= 1) {
            dispatch(moveSoldier({
                color: checkIfGotEnemy[0].color,
                position: checkIfGotEnemy[0].initialPosition,
                soldierID: checkIfGotEnemy[0].id,
                steps: 0
                , returenToBase: true
            }));
        }

    }

    calculateNewPosition = (player, steps) => {
        if (!player.position || player.isOut) return;


        let numbers = parseInt(player.position.match(/\d+/)[0]);
        let categorie = player.position.match(/[a-zA-Z]+/)[0];


        if (steps === 1) {
            numbers = numbers === 12 ? 1 : numbers + 1;
            categorie = numbers === 1 ? getNextCatergory(categorie) : categorie;
            console.log(numbers + categorie)
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

    // const getInvolvedPositions = (sourcePos,targetPos) => {
    //     let categorieTar = targetPos.match(/[a-zA-Z]+/)[0];
    //     let categorieSou = sourcePos.match(/[a-zA-Z]+/)[0];

    //     elements = [...boxes.row1, ...boxes.row2,...boxes.column1,...boxes.column2].filter(box => {
    //         let cateBox = box.match(/[a-zA-Z]+/)[0];
    //         if (cateBox === categorieSou || cateBox === categorieTar) {
    //             return parseInt(box) <= parseInt(targetPos) && parseInt(box) > parseInt(sourcePos)
    //         }
    //     });

    //     console.log(elements)

    // }

    const CheckOutOfBoardCondition = (position) => {

        switch (currentPlayer.color) {
            case 'blue':
                if (position === '7d') {
                    setCurrentPlayer("")
                    return true;
                }
                break;
            case 'red':
                if (position === '7a') {
                    setCurrentPlayer("")
                    return true;
                }
                break;
            case 'yellow':
                if (position === '7b') {
                    setCurrentPlayer("")
                    return true;
                }
                break;
            case 'green':
                if (position === '7c') {
                    setCurrentPlayer("")
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
        paddingHorizontal: 15,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        gap: 8
    },
    buttonText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '1000',
    },

});


