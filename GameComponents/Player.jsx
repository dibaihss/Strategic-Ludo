import React, { useRef } from 'react';
import {
    StyleSheet,
    Pressable,
    Animated,
    Platform,
    Dimensions
} from 'react-native';
import {
    setCurrentPlayer,
    moveSoldier,
    checkIfGotEnemy,
    setActivePlayer,
    resetTimer
} from '../assets/store/gameSlice.jsx';
import { setShowClone } from '../assets/store/animationSlice.jsx'

import { useDispatch, useSelector } from 'react-redux';

export default function Player({ color, isSelected, onPress }) {
    const animatedValue = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

    let iterations = 0;
    let movingValues = []


    const currentPlayer = useSelector(state => state.game.currentPlayer);

    const boxesPosition = useSelector(state => state.animation.boxesPosition)
    const showClone = useSelector(state => state.animation.showClone)
    const boxSize = useSelector(state => state.animation.boxSize)
    const theme = useSelector(state => state.theme.current);

    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height;
    const isSmallScreen = windowWidth < 375 || windowHeight < 667;

    const dispatch = useDispatch();
    
    const styles = StyleSheet.create({
        clone: {
            width: isSmallScreen ? 20 : 30,
            height: isSmallScreen ? 20 : 30,
            zIndex: 999,
            elevation: isSmallScreen ? 999 : 0,
        }
    });

    React.useEffect(() => {
        if (!showClone) {
            if (currentPlayer && currentPlayer.color === color && isSelected === true && boxesPosition) {
                const { xSteps, ySteps, maxRow, maxCol, maxRow1, maxRow2, maxCol1, maxCol2, returenToBase } = boxesPosition

                if (returenToBase) {
                    animatedValue.setValue({ x: 0, y: 0 });
                    moveInXInY()
                } else {
                    animatedValue.setValue({ x: 0, y: 0 });

                    if (xSteps > 0 && ySteps > 0) {

                        if (maxRow < maxCol) {
                            moveInXY()
                        } else {
                            moveInYX()
                        }

                    } else if (maxRow2 > 0 && maxRow1 > 0) {
                        moveInXYX()
                    }
                    else if (maxCol2 > 0 && maxCol1 > 0) {
                        moveInYXY()
                    }
                    else {
                        xSteps > 0 ? moveInX() : 0
                        ySteps > 0 ? moveInY() : 0
                    }
                }
            }
        }
    }, [boxesPosition]);

    const moveInXY = () => {
        let { ySteps, xSteps } = boxesPosition

        let categorie = currentPlayer.position.match(/[a-zA-Z]+/)[0];
        if (categorie === "c" || categorie === "d") ySteps = -ySteps
        if (categorie === "b") xSteps = -xSteps


        movingValues.push({ x: boxSize * -xSteps, y: 0 })
        movingValues.push({ x: boxSize * -xSteps, y: boxSize * -ySteps })

        moveEleWithAnimation()

    }

    const moveInYX = () => {


        let { ySteps, xSteps } = boxesPosition
        let categorie = currentPlayer.position.match(/[a-zA-Z]+/)[0];
        if (categorie === "c" || categorie === "d") ySteps = -ySteps
        if (categorie === "c") xSteps = -xSteps

        movingValues.push({ x: 0, y: boxSize * -ySteps })
        movingValues.push({ x: boxSize * -xSteps, y: boxSize * -ySteps })


        moveEleWithAnimation()
    }

    const moveInX = () => {
        let { xSteps } = boxesPosition

        let categorie = currentPlayer.position.match(/[a-zA-Z]+/)[0];
        if (categorie === "c" || categorie === "b") xSteps = -xSteps

        movingValues.push({ x: boxSize * -xSteps, y: 0 })
        moveEleWithAnimation()
    }

    const moveInY = () => {
        let { ySteps } = boxesPosition

        let categorie = currentPlayer.position.match(/[a-zA-Z]+/)[0];
        if (categorie === "c" || categorie === "d") ySteps = -ySteps

        movingValues.push({ x: 0, y: boxSize * -ySteps })
        moveEleWithAnimation()
    }

    const moveInXYX = () => {
        let { xSteps, xSteps2 } = boxesPosition

        let rowOffset = boxSize + 5
        let categorie = currentPlayer.position.match(/[a-zA-Z]+/)[0];
        if (categorie === "c") rowOffset = -rowOffset

        if (xSteps === 1 && xSteps2 === 0) {
            movingValues.push({ x: 0, y: -rowOffset })
        } else {
            xSteps--
            if (categorie === "c") {
                xSteps = -xSteps
            }
            if (categorie === "a") {
                xSteps2 = -xSteps2
            }
            movingValues.push({ x: boxSize * -xSteps, y: 0 })
            movingValues.push({ x: boxSize * -xSteps, y: -rowOffset })
            let reachedPos = boxSize * -xSteps
            movingValues.push({ x: reachedPos + boxSize * -xSteps2, y: -rowOffset })
        }

        moveEleWithAnimation()

    }
    const moveInYXY = () => {
        let { ySteps, ySteps2 } = boxesPosition


        let colOffset = boxSize + 5
        let categorie = currentPlayer.position.match(/[a-zA-Z]+/)[0];
        if (categorie === "b") colOffset = -colOffset

        if (ySteps === 1 && ySteps2 === 0) {
            movingValues.push({ x: -colOffset, y: 0 })

        } else {
            ySteps--
            if (categorie === "d") ySteps = -ySteps
            if (categorie === "b") {
                ySteps2 = -ySteps2
            }
            movingValues.push({ x: 0, y: boxSize * -ySteps })
            movingValues.push({ x: -colOffset, y: boxSize * -ySteps })
            let reachedPos = boxSize * -ySteps
            movingValues.push({ x: -colOffset, y: reachedPos + boxSize * -ySteps2 })

        }

        moveEleWithAnimation()

    }
    const moveInXInY = () => {
        let { ySteps, xSteps } = boxesPosition
        movingValues.push({ x: boxSize * -xSteps, y: boxSize * -ySteps })
        // console.log(movingValues)
        moveEleWithAnimation()
    }

    const moveEleWithAnimation = () => {
        dispatch(setShowClone(true))
        Animated.timing(animatedValue, {
            toValue: movingValues[iterations], // Animate both X and Y directions
            duration: 550,
            useNativeDriver: false,
        }).start(({ finished }) => {
            if (finished && iterations === movingValues.length - 1) {
                moveElement()
            }
            else if (finished) {
                iterations++
                moveEleWithAnimation()
            }
        });

    }

    const moveElement = () => {
        const { kickedPlayer, returenToBase, newPosition } = boxesPosition
        if (returenToBase) {
            dispatch(moveSoldier({
                color: kickedPlayer.color,
                position: kickedPlayer.initialPosition,
                soldierID: kickedPlayer.id,
                returenToBase: returenToBase ? returenToBase : false
            }));
        } else {
            dispatch(moveSoldier({
                color: currentPlayer.color,
                position: newPosition,
                soldierID: currentPlayer.id,
                steps: 0,
            }));

            dispatch(setCurrentPlayer(null));
            dispatch(checkIfGotEnemy({ color: currentPlayer.color, position: newPosition }));

            setTimeout(() => {
                dispatch(setActivePlayer());
                dispatch(resetTimer());
            }, 100)
        }


    };

    return (
        <Animated.View style={[styles.clone, showClone ? { zIndex: 999 * 2 } : {},
        {
            top: animatedValue.y,
            left: animatedValue.x,
        }]} >
            <Pressable
                onPress={() => onPress()}
                android_ripple={isSmallScreen ? { color: 'rgba(255,255,255,0.3)', borderless: true } : null}
                style={{
                    width: isSelected ? (isSmallScreen ? 10 : 30) : (isSmallScreen ? 3 : 25),
                    height: isSelected ? (isSmallScreen ? 10 : 30) : (isSmallScreen ? 3 : 25),
                    borderRadius: isSmallScreen ? 12 : 12.5,
                    backgroundColor: theme.colors[color],
                    borderWidth: isSelected ? (isSmallScreen ? 1 : 5) : (isSmallScreen ? 1 : 2),
                    borderColor: isSelected ? theme.colors.selected : '#ffffff',
                    padding: isSmallScreen ? 8 : 15,
                    elevation: isSmallScreen ? (isSelected ? 4 : 2) : 0,
                }}
            />
        </Animated.View>
    );
}

