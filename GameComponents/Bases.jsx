import { View, Pressable, Text, StyleSheet, Dimensions } from "react-native";
import React, { useEffect, useRef, useCallback } from 'react';
import Soldier from './Soldier';
import { useDispatch, useSelector } from 'react-redux';
import {
    setActivePlayer,
    resetTimer,
    setPausedGame,
    setDisconnectedPlayer,
    applyServerStateSnapshot,
} from '../assets/store/gameSlice.jsx';
import { directions, playerType, uiStrings, getLocalizedColor } from "../assets/shared/hardCodedData.js";
import Toast from 'react-native-toast-message';
import { MaterialIcons } from '@expo/vector-icons';
import Feather from '@expo/vector-icons/Feather';
import { useWebSocket } from '../assets/shared/webSocketConnection.jsx';
import {
    canControlColor,
    getArrowNameByColor,
    canEnterPiece,
    handleEnterNewSoldierCore,
    movePlayerCore,
    sendMoveUpdateCore,
} from './Bases.logic';
import { playSound } from '../assets/shared/audioManager';


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
    const showClone = useSelector(state => state.animation.showClone);
    const systemLang = useSelector(state => state.language.systemLang);
    const user = useSelector(state => state.auth.user);
    const currentMatch = useSelector(state => state.session.currentMatch);
    const currentPlayerColor = useSelector(state => state.game.currentPlayerColor);
    const playerColors = useSelector(state => state.game.playerColors);


    const { connected, subscribe, sendMessage, sendMatchCommand, emitWithAck, requestFullSync, socketClient } = useWebSocket();

    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height;
    const isSmallScreen = windowWidth < 375 || windowHeight < 667;

    const movePendingRef = useRef(false);

    // ─── Styles ───────────────────────────────────────────────────────────
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
        left: { top: isSmallScreen ? 3 : 20, left: isSmallScreen ? 3 : 20 },
        top: { top: isSmallScreen ? 3 : 20, right: isSmallScreen ? 3 : 20, transform: [{ rotate: '180deg' }] },
        bottom: { bottom: isSmallScreen ? 3 : 20, left: isSmallScreen ? 3 : 20 },
        right: { bottom: isSmallScreen ? 3 : 20, right: isSmallScreen ? 3 : 20, transform: [{ rotate: '180deg' }] },
        red: { backgroundColor: theme.colors.red, borderColor: theme.colors.border, shadowColor: activePlayer === "red" ? theme.colors.shadowColor : "", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 50 },
        yellow: { backgroundColor: theme.colors.yellow, borderColor: theme.colors.border, shadowColor: activePlayer === "yellow" ? theme.colors.shadowColor : "", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 50 },
        blue: { backgroundColor: theme.colors.blue, borderColor: theme.colors.border, shadowColor: activePlayer === "blue" ? theme.colors.shadowColor : "", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 50 },
        green: { backgroundColor: theme.colors.green, borderColor: theme.colors.border, shadowColor: activePlayer === "green" ? theme.colors.shadowColor : "", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 50 },
        blue2: { shadowColor: activePlayer === "blue" ? theme.colors.shadowColor : "", shadowOffset: { width: 0, height: 0 }, shadowOpacity: activePlayer === "blue" ? 0.7 : "", shadowRadius: activePlayer === "blue" ? 50 : "" },
        red0: { shadowColor: activePlayer === "red" ? theme.colors.shadowColor : "", shadowOffset: { width: 0, height: 0 }, shadowOpacity: activePlayer === "red" ? 0.7 : "", shadowRadius: activePlayer === "red" ? 50 : "" },
        yellow1: { shadowColor: activePlayer === "yellow" ? theme.colors.shadowColor : "", shadowOffset: { width: 0, height: 0 }, shadowOpacity: activePlayer === "yellow" ? 0.7 : "", shadowRadius: activePlayer === "yellow" ? 50 : "" },
        green3: { shadowColor: activePlayer === "green" ? theme.colors.shadowColor : "", shadowOffset: { width: 0, height: 0 }, shadowOpacity: activePlayer === "green" ? 0.7 : "", shadowRadius: activePlayer === "green" ? 50 : "" },
    });

    const activePlayerRef = useRef(activePlayer);
    const currentPlayerRef = useRef(currentPlayer);
    const currentMatchRef = useRef(currentMatch);
    const currentPlayerColorRef = useRef(currentPlayerColor);
    useEffect(() => { activePlayerRef.current = activePlayer; }, [activePlayer]);
    useEffect(() => { currentPlayerRef.current = currentPlayer; }, [currentPlayer]);
    useEffect(() => { currentMatchRef.current = currentMatch; }, [currentMatch]);
    useEffect(() => { currentPlayerColorRef.current = currentPlayerColor; }, [currentPlayerColor]);

    useEffect(() => {
        if (!connected || !currentMatch?.id) return; // single combined guard
        const subscription = subscribe(`/topic/playerMove/${currentMatch.id}`, (data) => {
            if (data?.type === 'movePlayer') {
                const { color, steps } = data.payload || {};
                movePlayer(color, steps);
            } else if (data?.type === 'enterNewSoldier') {
                const { color } = data.payload || {};
                handleEnterNewSoldier(color);
            } else if (data?.type === 'skipTurn') {
                HandleskipTurn();
            } else if (data?.type === 'userDisconnected') {
                handleUserDisconnected(data);
            }

            // Sync stateVersion from server broadcast
            if (typeof data?.stateVersion === 'number') {
                dispatch(applyServerStateSnapshot({ stateVersion: data.stateVersion }));
            }
        });
        const gameStateSubscription = subscribe(`/topic/gameState/${currentMatch.id}`, (data) => {
            if (data) {
                dispatch(applyServerStateSnapshot(data));
            }
        });

        return () => {
            subscription?.unsubscribe();
            gameStateSubscription?.unsubscribe();
        };

    }, [connected, socketClient, currentMatch, user, currentPlayer]);



    const handleUserDisconnected = (data) => {
        if (data.userId) {
            const disconnectedColor = playerColors
                ? Object.entries(playerColors).find(([, id]) => String(id) === String(data.userId))?.[0]
                : 'blue';
            dispatch(setDisconnectedPlayer({ name: data.sender, color: disconnectedColor || 'blue' }));
            dispatch(setPausedGame(true));
        }
    };
    const handleEnterNewSoldier = (color) => {
        const result = handleEnterNewSoldierCore({ activePlayer, color, dispatch });
        if (result.error === 'wrongTurn') {
            const localizedActivePlayer = getLocalizedColor(activePlayer, systemLang);
            Toast.show({
                type: 'error',
                text1: uiStrings[systemLang].wrongTurn,
                text2: uiStrings[systemLang].wrongColor.replace('{color}', localizedActivePlayer),
                position: 'bottom',
                visibilityTime: 2000,
            });
            return;
        }
        playSound('move').catch(() => { });
    };

    const sendMoveUpdate = (message) => {
        sendMoveUpdateCore({ connected, message, sendMatchCommand, currentMatch, user, sendMessage });
    };

    const HandleskipTurn = () => {
        dispatch(setActivePlayer());
        dispatch(resetTimer());
    };

    const movePlayer = (color, steps) => {
        const activePlayer = activePlayerRef.current;
        const currentPlayer = currentPlayerRef.current;
        const result = movePlayerCore({ color, steps, currentPlayer, activePlayer, showClone, dispatch });
        if (result?.error) {
            const localizedActivePlayer = getLocalizedColor(activePlayer, systemLang);
            let text1, text2;
            if (result.error === 'wrongColor') {
                text1 = uiStrings[systemLang].wrongTurn.replace('{color}', localizedActivePlayer);
                text2 = result.error === 'wrongColor'
                    ? uiStrings[systemLang].wrongColor
                    : uiStrings[systemLang].wrongTurn.replace('{color}', localizedActivePlayer);

            } else {
                text1 = uiStrings[systemLang].selectPlayer.replace('{color}', localizedActivePlayer);
                text2 = uiStrings[systemLang].playerNotSelected;
            }
            Toast.show({
                type: 'error',
                text1,
                text2,
                position: 'bottom',
                visibilityTime: 2000,
            });
        }
    };

    // ─── Multiplayer move with acknowledgement ────────────────────────────
    const movePlayerHanlder = useCallback(async (color, steps) => {
        if (!connected) {
            movePlayer(color, steps);
            return;
        }

        if (activePlayerRef.current !== color) return;


        if (!canControlColor(currentPlayerColorRef.current, color, activePlayerRef.current)) return;

        // ✅ Prevent double-tap / double submit
        if (movePendingRef.current) {
            console.warn('Move already pending, ignoring duplicate');
            return;
        }

        movePendingRef.current = true;

        try {
            const response = await sendMatchCommand({
                type: 'movePlayer',
                payload: {
                    color: currentPlayerRef.current?.color,
                    steps,
                },
                matchId: currentMatchRef.current?.id,
                playerId: user?.id,
            });

            if (response?.status === 'ok') {
                // ✅ Server confirmed — do NOT dispatch here
                // State arrives via /topic/playerMove subscription above
            } else if (response?.status === 'error') {
                console.warn('Move rejected:', response.reason);

                if (response.reason === 'stale_state') {
                    console.warn(`Stale state: client behind server v${response.serverVersion}`);
                    Toast.show({
                        type: 'info',
                        text1: 'Syncing...',
                        text2: 'Your game state was outdated, resyncing',
                        position: 'bottom',
                        visibilityTime: 2000,
                    });
                    requestFullSync(currentMatchRef.current?.id);
                } else if (response.reason === 'not_your_turn') {
                    Toast.show({
                        type: 'error',
                        text1: 'Sync Error',
                        text2: 'Resyncing game state...',
                        position: 'bottom',
                        visibilityTime: 2000,
                    });
                    requestFullSync(currentMatchRef.current?.id);
                }
            }

        } catch (err) {
            // Timeout — server never responded in 5s
            console.error('Move timed out:', err.message);
            Toast.show({
                type: 'error',
                text1: 'Connection Issue',
                text2: 'Move timed out. Resyncing...',
                position: 'bottom',
                visibilityTime: 3000,
            });
            requestFullSync(currentMatchRef.current?.id);

        } finally {
            // ✅ Always release the lock
            movePendingRef.current = false;
        }
    }, [connected, user?.id, sendMatchCommand, requestFullSync]);

    // ─── Multiplayer enter soldier with acknowledgement ───────────────────
    const enterNewSoldierHandler = useCallback(async (color) => {

        // Offline mode — apply locally
        if (!connected) {
            handleEnterNewSoldier(color);
            return;
        }

        if (!canEnterPiece(activePlayerRef.current, color, currentPlayerColorRef.current)) return;

        if (movePendingRef.current) {
            console.warn('Move already pending, ignoring duplicate');
            return;
        }

        movePendingRef.current = true;

        try {
            const response = await sendMatchCommand({
                type: 'enterNewSoldier',
                payload: { color },
                matchId: currentMatchRef.current?.id,
                playerId: user?.id,
            });

            if (response?.status === 'ok') {
            } else if (response?.status === 'error') {
                console.warn('Enter soldier rejected:', response.reason);

                if (response.reason === 'stale_state') {
                    console.warn(`Stale state: client behind server v${response.serverVersion}`);
                    Toast.show({
                        type: 'info',
                        text1: 'Syncing...',
                        text2: 'Your game state was outdated, resyncing',
                        position: 'bottom',
                        visibilityTime: 2000,
                    });
                    requestFullSync(currentMatchRef.current?.id);
                } else if (response.reason === 'not_your_turn') {
                    requestFullSync(currentMatchRef.current?.id);
                }
            }

        } catch (err) {
            console.error('Enter soldier timed out:', err.message);
            Toast.show({
                type: 'error',
                text1: 'Connection Issue',
                text2: 'Action timed out. Resyncing...',
                position: 'bottom',
                visibilityTime: 3000,
            });
            requestFullSync(currentMatchRef.current?.id);

        } finally {
            movePendingRef.current = false;
        }
    }, [connected, user?.id, emitWithAck, requestFullSync]);

    const cardsByColor = {
        blue: blueCards,
        red: redCards,
        yellow: yellowCards,
        green: greenCards,
    };

    const getCardTextStyle = (color, cardUsed) => ([
        styles.buttonText,
        cardUsed && { color: '#999' },
        color === "yellow" && { transform: [{ rotate: '180deg' }] }
    ]);

    const getCardButtonStyle = (color, i, cardUsed) => ([
        styles.button,
        { marginVertical: 5 },
        cardUsed && { backgroundColor: '#ddd', opacity: 0.7 },
        styles[color + i],
        color === "green" && { transform: [{ rotate: '180deg' }] },
    ]);

    const renderInCirclePlayers = (j, playerType, i) => (
        <>
            {[
                ...blueSoldiers.map(soldier => ({ player: soldier })),
                ...redSoldiers.map(soldier => ({ player: soldier })),
                ...yellowSoldiers.map(soldier => ({ player: soldier })),
                ...greenSoldiers.map(soldier => ({ player: soldier }))
            ].map((item, index) => (
                item.player.position === `${j + 1}${playerType[i]}` && (
                    <Soldier
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
                            {(cardsByColor[color] || []).map((card) => (
                                <Pressable
                                    key={card.id}
                                    testID={`move-card-${color}-${card.value}`}
                                    disabled={card.used}
                                    style={getCardButtonStyle(color, i, card.used)}
                                    onPress={() => movePlayerHanlder(color, card.value)}
                                >
                                    <Text style={getCardTextStyle(color, card.used)}>{card.value}</Text>
                                </Pressable>
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
                    <Pressable
                        testID={`enter-soldier-${color}`}
                        style={[styles.button, styles[color + i], { marginVertical: 5 }]}
                        onPress={() => enterNewSoldierHandler(color)}
                    >
                        {
                            color === "yellow" ?
                                <Feather name="arrow-right" size={24} color={theme.name === "modernDark" ? "white" : "black"} /> :
                                <MaterialIcons name={getArrowNameByColor(color)} size={24} color={theme.name === "modernDark" ? "white" : "black"} />
                        }
                    </Pressable>
                </View>
            ))}
        </>
    );
}


