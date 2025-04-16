import {
    View,
    Text,
    Pressable,
    StyleSheet
} from 'react-native';
import React from 'react';
import Player from './Player';
import { boxes } from "../assets/shared/hardCodedData.js"



import { useDispatch, useSelector } from 'react-redux';
import {
    setCurrentPlayer
} from '../assets/store/gameSlice.jsx';


import Goals from "./Goals.jsx";
import Bases from "./Bases.jsx";


export default function SmalBoard() {



    let elementPositions = []

    const dispatch = useDispatch();
    const currentPlayer = useSelector(state => state.game.currentPlayer);
    const blueSoldiers = useSelector(state => state.game.blueSoldiers);
    const redSoldiers = useSelector(state => state.game.redSoldiers);
    const yellowSoldiers = useSelector(state => state.game.yellowSoldiers);
    const greenSoldiers = useSelector(state => state.game.greenSoldiers);


    const currentSelectedPlayer = (selectedPlayer) => {
        console.log("sssssss")
        dispatch(setCurrentPlayer(selectedPlayer));
    };

    const saveElementsPositions = (x, y, number) => {
        elementPositions.push([y, x, number][1])

        if (elementPositions.length === 48) {
            console.log(elementPositions)
            // dispatch(setBoxesPosition(elementPositions))
        }
    }




    const renderBox = (number, i) => (
        <View
            key={`box-${i}-${number}`}
            style={[styles.verbBox, number === "home1" || number === "hom2" || number === "home3" ? { visibility: "hidden" } : {}, { position: 'relative' }]}

        >
            <Text>{number}</Text>
            {blueSoldiers.map((soldier) =>
                soldier.position === number && (
                    <Player
                        key={`blue-${soldier.id}`}
                        isSelected={currentPlayer?.id === soldier.id}
                        onPress={() => currentSelectedPlayer(soldier)}
                        color={soldier.color}
                    />
                )
            )}
            {redSoldiers.map((soldier) =>
                soldier.position === number && (
                    <Player
                        key={`red-${soldier.id}`}
                        isSelected={currentPlayer?.id === soldier.id}
                        onPress={() => currentSelectedPlayer(soldier)}
                        color={soldier.color}
                    />
                )
            )}
            {yellowSoldiers.map((soldier) =>
                soldier.position === number && (
                    <Player
                        key={`yellow-${soldier.id}`}
                        isSelected={currentPlayer?.id === soldier.id}
                        onPress={() => currentSelectedPlayer(soldier)}
                        color={soldier.color}
                    />
                )
            )}
            {greenSoldiers.map((soldier) =>
                soldier.position === number && (
                    <Player
                        key={`green-${soldier.id}`}
                        isSelected={currentPlayer?.id === soldier.id}
                        onPress={() => currentSelectedPlayer(soldier)}
                        color={soldier.color}
                    />
                )
            )}
        </View>
    );


    // const renderControls = () => {
    //     return (
    //         <View style={styles.controls}>
    //             <Pressable
    //                 style={styles.button}

    //             >
    //                 <MaterialIcons name="casino" size={24} color="black" />
    //                 <Text style={styles.buttonText}>Roll</Text>
    //             </Pressable>
    //         </View>
    //     );
    // };

    return (
        <View style={styles.board}>
            {/* Columns container */}
            <View style={styles.columnsContainer}>
                <View style={styles.verticalColumn}>
                    {boxes.column1.map((number, i) => renderBox(number, i))}
                </View>
                <View style={styles.verticalColumn}>
                    {boxes.column2.map((number, i) => renderBox(number, i))}
                </View>
            </View>

            {/* Rows container */}
            <View style={styles.rowsContainer}>
                <View style={styles.horizontalRow}>
                    {boxes.row1.map((number, i) => renderBox(number, i))}
                </View>
                <View style={styles.horizontalRow}>
                    {boxes.row2.map((number, i) => renderBox(number, i))}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({

    board: {
        position: "absolute",
        width: "80%",
        height: "80%",
        justifyContent: "center",
        alignItems: "center",
    },

    columnsContainer: {
        position: "fixed",
        flexDirection: "row",
        justifyContent: "space-between",
        width: 5, // Adjust based on your needs
        left: "45%",
        // bottom: "4%"
        display: "flex",
        justifyContent: "flex-start"
    },

    rowsContainer: {
        position: "fixed",
        flexDirection: "column",
        justifyContent: "space-between",
        height: 5, // Adjust based on your needs
        top: "50%",
        display: "flex",
        justifyContent: "center"
    },

    verticalColumn: {
        width: "auto",
        padding: 3,
        marginHorizontal: 5,
        flexDirection: "column",
    },

    horizontalRow: {
        width: "auto",
        padding: 3,
        marginVertical: 5,
        flexDirection: "row",
    },

    verbBox: {
        backgroundColor: "#f0f4f8",
        borderWidth: 2,
        borderColor: "rgb(81 81 116)",
        padding: 20,
        margin: 1,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        zIndex: 1,
    },
    verbText: {
        textAlign: 'center',
        fontSize: 14,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#e8ecf4',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#d1d9e6',
        gap: 8,
    },
    buttonText: {
        fontSize: 16,
        color: '#2a3f5f',
        fontWeight: '500',
    },
});