import {
    View,
    StyleSheet,
    Text
} from 'react-native';
import React from 'react';
import Player from './Player';
import { boxes } from "../assets/shared/hardCodedData.js"
import { useDispatch, useSelector } from 'react-redux';
import {
    setCurrentPlayer
} from '../assets/store/gameSlice.jsx';

export default function SmalBoard() {

    const dispatch = useDispatch();
    const currentPlayer = useSelector(state => state.game.currentPlayer);
    const blueSoldiers = useSelector(state => state.game.blueSoldiers);
    const redSoldiers = useSelector(state => state.game.redSoldiers);
    const yellowSoldiers = useSelector(state => state.game.yellowSoldiers);
    const greenSoldiers = useSelector(state => state.game.greenSoldiers);
    const boxSize = useSelector(state => state.animation.boxSize);
    const theme = useSelector(state => state.theme.current);

    const currentSelectedPlayer = (selectedPlayer) => {
        dispatch(setCurrentPlayer(selectedPlayer));
    };

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
            left: "50%",
            display: "flex",
            justifyContent: "center"
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
            backgroundColor: "rgba(240, 244, 248, 0.5)",
            borderWidth: 2,
            borderColor: theme.colors.border.transparent ? theme.colors.border.transparent : theme.colors.border,
            padding: 20,
            margin: 1,
            width: 40,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            zIndex: 1,
            elevation: 1,
        },
        verbText: {
            textAlign: 'center',
            fontSize: 14,
        },
    
    });
    const renderBox = (number, i) => (
        <View
            key={`box-${i}-${number}`}
            style={[styles.verbBox, number === "home1" || number === "hom2" || number === "home3" ? { visibility: "hidden" } : {}, 
                { position: 'relative' , width: boxSize, height: boxSize}]}
        >
            <View>
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
        </View>
    );


    

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

