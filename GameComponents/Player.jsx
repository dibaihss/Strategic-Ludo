import React from 'react';
import { Pressable, View } from 'react-native';

export default function Player({color, isSelected, onPress}) {
    return (
        <Pressable
            onPress={onPress}
            style={{
                width: isSelected ? 30 : 25,
                height: isSelected ? 30 : 25,
                borderRadius: 12.5,
                backgroundColor: color,
                borderWidth: isSelected ? 5 : 2,
                borderColor: isSelected ? "black" : 'white',
                position: 'absolute',
                zIndex: 1,
            }}
        />
    );
}