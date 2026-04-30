import {
    View,
    StyleSheet,
    Dimensions,
    Text,
    Image,
    Pressable
} from 'react-native';
import React, { useCallback, useEffect, useMemo } from 'react';
import Soldier from './Soldier';
import PawnGraphic from './PawnGraphic';
import { boxes, isSafeZone, isArrow, isHomeGate, getArrowDirection, getLocalizedColor, uiStrings } from "../assets/shared/hardCodedData.js"
import { useDispatch, useSelector } from 'react-redux';
import {
    setCurrentPlayer
} from '../assets/store/gameSlice.jsx';
import { useWebSocket } from '../assets/shared/webSocketConnection.jsx';
import { playSound } from '../assets/shared/audioManager';
import Toast from 'react-native-toast-message';
import { markTutorialAction, setTutorialAnchor } from '../assets/store/tutorialSlice.jsx';
import { getSoldiersForBox, getStackedSoldierSlots, getVisibleSoldiersForBox, getColorCountsForSoldiers, getVisibleColorChips, getOrderedSoldiersForStack, getStackSelectorSoldier, getNextStackSelectorSoldier } from './SmalBoard.helpers';
import { getIsSmallScreen } from '../assets/shared/screen.js';

const arrowGifSource = {
    uri: 'https://media1.tenor.com/m/ST02u_i1Z2oAAAAd/banner-gif-arrows.gif'
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

const canControlColor = (currentPlayerColor, selectedColor, systemLang, color) => {
    if (currentPlayerColor === selectedColor) {
        return true;
    } else {
        const localizedActivePlayer = getLocalizedColor(color, systemLang);
        showErrorToast(
            uiStrings[systemLang].selectPlayer.replace('{color}', localizedActivePlayer),
            uiStrings[systemLang].playerNotSelected
        );
    }
    if (Array.isArray(currentPlayerColor)) {
        return currentPlayerColor[0] === selectedColor || currentPlayerColor[1] === selectedColor;
    }
    return false;
};

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
    const systemLang = useSelector(state => state.language.systemLang);
    const activePlayer = useSelector(state => state.game.activePlayer);
    const tutorial = useSelector(state => state.tutorial || {});

    const { connected, subscribe, sendMessage } = useWebSocket();

    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height;
    const isSmallScreen = getIsSmallScreen({ width: windowWidth, height: windowHeight });

    const tutorialTargetSoldierId = useMemo(() => {
        const blueSoldierOnStartCell = blueSoldiers.find((soldier) => soldier.position === '1a');
        if (blueSoldierOnStartCell) {
            return blueSoldierOnStartCell.id;
        }

        return blueSoldiers[0]?.id || null;
    }, [blueSoldiers]);

    const handleTutorialTargetLayout = useCallback((anchor) => {
        dispatch(setTutorialAnchor({ step: 0, anchor }));
    }, [dispatch]);

    const currentSelectedPlayer = (selectedPlayer) => {
        playSound('click').catch(() => { });
        if (!connected) {
            if (canControlColor(currentPlayerColor, selectedPlayer.color, systemLang, activePlayer)) {
                dispatch(setCurrentPlayer(selectedPlayer));
                if (selectedPlayer.id === tutorialTargetSoldierId) {
                    dispatch(markTutorialAction({ type: 'soldier_selected' }));
                }
            }
            return;
        }

        if (canControlColor(currentPlayerColor, selectedPlayer.color, systemLang, activePlayer)) {
            handlePlayerMove(selectedPlayer);
            if (selectedPlayer.id === tutorialTargetSoldierId) {
                dispatch(markTutorialAction({ type: 'soldier_selected' }));
            }
        }
    };
    useEffect(() => {
        if (connected) {
            if (!currentMatch?.id) return;
            const subscription = subscribe(`/topic/currentPlayer/${currentMatch.id}`, (data) => {
                const nextPlayer = data?.payload ? data.payload : data;
                dispatch(setCurrentPlayer(nextPlayer));
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
            width: 5,
            left: "50%",
            display: "flex",
            justifyContent: "center"
        },

        rowsContainer: {
            position: "fixed",
            flexDirection: "column",
            height: 5,
            top: "50%",
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
            marginVertical: isSmallScreen ? 1 : 2,
            flexDirection: "row",
        },
        getNumber: number => {
            const isGateCell = isHomeGate(number);
            let backgroundColor = "";
            let borderRight = "";
            let borderLeft = "";
            let borderBottom = "";
            let borderTop = "";
            let width = 20
            if (number === "homeGreen") {
                backgroundColor = theme.colors.green;
                borderTop = "none";
            } else if (number === "homeRed") {
                backgroundColor = theme.colors.red;
                borderBottom = "none";
            } else if (number === "homeYellow") {
                backgroundColor = theme.colors.yellow;
                borderLeft = "none";
            } else if (number === "homeBlue") {
                backgroundColor = theme.colors.blue;
                borderRight = "none";
            }
            return {
                visibility: number === "home1" || number === "hom2" || number === "home3" ? "hidden" : "",
                backgroundColor: backgroundColor,
                width: isGateCell ? width : undefined,
                height: isGateCell ? 20 : undefined,
                // marginTop: isGateCell ? 3 : undefined,
                borderRight: isGateCell ? borderRight : undefined,
                borderLeft: isGateCell ? borderLeft : undefined,
                borderBottom: isGateCell ? borderBottom : undefined,
                borderTop: isGateCell ? borderTop : undefined,
                margin: isGateCell ? 1 : 0,
            };
        },

        verbBox: {
            backgroundColor: "rgba(240, 244, 248, 0.5)",
            borderWidth: isSmallScreen ? 1 : 2,
            borderColor: theme.colors.border.transparent ? theme.colors.border.transparent : theme.colors.border,
            padding: isSmallScreen ? 9 : 20,
            margin: 0,
            width: isSmallScreen ? 23 : boxSize,
            height: isSmallScreen ? 23 : boxSize,
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            borderRadius: isSmallScreen ? 4 : 8,
            zIndex: 1,
            elevation: 1,
        },
        soldierLayer: {
            ...StyleSheet.absoluteFill,
            zIndex: 2,
        },
        soldierSlot: {
            position: 'absolute',
        },
        stackSelectorButton: {
            position: 'absolute',
            top: isSmallScreen ? -34 : -44,
            left: '50%',
            width: isSmallScreen ? 28 : 38,
            height: isSmallScreen ? 28 : 38,
            marginLeft: isSmallScreen ? -14 : -19,
            borderRadius: isSmallScreen ? 14 : 19,
            borderWidth: isSmallScreen ? 2 : 2.5,
            borderColor: theme.colors.selected,
            backgroundColor: "transparent",
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 5,
            elevation: isSmallScreen ? 5 : 0,
        },
        stackSelectorActive: {
            shadowColor: theme.colors.selected,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.7,
            shadowRadius: 8,
        },
        stackSelectorPawn: {
            width: isSmallScreen ? 20 : 30,
            height: isSmallScreen ? 20 : 30,
        },
        colorChipRow: {
            position: 'absolute',
            left: isSmallScreen ? -1 : 1,
            right: isSmallScreen ? -1 : 1,
            top: isSmallScreen ? -4 : -6,
            flexDirection: 'row',
            justifyContent: 'center',
            gap: isSmallScreen ? 2 : 4,
            zIndex: 4,
        },
        colorChip: {
            minWidth: isSmallScreen ? 10 : 15,
            height: isSmallScreen ? 10 : 15,
            paddingHorizontal: isSmallScreen ? 2 : 4,
            borderRadius: isSmallScreen ? 5 : 8,
            borderWidth: 1,
            borderColor: theme.colors.background,
            justifyContent: 'center',
            alignItems: 'center',
        },
        colorChipOverflow: {
            backgroundColor: theme.colors.text,
        },
        colorChipText: {
            color: theme.colors.background,
            fontSize: isSmallScreen ? 7 : 9,
            fontWeight: '700',
            lineHeight: isSmallScreen ? 8 : 10,
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
        arrowIcon: {
            position: 'absolute',
            zIndex: 0,
            width: '100%',
            height: '100%',
            textAlign: 'center',
            fontSize: isSmallScreen ? 15 : 30,
            opacity: 0.6,
        },
    });
    const renderBox = (number, i) => {
        const soldiersInBox = getSoldiersForBox({
            number,
            soldierGroups: [redSoldiers, blueSoldiers, yellowSoldiers, greenSoldiers],
        });
        const orderedSoldiers = getOrderedSoldiersForStack(soldiersInBox);
        const visibleSoldiers = getVisibleSoldiersForBox({
            soldiers: orderedSoldiers,
            selectedSoldierId: currentPlayer?.id,
        });
        const stackSlots = getStackedSoldierSlots(visibleSoldiers.length, isSmallScreen);
        const colorCounts = getColorCountsForSoldiers(soldiersInBox);
        const visibleColorChips = getVisibleColorChips(colorCounts);
        const selectorSoldier = getStackSelectorSoldier({
            soldiers: soldiersInBox,
            selectedSoldierId: currentPlayer?.id,
        });
        const nextSelectorSoldier = getNextStackSelectorSoldier({
            soldiers: soldiersInBox,
            selectedSoldierId: currentPlayer?.id,
        });
        const isSelectorActive = Boolean(selectorSoldier && currentPlayer?.id === selectorSoldier.id);

        return (
            <View
                key={`box-${i}-${number}`}
                style={[styles.verbBox, styles.getNumber(number),
                ]}
            >

                {isSafeZone(number) && (
                    <Text style={styles.safeZoneIcon}>🛡️</Text>
                )}

                {isHomeGate(number) && (
                    <Text style={styles.gateIcon}></Text>
                )}

                {isArrow(number) && (() => {
                    // Map emoji to rotation degrees
                    const direction = getArrowDirection(number);
                    let rotateDeg = '0deg';
                    if (direction === '⬆️') rotateDeg = '-90deg';
                    else if (direction === '⬇️') rotateDeg = '90deg';
                    else if (direction === '⬅️') rotateDeg = '180deg';
                    return (
                        <Image
                            source={arrowGifSource}
                            style={[styles.arrowIcon, { transform: [{ rotate: rotateDeg }] }]}
                            resizeMode="contain"
                        />
                    );
                })()}

                <View pointerEvents="box-none" style={styles.soldierLayer}>
                    {soldiersInBox.length > 1 && selectorSoldier && nextSelectorSoldier && (
                        <Pressable
                            onPress={() => currentSelectedPlayer(nextSelectorSoldier)}
                            style={[
                                styles.stackSelectorButton,
                                isSelectorActive ? styles.stackSelectorActive : null,
                            ]}
                        >
                            <PawnGraphic
                                fillColor={theme.colors[selectorSoldier.color]}
                                style={styles.stackSelectorPawn}
                            />
                        </Pressable>
                    )}
                    {visibleColorChips.length > 0 && soldiersInBox.length > 1 && (
                        <View style={styles.colorChipRow} pointerEvents="none">
                            {visibleColorChips.map((chip) => (
                                <View
                                    key={`${number}-${chip.color}`}
                                    style={[
                                        styles.colorChip,
                                        chip.color === 'overflow'
                                            ? styles.colorChipOverflow
                                            : { backgroundColor: theme.colors[chip.color] },
                                    ]}
                                >
                                    <Text style={styles.colorChipText}>{chip.count}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                    {visibleSoldiers.map((soldier, index) => (
                        (() => {
                            const isSelectedForTips = Boolean(
                                tutorial?.active
                                && tutorial?.currentStep === 0
                                && tutorialTargetSoldierId
                                && soldier.id === tutorialTargetSoldierId
                            );

                            return (
                                <Soldier
                                    key={`${number}-${soldier.id}`}
                                    testID={`soldier-${soldier.id}`}
                                    containerStyle={[styles.soldierSlot, stackSlots[index]]}
                                    isSelected={currentPlayer?.id === soldier.id}
                                    isSelectedForTips={isSelectedForTips}
                                    onTipLayout={isSelectedForTips ? handleTutorialTargetLayout : undefined}
                                    onPress={() => currentSelectedPlayer(soldier)}
                                    color={soldier.color}
                                    sizeVariant={visibleSoldiers.length > 1 ? 'stacked' : 'default'}
                                />
                            );
                        })()
                    ))}
                </View>
            </View>
        );
    };

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

