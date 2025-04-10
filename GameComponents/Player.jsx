import React from 'react';
import { View } from 'react-native';

export default function Player({color}) {
    return (
        <View
            style={{
                width: 25,
                height: 25,
                borderRadius: 12.5,
                backgroundColor: color,
                borderWidth: 2,
                borderColor: 'white',
                position: 'absolute',
                zIndex: 1,
            }}
        />
    );
}