import React, { useState, useEffect, useRef } from 'react';
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
import { setCurrentUserPage } from '../assets/store/authSlice.jsx';
import { fetchMatches, createMatch, joinMatch, fetchCurrentMatch, updateMatch } from '../assets/store/sessionSlice.jsx';
import { setOnlineModus } from '../assets/store/gameSlice.jsx';


const MatchListPage = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);

  const dispatch = useDispatch();
  const theme = useSelector(state => state.theme.current);
  const systemLang = useSelector(state => state.language.systemLang);
  const matches = useSelector(state => state.session.matches);
  const loading = useSelector(state => state.session.loading);
  const error = useSelector(state => state.session.error);
  const timeoutRef = useRef(null);

  // Load matches when component mounts
  useEffect(() => {
    setCurrentUserPage("MatchList")
    dispatch(fetchMatches());
  }, [dispatch]);

  // Handle pull-to-refresh and button press
  const onRefresh = () => {
    setRefreshing(true);
    dispatch(fetchMatches()).finally(() => setRefreshing(false));
  };
  
  useEffect(() => {
    // Return the cleanup function that runs when the component unmounts
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        console.log("Cleared createMatch fetch timeout on unmount.");
      }
    };
  }, []);

  const fetchCurrentMatchData = (id) => {
    console.log("fetchCurrentMatch", id)
    dispatch(fetchCurrentMatch(id))
      .unwrap() // Extract the Promise from the Thunk
      .then(result => {
        console.log("Match data fetched:", result);
        // Update the match data in the store
        dispatch(updateMatch(result));
      })
      .catch(error => {
        console.error("Error refreshing match data:", error);
      })
      .finally(() => {
        console.log("Refresh operation complete");
      });
  }


  const handleJoinMatch = (matchId) => {
    dispatch(joinMatch(matchId)).unwrap()
      .then(() => {
        fetchCurrentMatchData(matchId)
        dispatch(setOnlineModus(true));
        navigation.navigate('WaitingRoom', { join: true });
      })
      .catch(err => {
        Alert.alert(
          uiStrings[systemLang].error || 'Error',
          err || 'Failed to join match'
        );
      });
  };

  const filteredMatches = matches.filter(match => match.status !== 'started');

  // Handle create new match
  const handleCreateMatch = () => {
    dispatch(createMatch()).unwrap()
      .then((createdMatch) => {
        dispatch(setOnlineModus(true));
        navigation.navigate('WaitingRoom', { join: false });
        // Clear any potentially existing timeout before setting a new one
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // Store the new timeout ID in the ref
        timeoutRef.current = setTimeout(() => {
          console.log("Executing delayed fetch for created match:", createdMatch.id);
          fetchCurrentMatchData(createdMatch.id);
          timeoutRef.current = null; // Clear the ref after execution
        }, 1000); // Fetch match data after 1 second
      })

      .catch(err => {
        Alert.alert(
          uiStrings[systemLang].error || 'Error',
          err || 'Failed to create match'
        );
      });
  };
  // Render each match item
  const renderMatchItem = ({ item }) => (
    <Pressable
      testID={`match-item-${item.id}`}
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
  if (loading && !refreshing && filteredMatches.length === 0) {
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
    <View testID="match-list-screen" style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.accent} />
        </Pressable>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {uiStrings[systemLang].availableMatches || 'Available Matches'}
        </Text>
        {/* Add Refresh Button Here */}
        <Pressable
          testID="match-list-refresh-button"
          style={styles.refreshButtonHeader} // Add a new style for positioning
          onPress={onRefresh}
          disabled={refreshing || loading}
        >
          <MaterialIcons 
            name="refresh" 
            size={24} 
            color={(refreshing || loading) ? theme.colors.disabled : theme.colors.accent} 
          />
        </Pressable>
      </View>

      {/* Error message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
          <Pressable
            style={[styles.retryButton, { backgroundColor: theme.colors.accent, borderColor: theme.colors.border, borderWidth: 1 }]}
            onPress={() => dispatch(fetchMatches())}
          >
            <Text style={[styles.retryText, { color: theme.colors.buttonText }]}>
              {uiStrings[systemLang].retry || 'Retry'}
            </Text>
          </Pressable>
        </View>
      )}

      {/* Match list */}
      <FlatList
        data={filteredMatches}
        renderItem={renderMatchItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.accent]}
            tintColor={theme.colors.accent}
          />
        }
        ListEmptyComponent={
          !loading && !error ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="sports-esports" size={72} color={theme.colors.textSecondary} />
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
          testID="match-list-create-button"
          style={[
            styles.createButton,
            {
              backgroundColor: loading ? theme.colors.disabled : theme.colors.accent,
              borderColor: theme.colors.border,
              borderWidth: 1,
              opacity: loading ? 0.7 : 1
            }
          ]}
          onPress={handleCreateMatch}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.buttonText} />
          ) : (
            <>
              <MaterialIcons name="add" size={24} color={theme.colors.buttonText} />
              <Text style={[styles.createButtonText, { color: theme.colors.buttonText }]}>
                {uiStrings[systemLang].createMatch || 'Create New Match'}
              </Text>
            </>
          )}
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
    padding: 24,
    paddingTop: 32,
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  refreshButtonHeader: {
    padding: 8,
  },
  listContent: {
    padding: 24,
    flexGrow: 1,
  },
  matchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  matchInfo: {
    flex: 1,
  },
  matchTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  matchStatus: {
    fontSize: 14,
  },
  matchPlayers: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playersCount: {
    marginRight: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    padding: 24,
    paddingBottom: 32,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    padding: 24,
    alignItems: 'center',
  },
  errorText: {
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 16,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  retryText: {
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
});

export default MatchListPage;
