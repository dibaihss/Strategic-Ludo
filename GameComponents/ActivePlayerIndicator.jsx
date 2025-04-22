import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import { getLocalizedColor } from "../assets/shared/hardCodedData.js";


const ActivePlayerIndicator = () => {
  const activePlayer = useSelector(state => state.game.activePlayer);
  const theme = useSelector(state => state.theme.current);
  const systemLang = useSelector(state => state.language.systemLang);
  const windowWidth = Dimensions.get('window').width;
  const isSmallScreen = windowWidth < 375;
  
  // Get localized player name
  const localizedPlayerName = getLocalizedColor(activePlayer, systemLang);
  
  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors[activePlayer],
      paddingVertical: isSmallScreen ? 8 : 10,
      paddingHorizontal: 15,
      borderRadius: 20,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    text: {
      color: '#ffffff',
      fontWeight: 'bold',
      fontSize: isSmallScreen ? 14 : 16,
      marginLeft: 8,
      textShadowColor: 'rgba(0, 0, 0, 0.75)',
      textShadowOffset: { width: -1, height: 1 },
      textShadowRadius: 5
    }
  });
  
  return (
    <View style={styles.container}>
      <MaterialIcons name="person" size={isSmallScreen ? 18 : 24} color="white" />
      <Text style={styles.text}>
        {localizedPlayerName}
      </Text>
    </View>
  );
};

export default ActivePlayerIndicator;