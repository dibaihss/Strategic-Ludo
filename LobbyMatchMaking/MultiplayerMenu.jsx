import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import { uiStrings } from '../assets/shared/hardCodedData.js';
import { clearAuth, logout, setCurrentUserPage } from '../assets/store/authSlice.jsx';
import { fetchMatches, createMatch, joinMatch, fetchCurrentMatch, updateMatch, isCreateMatchReauthError } from '../assets/store/sessionSlice.jsx';
import { setIsOnline } from '../assets/store/gameSlice.jsx';
import { createMultiplayerMenuStyles } from './MultiplayerMenu.styles.js';


const MatchListPage = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);

  const dispatch = useDispatch();
  const theme = useSelector(state => state.theme.current);
  const styles = useMemo(() => createMultiplayerMenuStyles(theme), [theme]);
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
      }
    };
  }, []);

  const fetchCurrentMatchData = (id) => {
    dispatch(fetchCurrentMatch(id))
      .unwrap() // Extract the Promise from the Thunk
      .then(result => {
        // Update the match data in the store
        dispatch(updateMatch(result));
      })
      .catch(error => {
        console.error("Error refreshing match data:", error);
      })
      .finally(() => {
      });
  }

  const redirectToLoginAfterAccountRemoval = () => {
    dispatch(clearAuth());
    dispatch(setIsOnline(false));
    navigation.navigate('Login');
    dispatch(logout());
  };


  const handleJoinMatch = (matchId) => {
    dispatch(joinMatch(matchId)).unwrap()
      .then(() => {
        fetchCurrentMatchData(matchId)
        dispatch(setIsOnline(true));
        navigation.navigate('WaitingRoom', { join: true });
      })
      .catch(err => {
        Alert.alert(
          uiStrings[systemLang].error || 'Error',
          err || 'Failed to join match'
        );
      });
  };

  const filteredMatches = matches.filter(match => match.status !== 'in_progress');

  // Handle create new match
  const handleCreateMatch = () => {
    dispatch(createMatch()).unwrap()
      .then((createdMatch) => {
        dispatch(setIsOnline(true));
        navigation.navigate('WaitingRoom', { join: false });
        // Clear any potentially existing timeout before setting a new one
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // Store the new timeout ID in the ref
        timeoutRef.current = setTimeout(() => {
          fetchCurrentMatchData(createdMatch.id);
          timeoutRef.current = null; // Clear the ref after execution
        }, 1000); // Fetch match data after 1 second
      })

      .catch(err => {
        if (isCreateMatchReauthError(err)) {
          redirectToLoginAfterAccountRemoval();
          return;
        }

        Alert.alert(
          uiStrings[systemLang].error || 'Error',
          typeof err === 'string' ? err : err?.message || 'Failed to create match'
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
          testID="match-list-back-button"
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

export default MatchListPage;
