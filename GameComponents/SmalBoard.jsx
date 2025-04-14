import {
    View,
    Text,
    Pressable
  } from 'react-native';
import React from 'react';
import Player from './Player';
import { boxes } from "../assets/shared/hardCodedData.js"
import { styles } from "../assets/shared/styles.jsx"
import { MaterialIcons } from '@expo/vector-icons';

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
        dispatch(setCurrentPlayer(selectedPlayer));
    };
 
        const saveElementsPositions = (x, y, number) =>{
          elementPositions.push([y, x, number][1])
       
        //   console.log(elementPositions)
        }

    const renderBox = (number, i) => (
        <View
            key={`box-${i}-${number}`}
            style={[styles.verbBox, { position: 'relative' }]}
            onLayout={(event) => {
                const { x, y } = event.nativeEvent.layout;
                saveElementsPositions({ x, y,number });
            }}
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


    const renderControls = () => {
        return (
            <View style={styles.controls}>
                <Pressable
                    style={styles.button}
                    onPress={() => {
                        // Example: Move current player to position "24"
                        
                            console.log("fdsfgfd")
                        
                    }}
                >
                    <MaterialIcons name="casino" size={24} color="black" />
                    <Text style={styles.buttonText}>Roll</Text>
                </Pressable>
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
            <Goals />
            <Bases />
        </View>
    );
}