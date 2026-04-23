import React, { useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import {
    StyleSheet,
    Pressable,
    Animated,
    Dimensions,
    View
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
import { playSound } from '../assets/shared/audioManager';
import PawnGraphic from './PawnGraphic';

const NAMED_COLOR_MAP = {
    black: '#000000',
    blue: '#0000ff',
    green: '#008000',
    red: '#ff0000',
    white: '#ffffff',
    yellow: '#ffff00',
};

const parseColorChannels = (value) => {
    if (typeof value !== 'string') return null;

    const trimmed = value.trim();
    if (/^#[0-9A-Fa-f]{6}$/.test(trimmed)) {
        return {
            red: Number.parseInt(trimmed.slice(1, 3), 16),
            green: Number.parseInt(trimmed.slice(3, 5), 16),
            blue: Number.parseInt(trimmed.slice(5, 7), 16),
        };
    }

    if (/^#[0-9A-Fa-f]{3}$/.test(trimmed)) {
        return {
            red: Number.parseInt(`${trimmed[1]}${trimmed[1]}`, 16),
            green: Number.parseInt(`${trimmed[2]}${trimmed[2]}`, 16),
            blue: Number.parseInt(`${trimmed[3]}${trimmed[3]}`, 16),
        };
    }

    const rgbMatch = /^rgba?\(([^)]+)\)$/i.exec(trimmed);
    if (rgbMatch) {
        const channels = rgbMatch[1]
            .trim()
            .split(/[\s,/]+/)
            .filter(Boolean)
            .slice(0, 3)
            .map(Number);

        if (channels.length === 3 && channels.every((channel) => Number.isFinite(channel))) {
            return {
                red: channels[0],
                green: channels[1],
                blue: channels[2],
            };
        }
    }

    const namedColor = NAMED_COLOR_MAP[trimmed.toLowerCase()];
    return namedColor ? parseColorChannels(namedColor) : null;
};

const withAlpha = (colorValue, alpha, fallback = 'transparent') => {
    const channels = parseColorChannels(colorValue);
    if (!channels) return fallback;

    return `rgba(${channels.red}, ${channels.green}, ${channels.blue}, ${alpha})`;
};

const getPieceContainerSize = (isSelected, isSmallScreen, sizeVariant) => {
    if (sizeVariant === 'stacked') {
        if (isSelected) {
            return isSmallScreen ? 20 : 32;
        }

        return isSmallScreen ? 16 : 32;
    }

    if (isSelected) {
        return isSmallScreen ? 30 : 52;
    }

    return isSmallScreen ? 24 : 42;
};

const getPieceImageSize = (isSelected, isSmallScreen, sizeVariant) => {
    if (sizeVariant === 'stacked') {
        if (isSelected) {
            return isSmallScreen ? 12 : 22;
        }

        return isSmallScreen ? 10 : 18;
    }

    if (isSelected) {
        return isSmallScreen ? 26 : 54;
    }

    return isSmallScreen ? 22 : 36;
};

const getPieceBorderWidth = (isSelected, isSmallScreen, sizeVariant) => {
    if (sizeVariant === 'stacked') {
        if (isSelected) {
            return isSmallScreen ? 2 : 3;
        }

        return 1;
    }

    if (!isSelected) {
        return 0;
    }

    return isSmallScreen ? 2 : 3;
};

const getPieceElevation = (isSelected, isSmallScreen) => {
    if (!isSmallScreen) {
        return 0;
    }

    return isSelected ? 4 : 2;
};

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
    
    playSound('move').catch(() => { });

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
    if (ySteps > 0) movement.push(...buildYPath(boxesPosition, currentPlayer, boxSize))
    return movement;
};

const createPieceContainerStyle = ({ isSelected, isSmallScreen, theme, color, sizeVariant }) => {
    const size = getPieceContainerSize(isSelected, isSmallScreen, sizeVariant);
    const borderWidth = getPieceBorderWidth(isSelected, isSmallScreen, sizeVariant);
    const elevation = getPieceElevation(isSelected, isSmallScreen);
    const isStacked = sizeVariant === 'stacked';
    let shadowColor = '';
    let borderColor = theme.colors.selected;
    let backgroundColor = withAlpha(theme.colors[color], 0.18);
    let shadowOpacity = isSelected ? 0.8 : 0;
    let shadowRadius = isSelected ? 24 : 0;

    if (isStacked) {
        borderColor = isSelected
            ? theme.colors.selected
            : withAlpha(theme.colors[color], 0.8, theme.colors[color]);
        backgroundColor = withAlpha(theme.colors[color], isSelected ? 0.82 : 0.62);
        shadowOpacity = isSelected ? 0.95 : 0;
        shadowRadius = isSelected ? 8 : 0;
    }

    if (isSelected) {
        shadowColor = isStacked ? theme.colors.selected : (theme.colors.shadowColor || '');
    }

    return {
        width: size,
        height: size,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: size / 2,
        borderWidth,
        borderColor,
        backgroundColor,
        elevation,
        shadowColor,
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity,
        shadowRadius,
        overflow: 'visible',
    };
};

const createPieceImageStyle = ({ isSelected, isSmallScreen, sizeVariant }) => {
    const size = getPieceImageSize(isSelected, isSmallScreen, sizeVariant);

    return {
        width: size,
        height: size,
    };
};

const createPointerStyle = ({ isSelected, isSmallScreen, theme, sizeVariant }) => {
    if (!isSelected || sizeVariant === 'stacked') return { display: 'none' };
    const size = isSmallScreen ? 8 : 16;
    return {
        position: 'absolute',
        top: -(size + 2),
        left: '50%',
        marginLeft: -(size / 2),
        width: 0,
        height: 0,
        borderLeftWidth: size / 2,
        borderRightWidth: size / 2,
        borderTopWidth: size,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: theme?.colors?.selected || '#FFD700',
    };
};

const moveElementWithState = ({ boxesPosition, currentPlayer, dispatch }) => {
    const { kickedPlayer, returenToBase, newPosition } = boxesPosition;
    if (returenToBase) {
        dispatch(moveSoldier({
            color: kickedPlayer.color,
            position: kickedPlayer.initialPosition,
            soldierID: kickedPlayer.id,
            returenToBase,
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

export default function Player({ color, isSelected, isSelectedForTips, onTipLayout, onPress, containerStyle, sizeVariant }) {
    const animatedValue = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
    const pointerBounce = useRef(new Animated.Value(0)).current;
    const pressableRef = useRef(null);
    const currentPlayer = useSelector(state => state.game.currentPlayer);
    const boxesPosition = useSelector(state => state.animation.boxesPosition);
    const showClone = useSelector(state => state.animation.showClone);
    const boxSize = useSelector(state => state.animation.boxSize);
    const theme = useSelector(state => state.theme.current);
    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height;
    const isSmallScreen = windowWidth < 375 || windowHeight < 667;
    const dispatch = useDispatch();
    const effectiveSelected = isSelected || isSelectedForTips;

    const reportTipLayout = useCallback(() => {
        if (!isSelectedForTips || typeof onTipLayout !== 'function') {
            return;
        }

        if (!pressableRef.current?.measureInWindow) {
            return;
        }

        pressableRef.current.measureInWindow((x, y, width, height) => {
            if (![x, y, width, height].every(Number.isFinite)) {
                return;
            }

            onTipLayout({ x, y, width, height });
        });
    }, [isSelectedForTips, onTipLayout]);

    const styles = StyleSheet.create({
        clone: {
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'visible',
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

    React.useEffect(() => {
        if (effectiveSelected) {
            const bounce = Animated.loop(
                Animated.sequence([
                    Animated.timing(pointerBounce, {
                        toValue: -5,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pointerBounce, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                ])
            );
            bounce.start();
            return () => bounce.stop();
        } else {
            pointerBounce.setValue(0);
        }
    }, [effectiveSelected, pointerBounce]);

    React.useEffect(() => {
        if (!isSelectedForTips) {
            return;
        }

        const frame = requestAnimationFrame(() => reportTipLayout());
        return () => cancelAnimationFrame(frame);
    }, [isSelectedForTips, reportTipLayout, windowWidth, windowHeight]);

    const pointerStyle = React.useMemo(
        () => createPointerStyle({ isSelected: effectiveSelected, isSmallScreen, theme, sizeVariant }),
        [effectiveSelected, isSmallScreen, sizeVariant, theme]
    );

    return (
        <Animated.View style={[styles.clone, containerStyle, showClone ? { zIndex: 999 * 2 } : {},
        {
            top: animatedValue.y,
            left: animatedValue.x,
        }]} >
            {effectiveSelected && (
                <Animated.View style={[pointerStyle, { transform: [{ translateY: pointerBounce }] }]} />
            )}
            <Pressable
                ref={pressableRef}
                onLayout={reportTipLayout}
                onPress={onPress}
                android_ripple={isSmallScreen ? { color: 'rgba(255,255,255,0.3)', borderless: true } : null}
                style={createPieceContainerStyle({ isSelected: effectiveSelected, isSmallScreen, theme, color, sizeVariant })}
            >
                <PawnGraphic
                    fillColor={theme.colors[color]}
                    style={createPieceImageStyle({ isSelected: effectiveSelected, isSmallScreen, sizeVariant })}
                />
            </Pressable>
        </Animated.View>
    );
}

Player.propTypes = {
    color: PropTypes.string.isRequired,
    containerStyle: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    isSelected: PropTypes.bool,
    isSelectedForTips: PropTypes.bool,
    onTipLayout: PropTypes.func,
    onPress: PropTypes.func.isRequired,
    sizeVariant: PropTypes.oneOf(['default', 'stacked']),
};

Player.defaultProps = {
    containerStyle: undefined,
    isSelected: false,
    isSelectedForTips: false,
    onTipLayout: undefined,
    sizeVariant: 'default',
};
