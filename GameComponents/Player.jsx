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


    const [sourcePosition, setSourcePosition] = useState({ x: 5, y: -5 }); // State to store source position
    const [targetPosition, setTargetPosition] = useState({ x: 0, y: -42 }); // State to store target position

    const currentPlayer = useSelector(state => state.game.currentPlayer);
    const boxesPosition = useSelector(state => state.animation.boxesPosition)
    const showClone = useSelector(state => state.animation.showClone)
    const dispatch = useDispatch();


     React.useEffect(() => {
        if(!showClone){
            if (currentPlayer && currentPlayer.color === color && isSelected === true) {
                
                moveElement();
           }
        }}, [boxesPosition]);

     
    const moveElement = () => {
        dispatch(setShowClone(true))
        if (sourcePosition && targetPosition) {
            animatedValue.setValue({ x: sourcePosition.x, y: sourcePosition.y });
           
                Animated.timing(animatedValue, {
                    toValue: { x: targetPosition.x, y: targetPosition.y * boxesPosition.ySteps}, // Animate both X and Y directions
                    duration: 600,
                    useNativeDriver: false,
                }).start(({finished}) => {
                    
                    setTargetPosition({ x: targetPosition.x, y: targetPosition.y})
                    console.log("fertig")
                    if(finished){
                        dispatch(moveSoldier({
                            color: currentPlayer.color,
                            position: boxesPosition.newPosition,
                            soldierID: currentPlayer.id,
                            steps: boxesPosition.ySteps
                        }));
        
                        dispatch(setCurrentPlayer({ ...currentPlayer, position: boxesPosition.newPosition }));
                    }
                });
        }
    };

    return (
        <Animated.View style={[styles.card, styles.clone,
        {
            left: animatedValue.x,
            top: animatedValue.y,
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
    container: {
        width: 30,

    },
    clone: {
        position: 'absolute',
        zIndex: 1000,
    },
    card: {
        backgroundColor: 'blue',
    },
});