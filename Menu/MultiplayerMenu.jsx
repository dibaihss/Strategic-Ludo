import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import { uiStrings } from '../assets/shared/hardCodedData.js';

const MatchListPage = ({ navigation }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  const theme = useSelector(state => state.theme.current);
  const systemLang = useSelector(state => state.language.systemLang);
  const userId = useSelector(state => state.game.userId); // Assuming you store userId in Redux
  
  // Fetch matches from API
  const fetchMatches = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await fetch('http://localhost:8080/api/sessions');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setMatches(data);
    } catch (error) {
      console.error('Error fetching matches:', error);
      setError('Failed to load matches. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchMatches();
  };
  
  // Load matches when component mounts
  useEffect(() => {
    fetchMatches();
  }, []);
  
  // Handle match join
  const handleJoinMatch = async (matchId) => {
    try {
      setLoading(true);
      
      // Call API to join match
      const response = await fetch(`http://localhost:8080/api/sessions/${matchId}/users/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to join match. Status: ${response.status}`);
      }
      
      // Navigate to game screen with match ID
      navigation.navigate('Game', { mode: 'multiplayer', matchId });
      
    } catch (error) {
      console.error('Error joining match:', error);
      Alert.alert(
        uiStrings[systemLang].error || 'Error',
        error.message || 'Failed to join match'
      );
    } finally {
      setLoading(false);
    }
  };
  
  // Handle create new match
  const handleCreateMatch = async () => {
    try {
      setLoading(true);
      
      // Call API to create a new match
      const response = await fetch('http://localhost:8080/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `Game Room ${Math.floor(Math.random() * 1000)}`,
          status: 'waiting'
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create match. Status: ${response.status}`);
      }
      
      const newMatch = await response.json();
      
      // Auto-join the match you just created
      await fetch(`http://localhost:8080/api/sessions/${newMatch.id}/users/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // Navigate to game screen with the new match ID
      navigation.navigate('Game', { mode: 'multiplayer', matchId: newMatch.id });
      
    } catch (error) {
      console.error('Error creating match:', error);
      Alert.alert(
        uiStrings[systemLang].error || 'Error',
        error.message || 'Failed to create match'
      );
    } finally {
      setLoading(false);
    }
  };
  
  // Render each match item
  const renderMatchItem = ({ item }) => (
    <Pressable 
      style={[styles.matchItem, { backgroundColor: theme.colors.card }]}
      onPress={() => handleJoinMatch(item.id)}
    >
      <View style={styles.matchInfo}>
        <Text style={[styles.matchTitle, { color: theme.colors.text }]}>
          {item.name}
        </Text>
        <Text style={[styles.matchStatus, { color: theme.colors.textSecondary }]}>
          {uiStrings[systemLang][item.status] || item.status}
        </Text>
      </View>
      
      <View style={styles.matchPlayers}>
        <Text style={[styles.playersCount, { color: theme.colors.textSecondary }]}>
          {item.users?.length || 0}/4
        </Text>
        <MaterialIcons 
          name="arrow-forward" 
          size={20} 
          color={theme.colors.primary} 
        />
      </View>
    </Pressable>
  );
  
  // Loading indicator
  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          {uiStrings[systemLang].loadingMatches || 'Loading matches...'}
        </Text>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: "white" }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.primary} />
        </Pressable>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {uiStrings[systemLang].availableMatches || 'Available Matches'}
        </Text>
      </View>
      
      {/* Error message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable 
            style={styles.retryButton}
            onPress={fetchMatches}
          >
            <Text style={styles.retryText}>
              {uiStrings[systemLang].retry || 'Retry'}
            </Text>
          </Pressable>
        </View>
      )}
      
      {/* Match list */}
      <FlatList
        data={matches}
        renderItem={renderMatchItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          !loading && !error ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="sports-esports" size={60} color={theme.colors.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                {uiStrings[systemLang].noMatches || 'No matches available'}
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
                {uiStrings[systemLang].createNewMatch || 'Create a new match below'}
              </Text>
            </View>
          ) : null
        }
      />
      
      {/* Create match button */}
      <View style={styles.footer}>
        <Pressable 
          style={[styles.createButton, { backgroundColor: theme.colors.button }]}
          onPress={handleCreateMatch}
        >
          <MaterialIcons name="add" size={24} color={theme.colors.buttonText} />
          <Text style={[styles.createButtonText, { color: theme.colors.buttonText }]}>
            {uiStrings[systemLang].createMatch || 'Create New Match'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 20,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  matchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  matchInfo: {
    flex: 1,
  },
  matchTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  matchStatus: {
    fontSize: 14,
  },
  matchPlayers: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playersCount: {
    marginRight: 8,
    fontSize: 14,
  },
  footer: {
    padding: 16,
    paddingBottom: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  createButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: 12,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },
  retryText: {
    color: '#333',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default MatchListPage;