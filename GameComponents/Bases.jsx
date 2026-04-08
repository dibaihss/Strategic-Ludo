import { View, Pressable, Text, StyleSheet, Dimensions } from "react-native";
import React, { useEffect } from 'react';
import Player from './Player';
import { useDispatch, useSelector } from 'react-redux';
import {
    enterNewSoldier,
    checkIfCardUsed,
    setActivePlayer,
    resetTimer,
} from '../assets/store/gameSlice.jsx';
import { setBoxesPosition } from '../assets/store/animationSlice.jsx';
import Toast from 'react-native-toast-message';
import { boxes, categories, directions, playerType, uiStrings, getLocalizedColor } from "../assets/shared/hardCodedData.js";
import { MaterialIcons } from '@expo/vector-icons';
import Feather from '@expo/vector-icons/Feather';
import { useWebSocket } from '../assets/shared/webSocketConnection.jsx';

const getCategoryFromPosition = (position) => position.match(/[a-zA-Z]+/)[0];
const getNumberFromPosition = (position) => parseInt(position.match(/\d+/)[0], 10);

const canControlColor = (currentPlayerColor, color) => {
    if (currentPlayerColor === color) return true;
    if (Array.isArray(currentPlayerColor)) {
        return currentPlayerColor[0] === color || currentPlayerColor[1] === color;
    }
    return false;
};

const getNextCategory = (currentCategory) => {
    const currentIndex = categories.indexOf(currentCategory);
    const nextIndex = (currentIndex + 1) % categories.length;
    return categories[nextIndex];
};

const getInvolvedSteps = (band, sourcePos, targetPos) => {
    const targetCategory = getCategoryFromPosition(targetPos);
    const sourceCategory = getCategoryFromPosition(sourcePos);

    if (targetCategory === getNextCategory(sourceCategory)) {
        const maxBandNumber = Math.max(...band.map(item => getNumberFromPosition(item)));
        return band.filter((box) => {
            const boxCategory = getCategoryFromPosition(box);
            if (boxCategory === targetCategory) {
                return getNumberFromPosition(box) <= getNumberFromPosition(targetPos);
            }
            if (boxCategory === sourceCategory) {
                return getNumberFromPosition(box) <= maxBandNumber && getNumberFromPosition(box) >= getNumberFromPosition(sourcePos);
            }
            return false;
        });
    }

    return band.filter((box) => {
        const boxCategory = getCategoryFromPosition(box);
        if (boxCategory !== sourceCategory && boxCategory !== targetCategory) return false;
        return getNumberFromPosition(box) <= getNumberFromPosition(targetPos) && getNumberFromPosition(box) > getNumberFromPosition(sourcePos);
    });
};

const getMaxPositionNumber = (positions) => {
    if (!positions.length) return 0;
    return Math.max(...positions.map(item => getNumberFromPosition(item)));
};

const createStepMetrics = (sourcePos, targetPos) => {
    const row2 = getInvolvedSteps(boxes.row2, sourcePos, targetPos);
    const row1 = getInvolvedSteps(boxes.row1, sourcePos, targetPos);
    const column2 = getInvolvedSteps(boxes.column2, sourcePos, targetPos);
    const column1 = getInvolvedSteps(boxes.column1, sourcePos, targetPos);

    const metrics = {
        xSteps: 0,
        xSteps2: 0,
        ySteps: 0,
        ySteps2: 0,
        maxRow: 0,
        maxCol: 0,
        maxRow1: 0,
        maxRow2: 0,
        maxCol1: 0,
        maxCol2: 0,
    };

    if (row1.length > 0 && row2.length > 0) {
        metrics.maxRow1 = getMaxPositionNumber(row1);
        metrics.maxRow2 = getMaxPositionNumber(row2);
        const isFirstPathLarger = metrics.maxRow1 > metrics.maxRow2;
        const primary = isFirstPathLarger ? row1.length : row2.length;
        const secondary = isFirstPathLarger ? row2.length : row1.length;
        metrics.xSteps = primary;
        metrics.xSteps2 = secondary - 1;
        return metrics;
    }

    if (column1.length > 0 && column2.length > 0) {
        metrics.maxCol1 = getMaxPositionNumber(column1);
        metrics.maxCol2 = getMaxPositionNumber(column2);
        const isFirstPathLarger = metrics.maxCol1 > metrics.maxCol2;
        const primary = isFirstPathLarger ? column1.length : column2.length;
        const secondary = isFirstPathLarger ? column2.length : column1.length;
        metrics.ySteps = primary;
        metrics.ySteps2 = secondary - 1;
        return metrics;
    }

    metrics.xSteps = row1.length + row2.length;
    metrics.ySteps = column2.length + column1.length;
    metrics.maxRow = Math.max(getMaxPositionNumber(row1), getMaxPositionNumber(row2));
    metrics.maxCol = Math.max(getMaxPositionNumber(column1), getMaxPositionNumber(column2));
    return metrics;
};

const showErrorToast = (text1, text2) => {
    Toast.show({
        type: 'error',
        text1,
        text2,
        position: 'bottom',
        visibilityTime: 2000,
    });
};

const isOutOfBoardPosition = (playerColor, position) => {
    const outPositions = {
        blue: '7d',
        red: '7a',
        yellow: '7b',
        green: '7c',
    };
    return outPositions[playerColor] === position;
};

const calculateNewPositionForPlayer = (player, steps) => {
    if (!player.position || player.isOut) return undefined;

    let numbers = parseInt(player.position.match(/\d+/)[0], 10);
    let category = player.position.match(/[a-zA-Z]+/)[0];

    for (let i = 0; i < steps; i++) {
        numbers = numbers === 12 ? 1 : numbers + 1;
        category = numbers === 1 ? getNextCategory(category) : category;
        if (isOutOfBoardPosition(player.color, numbers + category)) {
            return "";
        }
    }

    return numbers + category;
};

const getArrowNameByColor = (color) => {
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

const sendMoveUpdateCore = ({ connected, message, sendMatchCommand, currentMatch, user, sendMessage }) => {
    if (!connected) return;

    if (message?.type) {
        sendMatchCommand({
            type: message.type,
            payload: message.payload || {},
            matchId: currentMatch?.id,
            playerId: user?.id,
        });
        return;
    }

    sendMessage(`/app/player.Move/${currentMatch.id}`, message);
};

const handleEnterNewSoldierCore = ({ activePlayer, color, systemLang, dispatch }) => {
    if (activePlayer !== color) {
        const localizedActivePlayer = getLocalizedColor(activePlayer, systemLang);
        showErrorToast(
            uiStrings[systemLang].wrongTurn,
            uiStrings[systemLang].wrongColor.replace('{color}', localizedActivePlayer)
        );
        return;
    }

    dispatch(enterNewSoldier(color));
};

const movePlayerCore = ({ color, steps, currentPlayer, activePlayer, systemLang, showClone, dispatch }) => {
    const localizedActivePlayer = getLocalizedColor(activePlayer, systemLang);

    if (!currentPlayer || currentPlayer.isOut) {
        showErrorToast(
            uiStrings[systemLang].selectPlayer.replace('{color}', localizedActivePlayer),
            uiStrings[systemLang].playerNotSelected
        );
        return;
    }
    if (showClone) return;

    if (currentPlayer.color !== color) {
        showErrorToast(
            uiStrings[systemLang].wrongColor,
            uiStrings[systemLang].wrongTurn.replaceAll('{color}', localizedActivePlayer)
        );
        return;
    }

    if (activePlayer !== currentPlayer.color) {
        showErrorToast(
            uiStrings[systemLang].wrongTurn.replace('{color}', localizedActivePlayer),
            uiStrings[systemLang].wrongTurn.replace('{color}', localizedActivePlayer)
        );
        return;
    }

    dispatch(checkIfCardUsed({ color, steps }));
    const newPosition = calculateNewPositionForPlayer(currentPlayer, steps);

    if (newPosition === "") {
        const outOfBoardPayload = currentPlayer.color === "red" || currentPlayer.color === "green"
            ? { ySteps: steps, newPosition: newPosition }
            : { xSteps: steps, newPosition: newPosition };
        dispatch(setBoxesPosition(outOfBoardPayload));
        return;
    }

    const metrics = createStepMetrics(currentPlayer.position, newPosition);
    dispatch(setBoxesPosition({ ...metrics, newPosition: newPosition }));
};

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
    });

    useEffect(() => {
        if (connected) {
        if(!currentMatch || !currentMatch.id) return;
            const subscription = subscribe(`/topic/playerMove/${currentMatch.id}`, (data) => {
                const parsedData = data;
                if (parsedData?.type === 'movePlayer') {
                    const { color, steps } = parsedData.payload || {};
                    movePlayer(color, steps);
                } else if (parsedData?.type === 'enterNewSoldier') {
                    const { color } = parsedData.payload || {};
                    handleEnterNewSoldier(color);
                } else if (parsedData?.type === 'skipTurn') {
                        HandleskipTurn()                 
                }
            });
            return () => {
                if (subscription) {
                    subscription.unsubscribe();
                }
            };
        }
    }, [connected, subscribe, currentMatch, user, currentPlayer]);

    const handleEnterNewSoldier = (color) => {
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
        movePlayerCore({ color, steps, currentPlayer, activePlayer, systemLang, showClone, dispatch });
    };

    // Mutliplayer Functions
    const movePlayerHanlder = (color, steps) => {
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
                            {(cardsByColor[color] || []).map((card) => (
                                <Pressable
                                    key={card.id}
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
                    <Pressable style={[styles.button, styles[color + i], { marginVertical: 5 }]} onPress={() => enterNewSoldierHandler(color)}>
                        {
                            color === "yellow" ?
                                <Feather name="arrow-right" size={24} color={theme.name === "dark" ? "white" : "black"} /> :
                                <MaterialIcons name={getArrowNameByColor(color)} size={24} color={theme.name === "dark" ? "white" : "black"} />
                        }
                    </Pressable>
                </View>
            ))}
        </>
    );
}


