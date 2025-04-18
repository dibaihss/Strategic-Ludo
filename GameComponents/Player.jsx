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

    let iterations = 0;
    let movingValues = []
    let boxSize = 45

    const [sourcePosition, setSourcePosition] = useState({ x: 0, y: 0 }); // State to store source position


    const currentPlayer = useSelector(state => state.game.currentPlayer);
    const boxesPosition = useSelector(state => state.animation.boxesPosition)
    const showClone = useSelector(state => state.animation.showClone)
    const dispatch = useDispatch();


    React.useEffect(() => {
        if (!showClone) {
            if (currentPlayer && currentPlayer.color === color && isSelected === true && boxesPosition) {
                const { xSteps, ySteps, maxRow, maxCol, maxRow1, maxRow2, maxCol1, maxCol2 } = boxesPosition
                // animation startet showclone is true
                dispatch(setShowClone(true))

                animatedValue.setValue({ x: sourcePosition.x, y: sourcePosition.y });

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
        let { ySteps, xSteps } = boxesPosition

        let categorie = currentPlayer.position.match(/[a-zA-Z]+/)[0];
        if (categorie === "c" || categorie === "d") ySteps = -ySteps
        if (categorie === "c" || categorie === "b") xSteps = -xSteps

        movingValues.push({ x: boxSize * -xSteps, y: 0 })
        moveEleWithAnimation()
    }

    const moveInY = () => {
        let { ySteps, xSteps } = boxesPosition

        let categorie = currentPlayer.position.match(/[a-zA-Z]+/)[0];
        if (categorie === "c" || categorie === "d") ySteps = -ySteps
        if (categorie === "c") xSteps = -xSteps

        movingValues.push({ x: 0, y: boxSize * -ySteps })
        moveEleWithAnimation()
    }

    const moveInXYX = () => {
        let { ySteps, xSteps, xSteps2 } = boxesPosition

        let rowOffset = 55
        let categorie = currentPlayer.position.match(/[a-zA-Z]+/)[0];
        if (categorie === "c") {
            ySteps = -ySteps
            xSteps = -xSteps
            rowOffset = -rowOffset
        }
        if (categorie === "a") {
            xSteps2 = -xSteps2
        }



        movingValues.push({ x: boxSize * -xSteps, y: 0 })
        movingValues.push({ x: boxSize * -xSteps, y: -rowOffset })
        let reachedPos = boxSize * -xSteps
        movingValues.push({ x: reachedPos + boxSize * -xSteps2, y: -rowOffset })

        console.log(movingValues)

        moveEleWithAnimation()

    }
    const moveInYXY = () => {
        let { ySteps, ySteps2 } = boxesPosition

        let colOffset = 55
        let categorie = currentPlayer.position.match(/[a-zA-Z]+/)[0];
        if (categorie === "d") ySteps = -ySteps
        if (categorie === "b"){
            colOffset = -colOffset
            ySteps2 = -ySteps2
        } 
        
        if(ySteps === -1 || ySteps2 === 0){
            movingValues.push({ x: -colOffset, y: 0 })
         
        }else{
            movingValues.push({ x: 0, y: boxSize * -ySteps })
            movingValues.push({ x: -colOffset, y: boxSize * -ySteps })
            let reachedPos = boxSize * -ySteps
            movingValues.push({ x: -colOffset, y: reachedPos + boxSize * -ySteps2 })
            
        }
        console.log(movingValues)
       

        moveEleWithAnimation()

    }

    const moveEleWithAnimation = () => {

        Animated.timing(animatedValue, {
            toValue: movingValues[iterations], // Animate both X and Y directions
            duration: duration,
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