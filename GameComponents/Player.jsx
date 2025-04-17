import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Animated,

} from 'react-native';
import {
    setCurrentPlayer,
    moveSoldier,
    enterNewSoldier,
    updateBlueCards,
    updateRedCards,
    updateYellowCards,
    updateGreenCards,

} from '../assets/store/gameSlice.jsx';
import { setShowClone } from '../assets/store/animationSlice.jsx'

import { useDispatch, useSelector } from 'react-redux';

export default function Player({ color, isSelected, onPress }) {
    const animatedValue = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
    // const [showClone, setShowClone] = useState(false);

    const duration = 600;

    const [sourcePosition, setSourcePosition] = useState({ x: 0, y: 0 }); // State to store source position
    const [targetPosition, setTargetPosition] = useState({ x: 0, y: 45 }); // State to store target position

    const [targetPositionXX, setTargetPositionXX] = useState({ x: 45, y: 0 });

    const targetPositionX = { x: 45, y: 0 }; // State to store target position
    const targetPositionY = { x: 0, y: 45 }; // State to store target position

    const currentPlayer = useSelector(state => state.game.currentPlayer);
    const boxesPosition = useSelector(state => state.animation.boxesPosition)
    const showClone = useSelector(state => state.animation.showClone)
    const dispatch = useDispatch();


    React.useEffect(() => {
        if (!showClone) {
            if (currentPlayer && currentPlayer.color === color && isSelected === true && boxesPosition) {
                const { xSteps, ySteps, maxRow, maxCol, newPosition } = boxesPosition
                // animation startet showclone is true
                dispatch(setShowClone(true))

                animatedValue.setValue({ x: sourcePosition.x, y: sourcePosition.y });

                if (xSteps > 0 && ySteps > 0) {
                    if (maxRow < maxCol) {
                        moveInXY()
                    } else {
                        moveInYX()
                    }
                } else {
                    xSteps > 0 ? moveInX(true) : 0
                    ySteps > 0 ? moveInY(true) : 0
                }

            }
        }
    }, [boxesPosition]);

    const moveInXY = () => {
        console.log("XY")
        moveInX(false)

    }

    const moveInYX = () => {
        console.log("YX")
        moveInY(false)

    }

    const moveInY = (done, reachedPos) => {
        console.log("Y")
        let { ySteps } = boxesPosition

        let categorie = currentPlayer.position.match(/[a-zA-Z]+/)[0];
        if (categorie === "c" || categorie === "d") ySteps = -ySteps


        Animated.timing(animatedValue, {
            toValue: { x: reachedPos ? reachedPos : 0, y: targetPositionY.y * -ySteps }, // Animate both X and Y directions
            duration: duration,
            useNativeDriver: false,
        }).start(({ finished }) => {

            

            if (finished && done) {
                moveElement()
            }
            if (finished && !done) moveInX(true,targetPositionY.y * -ySteps  )

        });

    }
    const moveInX = (done, reachedPos) => {
        console.log("X")
        let { xSteps } = boxesPosition

        let categorie = currentPlayer.position.match(/[a-zA-Z]+/)[0];
        if (categorie === "b" || categorie === "c") xSteps = -xSteps

        Animated.timing(animatedValue, {
            toValue: { x: targetPositionX.x * -xSteps, y: reachedPos ? reachedPos : 0 }, // Animate both X and Y directions
            duration: duration,
            useNativeDriver: false,
        }).start(({ finished }) => {

            // setTargetPosition({ x: 0, y: targetPosition.y })
            console.log(targetPosition)

            if (finished && done) {
                moveElement()
            } else {
                moveInY(true, targetPositionX.x * -xSteps)
            }
        });

    }


    const moveElement = () => {
        dispatch(moveSoldier({
            color: currentPlayer.color,
            position: boxesPosition.newPosition,
            soldierID: currentPlayer.id,
            steps: boxesPosition.ySteps
        }));

        dispatch(setCurrentPlayer({ ...currentPlayer, position: boxesPosition.newPosition }));

    };

    return (
        <Animated.View style={[styles.card, styles.clone,
        {
            top: animatedValue.y,
            left: animatedValue.x,
        }]} >
            <Pressable
                onPress={() => {
                    onPress()
                }}
                style={{
                    width: isSelected ? 30 : 25,
                    height: isSelected ? 30 : 25,
                    borderRadius: 12.5,
                    backgroundColor: color,
                    borderWidth: isSelected ? 5 : 2,
                    borderColor: isSelected ? "black" : 'white',
                    position: 'absolute',
                    zIndex: 3,
                    padding: 15
                }}
            />
        </Animated.View>
    );
}
const styles = StyleSheet.create({
    clone: {
        position: 'absolute',
        zIndex: 10000,
    },
    card: {
        backgroundColor: 'blue',
    },
});