import React, { useRef } from 'react';
import {
    StyleSheet,
    Pressable,
    Animated,
    Dimensions
} from 'react-native';
import {
    setCurrentPlayer,
    moveSoldier,
    checkIfGotEnemy,
    setActivePlayer,
    resetTimer
} from '../assets/store/gameSlice.jsx';
import { setShowClone } from '../assets/store/animationSlice.jsx';
import { useDispatch, useSelector } from 'react-redux';

const getCategory = (position) => position?.match(/[a-zA-Z]+/)?.[0];

const buildXYPath = (boxesPosition, currentPlayer, boxSize) => {
    let { ySteps, xSteps } = boxesPosition;
    const category = getCategory(currentPlayer?.position);
    if (category === "c" || category === "d") ySteps = -ySteps;
    if (category === "b") xSteps = -xSteps;
    return [
        { x: boxSize * -xSteps, y: 0 },
        { x: boxSize * -xSteps, y: boxSize * -ySteps }
    ];
};

const buildYXPath = (boxesPosition, currentPlayer, boxSize) => {
    let { ySteps, xSteps } = boxesPosition;
    const category = getCategory(currentPlayer?.position);
    if (category === "c" || category === "d") ySteps = -ySteps;
    if (category === "c") xSteps = -xSteps;
    return [
        { x: 0, y: boxSize * -ySteps },
        { x: boxSize * -xSteps, y: boxSize * -ySteps }
    ];
};

const buildXPath = (boxesPosition, currentPlayer, boxSize) => {
    let { xSteps } = boxesPosition;
    const category = getCategory(currentPlayer?.position);
    if (category === "c" || category === "b") xSteps = -xSteps;
    return [{ x: boxSize * -xSteps, y: 0 }];
};

const buildYPath = (boxesPosition, currentPlayer, boxSize) => {
    let { ySteps } = boxesPosition;
    const category = getCategory(currentPlayer?.position);
    if (category === "c" || category === "d") ySteps = -ySteps;
    return [{ x: 0, y: boxSize * -ySteps }];
};

const buildXYXPath = (boxesPosition, currentPlayer, boxSize) => {
    let { xSteps, xSteps2 } = boxesPosition;
    let rowOffset = boxSize + 5;
    const category = getCategory(currentPlayer?.position);
    if (category === "c") rowOffset = -rowOffset;

    if (xSteps === 1 && xSteps2 === 0) {
        return [{ x: 0, y: -rowOffset }];
    }

    xSteps--;
    if (category === "c") xSteps = -xSteps;
    if (category === "a") xSteps2 = -xSteps2;

    const reachedPos = boxSize * -xSteps;
    return [
        { x: boxSize * -xSteps, y: 0 },
        { x: boxSize * -xSteps, y: -rowOffset },
        { x: reachedPos + boxSize * -xSteps2, y: -rowOffset }
    ];
};

const buildYXYPath = (boxesPosition, currentPlayer, boxSize) => {
    let { ySteps, ySteps2 } = boxesPosition;
    let colOffset = boxSize + 5;
    const category = getCategory(currentPlayer?.position);
    if (category === "b") colOffset = -colOffset;

    if (ySteps === 1 && ySteps2 === 0) {
        return [{ x: -colOffset, y: 0 }];
    }

    ySteps--;
    if (category === "d") ySteps = -ySteps;
    if (category === "b") ySteps2 = -ySteps2;

    const reachedPos = boxSize * -ySteps;
    return [
        { x: 0, y: boxSize * -ySteps },
        { x: -colOffset, y: boxSize * -ySteps },
        { x: -colOffset, y: reachedPos + boxSize * -ySteps2 }
    ];
};

const buildReturnToBasePath = (boxesPosition, boxSize) => {
    const { ySteps, xSteps } = boxesPosition;
    return [{ x: boxSize * -xSteps, y: boxSize * -ySteps }];
};

const shouldAnimate = (showClone, currentPlayer, color, isSelected, boxesPosition) => {
    if (showClone) return false;
    if (!currentPlayer || currentPlayer.color !== color) return false;
    if (isSelected !== true) return false;
    return Boolean(boxesPosition);
};

const buildMovementSequence = (boxesPosition, currentPlayer, boxSize) => {
    if (!boxesPosition) return [];

    const {
        xSteps,
        ySteps,
        maxRow,
        maxCol,
        maxRow1,
        maxRow2,
        maxCol1,
        maxCol2,
        returenToBase
    } = boxesPosition;

    if (returenToBase) {
        return buildReturnToBasePath(boxesPosition, boxSize);
    }

    if (xSteps > 0 && ySteps > 0) {
        return maxRow < maxCol
            ? buildXYPath(boxesPosition, currentPlayer, boxSize)
            : buildYXPath(boxesPosition, currentPlayer, boxSize);
    }

    if (maxRow2 > 0 && maxRow1 > 0) {
        return buildXYXPath(boxesPosition, currentPlayer, boxSize);
    }

    if (maxCol2 > 0 && maxCol1 > 0) {
        return buildYXYPath(boxesPosition, currentPlayer, boxSize);
    }

    const movement = [];
    if (xSteps > 0) movement.push(...buildXPath(boxesPosition, currentPlayer, boxSize));
    if (ySteps > 0) movement.push(...buildYPath(boxesPosition, currentPlayer, boxSize));
    return movement;
};

const createPieceStyle = ({ isSelected, isSmallScreen, theme, color }) => ({
    width: isSelected ? (isSmallScreen ? 10 : 30) : (isSmallScreen ? 3 : 25),
    height: isSelected ? (isSmallScreen ? 10 : 30) : (isSmallScreen ? 3 : 25),
    borderRadius: isSmallScreen ? 12 : 12.5,
    backgroundColor: theme.colors[color],
    borderWidth: isSelected ? (isSmallScreen ? 3 : 5) : (isSmallScreen ? 3 : 2),
    borderColor: isSelected ? theme.colors.selected : '#ffffff',
    padding: isSmallScreen ? 6.5 : 15,
    elevation: isSmallScreen ? (isSelected ? 4 : 2) : 0,
    shadowColor: isSelected ? (theme.colors.shadowColor ? theme.colors.shadowColor : "") : "",
    shadowOffset: {
        width: 0,
        height: 0,
    },
    shadowOpacity: isSelected ? 0.7 : 0,
    shadowRadius: isSelected ? 50 : 0,
});

const moveElementWithState = ({ boxesPosition, currentPlayer, dispatch }) => {
    const { kickedPlayer, returenToBase, newPosition } = boxesPosition;
    if (returenToBase) {
        dispatch(moveSoldier({
            color: kickedPlayer.color,
            position: kickedPlayer.initialPosition,
            soldierID: kickedPlayer.id,
            returenToBase: returenToBase ? returenToBase : false
        }));
        dispatch(setActivePlayer());
        dispatch(resetTimer());
        return;
    }

    dispatch(moveSoldier({
        color: currentPlayer.color,
        position: newPosition,
        soldierID: currentPlayer.id,
        steps: 0,
    }));

    dispatch(setCurrentPlayer(null));
    dispatch(checkIfGotEnemy({ color: currentPlayer.color, position: newPosition }));
};

const runAnimationSequence = ({ animatedValue, sequence, dispatch, onComplete, index = 0 }) => {
    Animated.timing(animatedValue, {
        toValue: sequence[index],
        duration: 550,
        useNativeDriver: false,
    }).start(({ finished }) => {
        if (!finished) {
            dispatch(setShowClone(false));
            return;
        }

        const isLastStep = index === sequence.length - 1;
        if (isLastStep) {
            onComplete();
            dispatch(setShowClone(false));
            return;
        }

        runAnimationSequence({ animatedValue, sequence, dispatch, onComplete, index: index + 1 });
    });
};

export default function Player({ color, isSelected, onPress }) {
    const animatedValue = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
    const currentPlayer = useSelector(state => state.game.currentPlayer);
    const boxesPosition = useSelector(state => state.animation.boxesPosition);
    const showClone = useSelector(state => state.animation.showClone);
    const boxSize = useSelector(state => state.animation.boxSize);
    const theme = useSelector(state => state.theme.current);
    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height;
    const isSmallScreen = windowWidth < 375 || windowHeight < 667;
    const dispatch = useDispatch();

    const styles = StyleSheet.create({
        clone: {
            width: isSmallScreen ? 20 : "",
            height: isSmallScreen ? 20 : "",
            zIndex: 999,
            elevation: isSmallScreen ? 999 : 0,
        }
    });

    React.useEffect(() => {
        if (!shouldAnimate(showClone, currentPlayer, color, isSelected, boxesPosition)) return;

        animatedValue.setValue({ x: 0, y: 0 });
        const movementSequence = buildMovementSequence(boxesPosition, currentPlayer, boxSize);
        if (movementSequence.length === 0) return;

        dispatch(setShowClone(true));
        runAnimationSequence({
            animatedValue,
            sequence: movementSequence,
            dispatch,
            onComplete: () => moveElementWithState({ boxesPosition, currentPlayer, dispatch }),
        });
    }, [boxesPosition]);

    return (
        <Animated.View style={[styles.clone, showClone ? { zIndex: 999 * 2 } : {},
        {
            top: animatedValue.y,
            left: animatedValue.x,
        }]} >
            <Pressable
                onPress={() => onPress()}
                android_ripple={isSmallScreen ? { color: 'rgba(255,255,255,0.3)', borderless: true } : null}
                style={createPieceStyle({ isSelected, isSmallScreen, theme, color })}
            />
        </Animated.View>
    );
}
