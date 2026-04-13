import {
    View,
    StyleSheet,
    Dimensions,
    Text
} from 'react-native';
import React, { useEffect } from 'react';
import Soldier from './Soldier';
import { boxes, isSafeZone } from "../assets/shared/hardCodedData.js"
import { useDispatch, useSelector } from 'react-redux';
import {
    setCurrentPlayer
} from '../assets/store/gameSlice.jsx';
import { useWebSocket } from '../assets/shared/webSocketConnection.jsx';
import { playSound, stopSound } from '../assets/shared/audioManager';

const canControlColor = (currentPlayerColor, selectedColor) => {
    if (currentPlayerColor === selectedColor) return true;
    if (Array.isArray(currentPlayerColor)) {
        return currentPlayerColor[0] === selectedColor || currentPlayerColor[1] === selectedColor;
    }
    return false;
};

const renderSoldiersForBox = ({ soldiers, keyPrefix, number, currentPlayer, onSelect }) => (
    soldiers.map((soldier) =>
        soldier.position === number && (
            <Soldier
                key={`${keyPrefix}-${soldier.id}`}
                isSelected={currentPlayer?.id === soldier.id}
                onPress={() => onSelect(soldier)}
                color={soldier.color}
            />
        )
    )
);

export default function SmalBoard() {

    const dispatch = useDispatch();
    const currentPlayer = useSelector(state => state.game.currentPlayer);
    const blueSoldiers = useSelector(state => state.game.blueSoldiers);
    const redSoldiers = useSelector(state => state.game.redSoldiers);
    const yellowSoldiers = useSelector(state => state.game.yellowSoldiers);
    const greenSoldiers = useSelector(state => state.game.greenSoldiers);
    const boxSize = useSelector(state => state.animation.boxSize);
    const theme = useSelector(state => state.theme.current);
    const currentMatch = useSelector(state => state.session.currentMatch);
    const currentPlayerColor = useSelector(state => state.game.currentPlayerColor);

    const { connected, subscribe, sendMessage } = useWebSocket();

    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height;
    const isSmallScreen = windowWidth < 375 || windowHeight < 667;

    const currentSelectedPlayer = (selectedPlayer) => {
        console.log(selectedPlayer);
        playSound('click').catch(() => {});
        if (!connected) {
            dispatch(setCurrentPlayer(selectedPlayer));
            return;
        }

        if (canControlColor(currentPlayerColor, selectedPlayer.color)) {
            handlePlayerMove(selectedPlayer);
        }
    };
    useEffect(() => {
        if (connected) {
            if(!currentMatch || !currentMatch.id) return;
            // Subscribe to receive board updates
            const subscription = subscribe(`/topic/currentPlayer/${currentMatch.id}`, (data) => {
                // Update your component state or dispatch Redux actions
                const nextPlayer = data?.payload ? data.payload : data;
                dispatch(setCurrentPlayer(nextPlayer));
                // Example: dispatch(updateBoard(data));
            });

            // Cleanup subscription when component unmounts
            return () => {
                if (subscription) {
                    subscription.unsubscribe();
                }
            };
        }

    }, [connected, subscribe]);

    const handlePlayerMove = (player) => {
        // Send player move through WebSocket
        sendMessage(`/app/player.getPlayer/${currentMatch.id}`, player);
    };

    const styles = StyleSheet.create({
        board: {
            position: "absolute",
            width: isSmallScreen ? "10%" : "80%",
            height: isSmallScreen ? "10%" : "80%",
            justifyContent: "center",
            alignItems: "center",
        },
        columnsContainer: {
            position: "fixed",
            flexDirection: "row",
            justifyContent: "space-between",
            width: 5,
            left: isSmallScreen ? "50%" : "50%",
            display: "flex",
            justifyContent: "center"
        },

        rowsContainer: {
            position: "fixed",
            flexDirection: "column",
            justifyContent: "space-between",
            height: 5,
            top: isSmallScreen ? "50%" : "50%",
            display: "flex",
            justifyContent: "center"
        },

        verticalColumn: {
            width: "auto",
            padding: isSmallScreen ? 1 : 3,
            marginHorizontal: isSmallScreen ? 1 : 5,
            flexDirection: "column",
        },

        horizontalRow: {
            width: "auto",
            padding: isSmallScreen ? 1 : 3,
            marginVertical: isSmallScreen ? 2 : 5,
            flexDirection: "row",
        },
        getNumber: number => ({
            visibility: number === "home1" || number === "hom2" || number === "home3" ? "hidden" : ""
        }),

        verbBox: {
            backgroundColor: "rgba(240, 244, 248, 0.5)",
            borderWidth: isSmallScreen ? 1 : 2,
            borderColor: theme.colors.border.transparent ? theme.colors.border.transparent : theme.colors.border,
            padding: isSmallScreen ? 9 : 20,
            margin: isSmallScreen ? 1 : 1,
            width: isSmallScreen ? 21 : boxSize,
            height: isSmallScreen ? 21 : boxSize,
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            borderRadius: isSmallScreen ? 5 : 10,
            zIndex: 1,
            elevation: 1,
        },
        verbText: {
            textAlign: 'center',
            fontSize: isSmallScreen ? 5 : 14,
        },
        safeZoneIcon: {
            position: 'absolute',
            zIndex: 0,
            width: '100%',
            height: '100%',
            textAlign: 'center',
            fontSize: isSmallScreen ? 15 : 30,
            opacity: 0.6,
        },
    });
    const renderBox = (number, i) => (
        <View
            key={`box-${i}-${number}`}
            style={[styles.verbBox, styles.getNumber(number),
            ]}
        >
    
            {isSafeZone(number) && (
                <Text style={styles.safeZoneIcon}>🛡️</Text>
            )}

            {renderSoldiersForBox({ soldiers: redSoldiers, keyPrefix: 'red', number, currentPlayer, onSelect: currentSelectedPlayer })}
            {renderSoldiersForBox({ soldiers: blueSoldiers, keyPrefix: 'blue', number, currentPlayer, onSelect: currentSelectedPlayer })}
            {renderSoldiersForBox({ soldiers: yellowSoldiers, keyPrefix: 'yellow', number, currentPlayer, onSelect: currentSelectedPlayer })}
            {renderSoldiersForBox({ soldiers: greenSoldiers, keyPrefix: 'green', number, currentPlayer, onSelect: currentSelectedPlayer })}
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

