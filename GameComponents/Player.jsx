import React, { useRef } from 'react';
import {
    StyleSheet,
    Pressable,
    Animated,

} from 'react-native';
import {
    setCurrentPlayer,
    moveSoldier,

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

    const dispatch = useDispatch();


    React.useEffect(() => {
        if (!showClone) {
            if (currentPlayer && currentPlayer.color === color && isSelected === true && boxesPosition) {
                const { xSteps, ySteps, maxRow, maxCol, maxRow1, maxRow2, maxCol1, maxCol2 } = boxesPosition
         
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
        let { xSteps, newPosition } = boxesPosition

        // if(newPosition === "") xSteps--
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
      
        if(xSteps === 1 && xSteps2 === 0){
            movingValues.push({ x: 0, y: -rowOffset })
        }else{
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


        let colOffset = boxSize +5
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

    const moveEleWithAnimation = () => {
        dispatch(setShowClone(true))
        Animated.timing(animatedValue, {
            toValue: movingValues[iterations], // Animate both X and Y directions
            duration: 550,
            useNativeDriver: false,
        }).start(({ finished }) => {
            if (finished && iterations === movingValues.length - 1) {
                moveElement()
                // dispatch(setShowClone(false))
            }
            else if (finished) {
                iterations++
                moveEleWithAnimation()
            }
        });

    }

    const moveElement = () => {
        const { newPosition } = boxesPosition
        dispatch(moveSoldier({
            color: currentPlayer.color,
            position: newPosition,
            soldierID: currentPlayer.id,
            steps: 0
        }));
        if(newPosition === ""){
            dispatch(setCurrentPlayer(null));
        }else{
            dispatch(setCurrentPlayer({ ...currentPlayer, position: newPosition }));
        }
    };

    return (
        <Animated.View style={[styles.clone, showClone ? { zIndex: 999 * 2, } : {},
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
                    padding: 15
                }}
            />
        </Animated.View>
    );
}
const styles = StyleSheet.create({
    clone: {
        zIndex: 999, // Add this line
        elevation: 999, // Add this for Android
    }
});