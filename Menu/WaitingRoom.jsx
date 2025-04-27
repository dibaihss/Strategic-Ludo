import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ScrollView,
  FlatList,
  Image,
  Dimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentMatch, updateMatch } from '../assets/store/dbSlice.jsx';
import { setOnlineModus } from '../assets/store/gameSlice.jsx';
import { uiStrings } from '../assets/shared/hardCodedData.js';

const WaitingRoom = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const theme = useSelector(state => state.theme.current);
  const systemLang = useSelector(state => state.language.systemLang);
  const currentMatch = useSelector(state => state.auth.currentMatch);
  const user = useSelector(state => state.auth.user);
  const loading = useSelector(state => state.auth.loading);
  
  const [refreshing, setRefreshing] = useState(false);
  const [showStartButton, setShowStartButton] = useState(false);
  
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  const isSmallScreen = windowWidth < 375 || windowHeight < 667;

  // Poll for match updates
  useEffect(() => {
    if (currentMatch?.id) {
      const pollingInterval = setInterval(() => {
        updateMatchData()
 
      }, 2000); // Poll every 5 seconds
      
      return () => clearInterval(pollingInterval);
    }
  }, [currentMatch?.id, dispatch]);
  
  // Check if we should show start button or auto-start the game
  useEffect(() => {
    if (!currentMatch || !currentMatch.users) return;
    
    const players = currentMatch.users;
    
    // If there are 4 players, automatically start the game
    if (players.length === 4) {
      handleStartGame();
      return;
    }
    
    // If there are at least 2 players and current user is the host, show start button
    if (players.length >= 2 && isUserHost()) {
      setShowStartButton(true);
    } else {
      setShowStartButton(false);
    }
  }, [currentMatch?.users?.length]);
  
  const isUserHost = () => {
    if (!currentMatch || !user) return false;
    
    // Assuming the first user in the array is the host
    return currentMatch.users[0]?.id === user.id;
  };
  
  const handleRefresh = () => {
    if (!currentMatch?.id) return;
    setRefreshing(true);
    updateMatchData()
   
  };
  
  const updateMatchData = () => {
    dispatch(fetchCurrentMatch(currentMatch.id))
    .unwrap() // Extract the Promise from the Thunk
    .then(result => {
      console.log("Match data refreshed successfully:", result);
      dispatch(updateMatch(result)); // Update the Redux store with the new match data
    })
    .catch(error => {
      console.error("Error refreshing match data:", error);
    })
    .finally(() => {
      setRefreshing(false);
      console.log("Refresh operation complete");
    });

  }
  const handleStartGame = () => {
    const players = currentMatch.users;
    
    // Prepare player assignments based on number of players
    // let playerAssignments = [];
    
    // if (players.length === 2) {
    //   playerAssignments = [
    //     { userId: players[0]?.id, color: 'blue' },
    //     { userId: players[1]?.id, color: 'red' }
    //   ];
    // } else if (players.length === 3) {
    //   playerAssignments = [
    //     { userId: players[0]?.id, color: 'blue' },
    //     { userId: players[1]?.id, color: 'red' },
    //     { userId: players[2]?.id, color: 'yellow' }
    //   ];
    // } else if (players.length === 4) {
    //   playerAssignments = [
    //     { userId: players[0]?.id, color: 'blue' },
    //     { userId: players[1]?.id, color: 'red' },
    //     { userId: players[2]?.id, color: 'yellow' },
    //     { userId: players[3]?.id, color: 'green' }
    //   ];
    // }
    
    // Set online mode and assign players to colors
    dispatch(setOnlineModus(true));
    // dispatch(assignSoldiersToUsers(playerAssignments));
    
    // Navigate to the game screen
    navigation.navigate('Game', { 
      mode: 'multiplayer',
      matchId: currentMatch.id
    });
  };
  
  const handleLeaveMatch = () => {
    // Logic to leave the match (could be implemented in your dbSlice)
    navigation.navigate('Home');
  };
  
  if (loading && !currentMatch) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          {uiStrings[systemLang].loadingMatch || 'Loading match details...'}
        </Text>
      </View>
    );
  }
  
  if (!currentMatch) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {uiStrings[systemLang].matchNotFound || 'Match not found!'}
        </Text>
        <Pressable
          style={[styles.button, { backgroundColor: theme.colors.button }]}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={[styles.buttonText, { color: theme.colors.buttonText }]}>
            {uiStrings[systemLang].backToHome || 'Back to Home'}
          </Text>
        </Pressable>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {uiStrings[systemLang].waitingRoom || 'Waiting Room'}
        </Text>
        
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {uiStrings[systemLang].matchId || 'Match ID'}: {currentMatch.id}
        </Text>
      </View>
      
      <View style={[styles.playersContainer, { backgroundColor: theme.colors.card }]}>
        <View style={styles.playersHeader}>
          <Text style={[styles.playersTitle, { color: theme.colors.text }]}>
            {uiStrings[systemLang].players || 'Players'} ({currentMatch.users?.length || 0}/4)
          </Text>
          
          <Pressable 
            style={styles.refreshButton} 
            onPress={handleRefresh}
            disabled={refreshing}
          >
            <MaterialIcons 
              name="refresh" 
              size={20} 
              color={refreshing ? theme.colors.disabled : theme.colors.primary} 
            />
          </Pressable>
        </View>
        
        {refreshing && (
          <ActivityIndicator 
            size="small" 
            color={theme.colors.primary}
            style={styles.refreshIndicator} 
          />
        )}
        
        <FlatList
          data={currentMatch.users || []}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => (
            <View style={[styles.playerItem, { 
              backgroundColor: index % 2 === 0 ? theme.colors.background : theme.colors.card 
            }]}>
              <View style={styles.playerDetails}>
                <View style={[styles.playerAvatar, { backgroundColor: getPlayerColor(index) }]}>
                  <Text style={styles.playerInitial}>
                    {(item.name || item.username || "User").charAt(0).toUpperCase()}
                  </Text>
                </View>
                
                <Text style={[styles.playerName, { color: theme.colors.text }]}>
                  {item.name || item.username || "User"}
                  {item.id === user.id && (
                    <Text style={{ color: theme.colors.primary }}> (You)</Text>
                  )}
                </Text>
              </View>
              
              {index === 0 && (
                <View style={styles.hostBadge}>
                  <Text style={styles.hostBadgeText}>
                    {uiStrings[systemLang].host || 'Host'}
                  </Text>
                </View>
              )}
            </View>
          )}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              {uiStrings[systemLang].noPlayersYet || 'No players have joined yet'}
            </Text>
          }
        />
        
        <View style={styles.joinInfo}>
          <Text style={[styles.joinInfoText, { color: theme.colors.textSecondary }]}>
            {uiStrings[systemLang].waitingForPlayers || 'Waiting for more players to join...'}
          </Text>
          <Text style={[styles.joinInfoText, { color: theme.colors.textSecondary }]}>
            {currentMatch.users?.length === 1 
              ? uiStrings[systemLang].needMorePlayers || 'Need at least one more player to start'
              : uiStrings[systemLang].gameStartsWith4 || 'Game will start automatically with 4 players'}
          </Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        {showStartButton && (
          <Pressable
            style={[styles.startButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleStartGame}
          >
            <MaterialIcons name="play-arrow" size={24} color="#fff" />
            <Text style={styles.startButtonText}>
              {uiStrings[systemLang].startGame || 'Start Game'}
            </Text>
          </Pressable>
        )}
        
        <Pressable
          style={[styles.leaveButton, { backgroundColor: theme.colors.error }]}
          onPress={handleLeaveMatch}
        >
          <MaterialIcons name="exit-to-app" size={20} color="#fff" />
          <Text style={styles.leaveButtonText}>
            {uiStrings[systemLang].leaveMatch || 'Leave Match'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

// Helper function to get color for player avatars
const getPlayerColor = (index) => {
  const colors = ['#3498db', '#e74c3c', '#f1c40f', '#2ecc71'];
  return colors[index % colors.length];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
  },
  playersContainer: {
    flex: 1,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  playersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  playersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  refreshButton: {
    padding: 5,
  },
  refreshIndicator: {
    marginBottom: 10,
  },
  playerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginVertical: 4,
    borderRadius: 8,
  },
  playerDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  playerInitial: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  playerName: {
    fontSize: 16,
    fontWeight: '500',
  },
  hostBadge: {
    backgroundColor: '#f1c40f',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  hostBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic',
  },
  joinInfo: {
    marginTop: 15,
    padding: 10,
  },
  joinInfoText: {
    textAlign: 'center',
    marginBottom: 5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
    flex: 0.7,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  leaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 10,
    justifyContent: 'center',
  },
  leaveButtonText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 5,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default WaitingRoom;