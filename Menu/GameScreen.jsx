import SmalBoard from '../GameComponents/SmalBoard.jsx';
import { MaterialIcons } from '@expo/vector-icons';
import Goals from '../GameComponents/Goals.jsx';
import Bases from '../GameComponents/Bases.jsx';
import Timer from '../GameComponents/Timer.jsx';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { View, Text, StyleSheet, Pressable, Modal, ScrollView, Dimensions, Platform, ActivityIndicator } from 'react-native';
import { setActivePlayer, resetTimer, assignSoldiersToUsers, setOnlineModus } from '../assets/store/gameSlice.jsx';
import { fetchCurrentMatch } from '../assets/store/dbSlice.jsx';
import { uiStrings } from '../assets/shared/hardCodedData.js';

export default function GameScreen({ route, navigation }) {
  const dispatch = useDispatch();
  const theme = useSelector(state => state.theme.current);
  const systemLang = useSelector(state => state.language.systemLang);
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  const isSmallScreen = windowWidth < 375 || windowHeight < 667;
  const currentMatch = useSelector(state => state.auth.currentMatch);
  const user = useSelector(state => state.auth.user);

  const [gameIsStarted, setGameIsStarted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Get the game mode from navigation params
  const { mode, matchId } = route.params;

  useEffect(() => {
    // For multiplayer games, set up polling and player assignments
    if (mode === 'multiplayer') {
      // Set up polling for match updates
      const pollingInterval = setInterval(() => {
        if (matchId) {
          dispatch(fetchCurrentMatch(matchId));
        }
      }, 3000); // Poll every 3 seconds
      
      // Initial fetch when component mounts
      if (matchId) {
        dispatch(fetchCurrentMatch(matchId))
          .then(() => {
            setLoading(false);
          });
      }
      
      // Clean up interval when component unmounts
      return () => clearInterval(pollingInterval);
    } else {
      // For local games, just set gameIsStarted to true
      setGameIsStarted(true);
      setLoading(false);
    }
  }, [mode, matchId, dispatch]);
  
  // Setup player assignments when match data is available
  useEffect(() => {
    if (mode === 'multiplayer' && currentMatch && currentMatch.users) {
      const players = currentMatch.users;
      
      if (players.length >= 2) {
        
        // Set online mode and assign players to colors
        dispatch(setOnlineModus(true));
  
        setGameIsStarted(true);
      }
    }
  }, [currentMatch?.users, mode, dispatch]);
  
  const handleExitGame = () => {
    // Navigate back to home
    navigation.navigate('Home');
  };

  const styles = StyleSheet.create({
    container: {
      padding: isSmallScreen ? 1 : 10,
      flex: 1,
      margin: isSmallScreen ? 1 : 10,
      justifyContent: "center",
      alignItems: "center",
    },
    controls: {
      position: 'absolute',
      bottom: isSmallScreen ? 20 : -20,
      left: isSmallScreen ? "25%" : "",
      flexDirection: 'row',
      gap: isSmallScreen ? 4 : 20,
      backgroundColor: '#ffffff',
      padding: isSmallScreen ? 2 : 10,
      borderRadius: 10,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        },
        android: {
          elevation: 6,
        },
      }),
      zIndex: 999
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: isSmallScreen ? 2 : 10,
      backgroundColor: '#e8ecf4',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#d1d9e6',
      gap: isSmallScreen ? 2 : 10,
      elevation: isSmallScreen ? 3 : 0,
    },
    buttonText: {
      fontSize: isSmallScreen ? 14 : 16,
      color: '#2a3f5f',
      fontWeight: isSmallScreen ? 'bold' : '500',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: '#333',
    },
  });

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          {uiStrings[systemLang].loadingGame || 'Loading game...'}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {gameIsStarted ? (
        <>
          <Timer />
          <SmalBoard />
          <Goals />
          <Bases />
          <View style={[styles.controls, { backgroundColor: theme.colors.background }]}>
            <Pressable
              style={[styles.button, {
                backgroundColor: theme.colors.button,
                borderColor: theme.colors.buttonBorder
              }]}
              onPress={() => {
                dispatch(setActivePlayer());
                dispatch(resetTimer());
              }}
            >
              <MaterialIcons name="casino" size={24} color={theme.colors.buttonText} />
              <Text style={[styles.buttonText, { color: theme.colors.buttonText }]}>
                {uiStrings[systemLang].skipButton || 'Skip Turn'}
              </Text>
            </Pressable>
            
            <Pressable
              style={[styles.button, {
                backgroundColor: theme.colors.button,
                borderColor: theme.colors.buttonBorder
              }]}
              onPress={handleExitGame}
            >
              <MaterialIcons name="exit-to-app" size={24} color={theme.colors.buttonText} />
              <Text style={[styles.buttonText, { color: theme.colors.buttonText }]}>
                {uiStrings[systemLang].exitGame || 'Exit Game'}
              </Text>
            </Pressable>
          </View>
        </>
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            {uiStrings[systemLang].waitingForPlayers || 'Waiting for enough players to join...'}
          </Text>
          <Pressable
            style={[styles.button, {
              backgroundColor: theme.colors.button,
              marginTop: 20
            }]}
            onPress={handleExitGame}
          >
            <Text style={[styles.buttonText, { color: theme.colors.buttonText }]}>
              {uiStrings[systemLang].backToLobby || 'Back to Lobby'}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}