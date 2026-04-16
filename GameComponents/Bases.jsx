import { View, Pressable, Text, StyleSheet, Dimensions } from "react-native";
import React, { useEffect } from 'react';
import Soldier from './Soldier';
import StatusBadge from '../assets/shared/StatusBadge.jsx';
import { useDispatch, useSelector } from 'react-redux';
import {
    setActivePlayer,
    resetTimer,
} from '../assets/store/gameSlice.jsx';
import { directions, playerType } from "../assets/shared/hardCodedData.js";
import { MaterialIcons } from '@expo/vector-icons';
import Feather from '@expo/vector-icons/Feather';
import { useWebSocket } from '../assets/shared/webSocketConnection.jsx';
import {
    canControlColor,
    getArrowNameByColor,
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
    const playerConnectionStatus = useSelector(state => state.game?.playerConnectionStatus || {});
    const users = useSelector(state => state.session.currentMatch?.users);


    const { connected, subscribe, sendMessage, sendMatchCommand } = useWebSocket();

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
            shadowOpacity: activePlayer === "blue" ? 0.7 : "",
            shadowRadius: activePlayer === "blue" ? 50 : "",
        },
        red0: {
            shadowColor: activePlayer === "red" ? theme.colors.shadowColor : "",
            shadowOffset: {
                width: 0,
                height: 0,
            },
            shadowOpacity: activePlayer === "red" ? 0.7 : "",
            shadowRadius: activePlayer === "red" ? 50 : "",
        },
        yellow1: {
            shadowColor: activePlayer === "yellow" ? theme.colors.shadowColor : "",
            shadowOffset: {
                width: 0,
                height: 0,
            },
            shadowOpacity: activePlayer === "yellow" ? 0.7 : "",
            shadowRadius: activePlayer === "yellow" ? 50 : "",
        },
        green3: {
            shadowColor: activePlayer === "green" ? theme.colors.shadowColor : "",
            shadowOffset: {
                width: 0,
                height: 0,
            },
            shadowOpacity: activePlayer === "green" ? 0.7 : "",
            shadowRadius: activePlayer === "green" ? 50 : "",
        },
        avatarContainer: {
            position: 'absolute',
            alignItems: 'center',
            zIndex: 10,
        },
        avatarContainerBlue: {
            top: isSmallScreen ? -35 : 32,
            left: isSmallScreen ? 5 : 124,
        },
        avatarContainerRed: {
            top: isSmallScreen ? -35 : 129,
            right: isSmallScreen ? 5 : 132,
        },
        avatarContainerYellow: {
            bottom: isSmallScreen ? -35 : 222,
            left: isSmallScreen ? 5 : 124,
        },
        avatarContainerGreen: {
            bottom: isSmallScreen ? -35 : 222,
            right: isSmallScreen ? 5 : 134,
        },
        avatarCircle: {
            width: isSmallScreen ? 32 : 40,
            height: isSmallScreen ? 32 : 40,
            borderRadius: isSmallScreen ? 16 : 20,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 2,
            borderColor: 'white',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 3,
            elevation: 4,
        },
        avatarText: {
            color: 'white',
            fontSize: isSmallScreen ? 14 : 16,
            fontWeight: 'bold',
        },
        statusBadgeWrapper: {
            position: 'absolute',
            bottom: -4,
            right: -4,
            backgroundColor: 'white',
            borderRadius: 8,
            padding: 1,
        },
    });

    const getPlayerInfo = (color) => {
        const userId = playerColors?.[color];
        if (!userId) return null;
        
        const user = users?.find(u => String(u.id) === String(userId));
        if (user?.isBot) {
            const difficulty = user.botDifficulty?.[0]?.toUpperCase() || 'B';
            return { initial: difficulty, name: 'Bot' };
        }
        const name = user?.name || user?.username || 'Player';
        return { initial: name.charAt(0).toUpperCase(), name };
    };

    useEffect(() => {
        if (!connected || !currentMatch?.id) return; // single combined guard
        const subscription = subscribe(`/topic/playerMove/${currentMatch.id}`, (data) => {
            console.log("Received move update:", data);
            if (data?.type === 'movePlayer') {
                const { color, steps } = data.payload || {};
                movePlayer(color, steps);
            } else if (data?.type === 'enterNewSoldier') {
                const { color } = data.payload || {};
                handleEnterNewSoldier(color);
            } else if (data?.type === 'skipTurn') {
                HandleskipTurn();
            }
        });

        return () => {
            subscription?.unsubscribe();
        };

    }, [connected, subscribe, currentMatch, user, currentPlayer]);

    const handleEnterNewSoldier = (color) => {
        playSound('move').catch(() => { });
        handleEnterNewSoldierCore({ activePlayer, color, systemLang, dispatch });
    };

    const sendMoveUpdate = (message) => {
        sendMoveUpdateCore({ connected, message, sendMatchCommand, currentMatch, user, sendMessage });
    };

    const HandleskipTurn = () => {
        dispatch(setActivePlayer());
        dispatch(resetTimer());
    };

    const movePlayer = (color, steps) => {
        console.log('canControlColor', canControlColor(currentPlayerColor, color));
        movePlayerCore({ color, steps, currentPlayer, activePlayer, systemLang, showClone, dispatch });
    };

    // Mutliplayer Functions
    const movePlayerHanlder = (color, steps) => {
        if (activePlayer !== color) return;
        if (!connected) {
            movePlayer(color, steps);
            return;
        }

        if (!canControlColor(currentPlayerColor, color)) return;
        sendMoveUpdate({
            type: 'movePlayer',
            payload: {
                color: currentPlayer.color,
                steps
            },
        });
    };

    const enterNewSoldierHandler = (color) => {
        if (!connected) {
            handleEnterNewSoldier(color);
            return;
        }

        if (!canControlColor(currentPlayerColor, color)) return;
        sendMoveUpdate({
            type: 'enterNewSoldier',
            payload: {
                color: color,
            },
        });
    };

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

    const renderPlayerAvatar = (color) => {
        const playerInfo = getPlayerInfo(color);
        if (!playerInfo) return null;
        
        const userId = playerColors?.[color];
        const status = userId ? (playerConnectionStatus[String(userId)] || 'connected') : 'connected';
        
        const avatarContainerStyle = {
            blue: styles.avatarContainerBlue,
            red: styles.avatarContainerRed,
            yellow: styles.avatarContainerYellow,
            green: styles.avatarContainerGreen,
        }[color];
        
        return (
            <View style={[styles.avatarContainer, avatarContainerStyle]}>
                <View style={[styles.avatarCircle, { backgroundColor: theme.colors[color] }]}>
                    <Text style={styles.avatarText}>{playerInfo.initial}</Text>
                </View>
                <View style={styles.statusBadgeWrapper}>
                    <StatusBadge status={status} size="sm" showPulse={false} />
                </View>
            </View>
        );
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
                    {renderPlayerAvatar(color)}
                </View>
            ))}
        </>
    );
}


