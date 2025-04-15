import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Animated,

} from 'react-native';
import { boxes } from "../assets/shared/hardCodedData.js"

export default function MoveAnimationExample() {

    const animatedValue = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
    const [showClone, setShowClone] = useState(false);

    const [sourcePosition, setSourcePosition] = useState(null); // State to store source position
    const [targetPosition, setTargetPosition] = useState(null); // State to store target position



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
        <View style={styles.container}>
            <View
                style={[{ backgroundColor: '#88f', width: 40, height: 40 }]}
                onLayout={(event) => {
                    const { x, y } = event.nativeEvent.layout;
                    setSourcePosition({ x, y });
                }}
            >
                <Text>Source</Text>
            </View>

            <Pressable
                onPress={moveElement}
                style={{
                    width: 25,
                    height: 25,
                    borderRadius: 12.5,
                    backgroundColor: "red",
                    borderWidth: 2,
                    borderColor: "black",
                    position: 'absolute',
                    zIndex: 3,
                }}
            />

           

            {boxes.column1.map((number) => {
                  return (  <View
                        key={number}
                        style={[styles.box, { backgroundColor: '#8f8' }]}
                        onLayout={(event) => {
                            const { x, y } = event.nativeEvent.layout;
                            setTargetPosition({ x, y });
                        }}
                    >
                        <Text>{number}</Text>
                    </View>
                  )
                })}
                <View style={[styles.horizontalRow, { transform: [{ rotate: "90deg" }] }]}>
                          {boxes.row1.map((number) => {
                  return (  <View
                        key={number}
                        style={[styles.box, { backgroundColor: '#8f8' }]}
                        onLayout={(event) => {
                            const { x, y } = event.nativeEvent.layout;
                            setTargetPosition({ x, y });
                        }}
                    >
                        <Text>{number}</Text>
                    </View>
                  )
                })}
         </View>
            {showClone && (
                <Animated.View
                    style={[
                        styles.clone,
                        {
                            left: animatedValue.x,
                            top: animatedValue.y,
                        },
                    ]}
                >
                    <Pressable
                        onPress={moveElement}
                        style={{
                            width: 25,
                            height: 25,
                            borderRadius: 12.5,
                            backgroundColor: "red",
                            borderWidth: 2,
                            borderColor: "black",
                            position: 'absolute',
                            zIndex: 3,
                        }}
                    />
                </Animated.View>
            )}
            {/* {boxes.row4.map((number) => {
                 <View
                        key={`box-${number}`}
                        style={[styles.verbBox, styles.box]}
                        onLayout={(event) => {
                            const { x, y } = event.nativeEvent.layout;
                            setTargetPosition({ x, y });
                        }}
                    >
                        <Text style={styles.verbText}>{number}</Text>
                    </View>
            })     
} */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
     
        paddingVertical: 20, // Add padding to avoid overlap
    },
    box: {
        width: 100,
        height: 100,
        borderRadius: 10,
    },
    button: {
        backgroundColor: '#ccc',
        padding: 12,
        borderRadius: 8,
    },
    clone: {
        position: 'absolute',
        zIndex: 1000,
    },
    verbBox: {
        backgroundColor: "#f0f4f8",
        borderWidth: 1,
        borderColor: "#d1d9e6",
        padding: 6,
        margin: 2,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    verbText: {
        textAlign: 'center',
        fontSize: 14,
    },
    horizontalRow: {
        width: "auto",
        padding: 3,
        marginVertical: 15,
        transform: [{ rotate: "-90deg" }],
    },
});
