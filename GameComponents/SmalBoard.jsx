import { View, Text, Pressable } from "react-native";
import React, { useState } from 'react';
import Player from './Player';
import { MaterialIcons } from '@expo/vector-icons';
import { boxes, categories, directions, playerType } from "../assets/shared/hardCodedData.js"
import { styles } from "../assets/shared/styles.jsx"

import { useDispatch, useSelector } from 'react-redux';
import {
    setCurrentPlayer,
    moveSoldier,
    enterNewSoldier
} from '../assets/store/gameSlice.jsx';
import Goals from "./Goals.jsx";


export default function SmalBoard() {

    const dispatch = useDispatch();
    const currentPlayer = useSelector(state => state.game.currentPlayer);
    const blueSoldiers = useSelector(state => state.game.blueSoldiers);
    const redSoldiers = useSelector(state => state.game.redSoldiers);

    console.log("Current Player: ", currentPlayer);
    console.log("Blue Soldiers: ", blueSoldiers);
    console.log("Red Soldiers: ", redSoldiers);

    const movePlayer = (steps) => {
        if (!currentPlayer || currentPlayer.isOut) return;


        const newPosition = calculateNewPosition(currentPlayer, steps);

        dispatch(moveSoldier({
            color: currentPlayer.color,
            position: newPosition,
            soldierID: currentPlayer.id
        }));
        dispatch(setCurrentPlayer({ ...currentPlayer, position: newPosition })); // Clear current player after moving

    };

    const handleEnterNewSoldier = (color) => {
        dispatch(enterNewSoldier({ color }));
    };

    const currentSelectedPlayer = (selectedPlayer) => {
        dispatch(setCurrentPlayer(selectedPlayer));
    };

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
                        isSelected={currentPlayer?.id === soldier.id}
                        onPress={() => currentSelectedPlayer(soldier)}
                        color={soldier.color}
                    />
                )
            )}
            {redSoldiers.map((soldier, index) =>
                soldier.position === number && (
                    <Player
                        key={`red-${soldier.id}`}
                        isSelected={currentPlayer?.id === soldier.id}
                        onPress={() => currentSelectedPlayer(soldier)}
                        color={soldier.color}
                    />
                )
            )}
        </View>
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
                    onPress={() => movePlayer(3)}
                >
                    <MaterialIcons name="casino" size={24} color="black" />
                    <Text style={styles.buttonText}>Roll</Text>
                </Pressable>
                <Pressable
                    style={styles.button}
                    onPress={() => handleEnterNewSoldier(currentPlayer?.color)}
                >
                    <MaterialIcons name="add" size={24} color="black" />
                    <Text style={styles.buttonText}>Enter</Text>
                </Pressable>
            </View>
        );
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
            <Goals />

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