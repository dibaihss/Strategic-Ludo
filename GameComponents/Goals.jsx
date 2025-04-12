import { View } from "react-native";
import React from 'react';
import Player from './Player';
import { MaterialIcons } from '@expo/vector-icons';
import { styles } from "../assets/shared/styles.jsx";
import { useSelector } from 'react-redux';

export default function Goals() {
    // Get soldiers from Redux store
    const blueSoldiers = useSelector(state => state.game.blueSoldiers);
    const redSoldiers = useSelector(state => state.game.redSoldiers);


    return (
        <View style={styles.centerCircle}>
            <View style={styles.centerQuadrants}>
                {/* Yellow quadrant */}
                <View style={[styles.quadrant, { backgroundColor: '#ff8' }]}>
                    <MaterialIcons name="home" size={24} color="goldenrod" />
                </View>
                {/* Green quadrant */}
                <View style={[styles.quadrant, { backgroundColor: '#8f8' }]}>
                    <MaterialIcons name="home" size={24} color="darkgreen" />
                </View>
                {/* Red quadrant */}
                <View style={[styles.quadrant, { backgroundColor: '#f88' }]}>
                    <MaterialIcons name="home" size={24} color="darkred" />
                    {redSoldiers.find(obj => obj.isOut === true) &&
                        <Player color={redSoldiers[0].color} />}
                </View>
                {/* Blue quadrant */}
                <View style={[styles.quadrant, { backgroundColor: '#88f' }]}>
                    <MaterialIcons name="home" size={24} color="darkblue" />
                    {blueSoldiers.find(obj => obj.isOut === true) &&
                        <Player color={blueSoldiers[0].color} />}
                </View>
            </View>
        </View>
    );
}