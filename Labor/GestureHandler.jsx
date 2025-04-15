import React, {useState, useEffect} from 'react';
import { StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

export default function GesturePlayer({ color, isSelected, initialPosition, startMovinAnim }) {
    const isPressed = useSharedValue(false);
    const isAnimating = useSharedValue(true);
    // Set initial position coordinates
    // const initialPosition = { x: 5, y: 200 }; // Adjust these values as needed

    const offset = useSharedValue(initialPosition);
    const start = useSharedValue(initialPosition);

 React.useEffect(() => {
        if (startMovinAnim) {
            moveToPosition(startMovinAnim.x, startMovinAnim.y);
        }
    }, [startMovinAnim]);

    const moveToPosition = (targetX, targetY) => {
        isAnimating.value = true;
        offset.value = withSpring({
            x: offset.value.x,
            y: targetY
        }, {
            damping: 20,
            stiffness: 90,
            duration: 600,
        }, (finished) => {
            if (finished) {
                offset.value = withSpring({
                    x: targetX,
                    y: targetY
                }, {
                    damping: 20,
                    stiffness: 90,
                    duration: 600,
                }, () => {
                    // Return to original position after animation
                    offset.value = withSpring({
                        x: initialPosition.x,
                        y: initialPosition.y
                    }, {
                        damping: 20,
                        stiffness: 90,
                        duration: 600,
                    }, () => {
                        isAnimating.value = false;
                        start.value = initialPosition;
                    });
                });
            }
        });
        
    };


  const gesture = Gesture.Pan()
    .onBegin(() => {
      isPressed.value = true;
    })
    .onUpdate((e) => {
      offset.value = {
        x: e.translationX + start.value.x,
        y: e.translationY + start.value.y,
      };
    })
    .onEnd(() => {
      start.value = {
        x: offset.value.x,
        y: offset.value.y,
      };
    })
    .onFinalize(() => {
      isPressed.value = false;
    });

    const animatedStyles = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: offset.value.x },
                { translateY: offset.value.y },
                { scale: withSpring(isPressed.value ? 1.2 : 1) },
            ],
            opacity: withSpring(isAnimating.value ? 1 : 0), // Fade out when animation ends
            display: isAnimating.value ? 'flex' : 'none',
        };
    });

  return (
  
        <GestureDetector gesture={gesture}>
            <Animated.View
                style={[
                    styles.player,
                    animatedStyles,
                    {
                        backgroundColor: color,
                        borderWidth: isSelected ? 5 : 2,
                        borderColor: isSelected ? "black" : 'white',
                    },
                ]}
            />
        </GestureDetector>
    );
 
}

const styles = StyleSheet.create({
  player: {
    width: 30,
    height: 30,
    borderRadius: 12.5,
    position: 'absolute',
    zIndex: 10000,
    padding: 15
    // bottom: 0,
    // top: 0,
    // left: 0,
    // right: 0
    
  },
});