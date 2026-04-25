import { View, Pressable, Text, StyleSheet, Dimensions } from "react-native";
import React, { useEffect, useRef, useCallback, useState } from 'react';
import Soldier from './Soldier';
import { useDispatch, useSelector } from 'react-redux';
import {
    setActivePlayer,
    resetTimer,
    setPausedGame,
    setDisconnectedPlayer,
    applyServerStateSnapshot,
    updateSoldiersPosition,
    removeColorFromAvailableColors,
    setPlayerColors,
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
} from './Bases.logic';
import { playSound } from '../assets/shared/audioManager';
import { markTutorialAction, setTutorialAnchor } from '../assets/store/tutorialSlice.jsx';


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
    const disconnectedPlayer = useSelector(state => state.game.disconnectedPlayer);


    const { connected, subscribe, sendMatchCommand, emitWithAck, requestFullSync, socketClient } = useWebSocket();

    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height;
    const isSmallScreen = windowWidth < 375 || windowHeight < 667;

    const movePendingRef = useRef(false);
    const [isCardActionPending, setIsCardActionPending] = useState(false);
    const disconnectedPlayerRef = useRef(disconnectedPlayer);
    const blueCardSixRef = useRef(null);
    const blueCardThreeRef = useRef(null);
    const blueEnterSoldierRef = useRef(null);

    const getUserOwnedColors = useCallback((targetUserId) => {
        if (!playerColors || !targetUserId) return [];

        return Object.entries(playerColors)
            .filter(([, id]) => String(id) === String(targetUserId))
            .map(([color]) => color);
    }, [playerColors]);

    const handleRemotePause = useCallback((data, status = 'disconnected') => {
        if (!data?.userId || String(data.userId) === String(user?.id)) {
            return;
        }

        const ownedColors = getUserOwnedColors(data.userId);
        const primaryColor = ownedColors[0] || 'blue';

        dispatch(setDisconnectedPlayer({
            name: data.sender,
            color: primaryColor,
            colors: ownedColors,
            userId: data.userId,
            status,
        }));
        dispatch(setPausedGame(true));
    }, [dispatch, getUserOwnedColors, user?.id]);

    const handleUserBack = useCallback((data) => {
        if (!data?.userId || String(data.userId) === String(user?.id)) {
            return;
        }

        const pausedPlayer = disconnectedPlayerRef.current;
        if (!pausedPlayer || String(pausedPlayer.userId) !== String(data.userId)) {
            return;
        }

        dispatch(setDisconnectedPlayer(null));
        dispatch(setPausedGame(false));
    }, [dispatch, user?.id]);

    const reportBlueCardSixAnchor = useCallback(() => {
        if (!blueCardSixRef.current?.measureInWindow) {
            return;
        }

        blueCardSixRef.current.measureInWindow((x, y, width, height) => {
            if (![x, y, width, height].every(Number.isFinite)) {
                return;
            }

            dispatch(setTutorialAnchor({
                step: 1,
                anchor: { x, y, width, height },
            }));
        });
    }, [dispatch]);

    const reportBlueCardThreeAnchor = useCallback(() => {
        if (!blueCardThreeRef.current?.measureInWindow) {
            return;
        }

        blueCardThreeRef.current.measureInWindow((x, y, width, height) => {
            if (![x, y, width, height].every(Number.isFinite)) {
                return;
            }

            dispatch(setTutorialAnchor({
                step: 4,
                anchor: { x, y, width, height },
            }));
        });
    }, [dispatch]);

    const reportBlueEnterSoldierAnchor = useCallback(() => {
        if (!blueEnterSoldierRef.current?.measureInWindow) {
            return;
        }

        blueEnterSoldierRef.current.measureInWindow((x, y, width, height) => {
            if (![x, y, width, height].every(Number.isFinite)) {
                return;
            }

            dispatch(setTutorialAnchor({
                step: 3,
                anchor: { x, y, width, height },
            }));
        });
    }, [dispatch]);

    // ─── Styles ───────────────────────────────────────────────────────────
    const styles = StyleSheet.create({
        circleContainer: {
            position: "absolute",
            flexDirection: 'row',
            alignItems: 'center',
            gap: isSmallScreen ? 5 : 40,
        },
        corner: {
            width: isSmallScreen ? 64 : 132,
            height: isSmallScreen ? 64 : 132,
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
            width: isSmallScreen ? 20 : 38,
            height: isSmallScreen ? 20 : 38,
            borderRadius: isSmallScreen ? 16 : 17,
            backgroundColor: "white",
            margin: isSmallScreen ? 3 : 4,
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
    useEffect(() => { disconnectedPlayerRef.current = disconnectedPlayer; }, [disconnectedPlayer]);

    useEffect(() => {
        if (!connected || !currentMatch?.id) return; // single combined guard
        const subscription = subscribe(`/topic/playerMove/${currentMatch.id}`, (data) => {
            console.log(data)
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
                dispatch(applyServerStateSnapshot(data));
            }
        });
        const gameStartedSubscription = subscribe(`/topic/gameStarted/${currentMatch.id}`, (data) => {
            console.log("date GameStarted: " ,data)
            if (data?.type === 'userInactive') {
                handleRemotePause(data, 'inactive');
            } else if (data?.type === 'userBack') {
                handleUserBack(data);
            } else if (data?.type === 'userKicked') {
                const kickedColors = Array.isArray(data?.colors) ? data.colors : [];

                if (kickedColors.length > 0) {
                    const updatedPlayerColors = Object.fromEntries(
                        Object.entries(playerColors || {}).filter(([color]) => !kickedColors.includes(color))
                    );

                    kickedColors.forEach((color) => {
                        dispatch(updateSoldiersPosition({ color, position: '' }));
                        dispatch(removeColorFromAvailableColors({ color }));
                    });

                    dispatch(setPlayerColors(updatedPlayerColors));

                    if (kickedColors.includes(activePlayerRef.current)) {
                        dispatch(setActivePlayer());
                        dispatch(resetTimer());
                    }
                }

                const pausedPlayer = disconnectedPlayerRef.current;
                if (
                    data?.userId
                    && String(data.userId) !== String(user?.id)
                    && pausedPlayer?.status === 'inactive'
                    && String(pausedPlayer.userId) === String(data.userId)
                ) {
                    dispatch(setDisconnectedPlayer(null));
                    dispatch(setPausedGame(false));
                }
            }
        });
        const gameStateSubscription = subscribe(`/topic/gameState/${currentMatch.id}`, (data) => {
            if (data) {
                dispatch(applyServerStateSnapshot(data));
            }
        });

        return () => {
            subscription?.unsubscribe();
            gameStartedSubscription?.unsubscribe();
            gameStateSubscription?.unsubscribe();
        };

    }, [connected, socketClient, currentMatch, user, currentPlayer, handleRemotePause, handleUserBack, dispatch, playerColors]);

    useEffect(() => {
        const frame = requestAnimationFrame(() => reportBlueCardSixAnchor());
        return () => cancelAnimationFrame(frame);
    }, [reportBlueCardSixAnchor, windowWidth, windowHeight, blueCards]);

    useEffect(() => {
        const frame = requestAnimationFrame(() => reportBlueCardThreeAnchor());
        return () => cancelAnimationFrame(frame);
    }, [reportBlueCardThreeAnchor, windowWidth, windowHeight, blueCards]);

    useEffect(() => {
        const frame = requestAnimationFrame(() => reportBlueEnterSoldierAnchor());
        return () => cancelAnimationFrame(frame);
    }, [reportBlueEnterSoldierAnchor, windowWidth, windowHeight]);

    useEffect(() => {
        if (!showClone) {
            setIsCardActionPending(false);
        }
    }, [showClone]);



    const handleUserDisconnected = (data) => {
        handleRemotePause(data, 'disconnected');
    };
    const handleEnterNewSoldier = (color) => {
        const result = handleEnterNewSoldierCore({ activePlayer: activePlayerRef.current, color, dispatch });
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

    const HandleskipTurn = () => {
        dispatch(setActivePlayer());
        dispatch(resetTimer());
    };

    const movePlayer = (color, steps) => {
        const activePlayer = activePlayerRef.current;
        const currentPlayer = currentPlayerRef.current;
        const result = movePlayerCore({ color, steps, currentPlayer, activePlayer, dispatch });
        // if (result?.error) {
        //     const localizedActivePlayer = getLocalizedColor(activePlayer, systemLang);
        //     let text1, text2;
        //     if (result.error === 'wrongColor') {
        //         text1 = uiStrings[systemLang].wrongTurn.replace('{color}', localizedActivePlayer);
        //         text2 = result.error === 'wrongColor'
        //             ? uiStrings[systemLang].wrongColor
        //             : uiStrings[systemLang].wrongTurn.replace('{color}', localizedActivePlayer);

        //     } else {
        //         text1 = uiStrings[systemLang].selectPlayer.replace('{color}', localizedActivePlayer);
        //         text2 = uiStrings[systemLang].playerNotSelected;
        //     }
        //     Toast.show({
        //         type: 'error',
        //         text1,
        //         text2,
        //         position: 'bottom',
        //         visibilityTime: 2000,
        //     });
        // }
        return result;
    };

    // ─── Multiplayer move with acknowledgement ────────────────────────────
    const movePlayerHanlder = useCallback(async (color, steps) => {
        if (isCardActionPending) {
            return;
        }

        if (!connected) {
            setIsCardActionPending(true);

            if (Number(steps) === 6 || Number(steps) === 3) {
                dispatch(markTutorialAction({ type: 'card_played', value: steps, color }));
            }

            const result = movePlayer(color, steps);
            console.log("movePlayerHanlder offline result", { result })
            if (result?.error) {
                setIsCardActionPending(false);
            }
            return;
        }

        if (activePlayerRef.current !== color) return;

        console.log("movePlayerHanlder after checks", { color, steps, activePlayerRef: activePlayerRef.current, currentPlayerColorRef: currentPlayerColorRef.current })

        if (!canControlColor(currentPlayerColorRef.current, color, activePlayerRef.current)) return;

        if (Number(steps) === 6 || Number(steps) === 3) {
            dispatch(markTutorialAction({ type: 'card_played', value: steps, color }));
        }

        // ✅ Prevent double-tap / double submit
        if (movePendingRef.current) {
            console.warn('Move already pending, ignoring duplicate');
            return;
        }

        movePendingRef.current = true;
        setIsCardActionPending(true);

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
            setIsCardActionPending(false);
        }
    }, [connected, isCardActionPending, user?.id, sendMatchCommand, requestFullSync, dispatch]);

    // ─── Multiplayer enter soldier with acknowledgement ───────────────────
    const enterNewSoldierHandler = useCallback(async (color) => {

        // Offline mode — apply locally
        if (!connected) {
            dispatch(markTutorialAction({ type: 'enter_soldier', color }));
            handleEnterNewSoldier(color);
            return;
        }

        if (!canEnterPiece(activePlayerRef.current, color, currentPlayerColorRef.current)) return;

        dispatch(markTutorialAction({ type: 'enter_soldier', color }));

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
                return;
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
    }, [connected, user?.id, emitWithAck, requestFullSync, dispatch]);

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

    const getTutorialCardRef = (color, cardValue) => {
        if (color !== 'blue') return undefined;
        if (cardValue === 6) return blueCardSixRef;
        if (cardValue === 3) return blueCardThreeRef;
        return undefined;
    };

    const getTutorialCardLayoutHandler = (color, cardValue) => {
        if (color !== 'blue') return undefined;
        if (cardValue === 6) return reportBlueCardSixAnchor;
        if (cardValue === 3) return reportBlueCardThreeAnchor;
        return undefined;
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
                                    onLayout={getTutorialCardLayoutHandler(color, Number(card.value))}
                                    ref={getTutorialCardRef(color, Number(card.value))}
                                    disabled={card.used || isCardActionPending}
                                    style={getCardButtonStyle(color, i, card.used)}
                                    onPress={() => movePlayerHanlder(color, card.value)}
                                >
                                    <Text style={getCardTextStyle(color, card.used)}>{card.value}</Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                    <View style={[styles.corner, styles[color]]}>
                        {Array.from({ length: 4 }).map((_, j) => (
                            <View key={`${color}-${j + 1}`} style={styles.circle}>
                                {renderInCirclePlayers(j, playerType, i)}
                            </View>
                        ))}
                    </View>
                    <Pressable
                        testID={`enter-soldier-${color}`}
                        ref={color === 'blue' ? blueEnterSoldierRef : undefined}
                        onLayout={color === 'blue' ? reportBlueEnterSoldierAnchor : undefined}
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


