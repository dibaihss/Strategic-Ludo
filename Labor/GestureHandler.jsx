import React from 'react';
import { StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

export default function GesturePlayer({ color, isSelected }) {
    const isPressed = useSharedValue(false);
    // Set initial position coordinates
    const initialPosition = { x: 5, y: 200 }; // Adjust these values as needed
    const offset = useSharedValue(initialPosition);
    const start = useSharedValue(initialPosition);

//   const moveToPosition = (targetX, targetY) => {
//     offset.value = withSpring({
//       x: targetX,
//       y: targetY
//     }, {
//       damping: 20,
//       stiffness: 90
//     });
//     // Update start value to maintain the new position
//     start.value = {
//       x: targetX,
//       y: targetY
//     };
//   };

 // Add function to trigger movement

 const moveToPosition = (targetX, targetY) => {
    // First move in X direction
    offset.value = withSpring({
      x: targetX,
      y: offset.value.y
    }, {
      damping: 20,
      stiffness: 90,
      duration: 600,
    }, (finished) => {
      if (finished) {
        // Then move in Y direction after X movement is complete
        offset.value = withSpring({
          x: targetX,
          y: targetY
        }, {
          damping: 20,
          stiffness: 90,
          duration: 600,
        });
      }
    });
  
    // Update final position
    start.value = {
      x: targetX,
      y: targetY
    };
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
    };
  });

  return (
    <>
      <Pressable
        onPress={() => moveToPosition(200, 300)} // Move to x: 200 when pressed
        style={styles.button}
      >
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
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  player: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    position: 'absolute',
    zIndex: 3,
  },
});