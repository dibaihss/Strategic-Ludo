import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Animated,

} from 'react-native';


export default function Player({color, isSelected, onPress}) {
 const animatedValue = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
    const [showClone, setShowClone] = useState(false);

    const [sourcePosition, setSourcePosition] = useState({ x: 5, y: -5 }); // State to store source position
    const [targetPosition, setTargetPosition] = useState({ x: 5, y: -90}); // State to store target position


    const moveElement = async () => {
        if (sourcePosition && targetPosition) {
            animatedValue.setValue({ x: sourcePosition.x, y: sourcePosition.y });
            setShowClone(true);

            Animated.timing(animatedValue, {
                toValue: { x: targetPosition.x, y: targetPosition.y }, // Animate both X and Y directions
                duration: 600,
                useNativeDriver: false,
            }).start(() => {
                setShowClone(false);
            });
        }
    };


    return (
               <Animated.View style={[styles.card,styles.clone ,
                {
                    left: animatedValue.x,
                    top: animatedValue.y,
                }]} >
                    <Pressable
                                 onPress={() => {
                                    onPress()
                                    moveElement()
                            
                                    
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
                                    padding:15
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