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
import { fetchMatches, createMatch, joinMatch } from '../assets/store/authSlice.jsx';

const MatchListPage = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  
  const dispatch = useDispatch();
  const theme = useSelector(state => state.theme.current);
  const systemLang = useSelector(state => state.language.systemLang);
  const matches = useSelector(state => state.auth.matches);
  const loading = useSelector(state => state.auth.loading);
  const error = useSelector(state => state.auth.error);
  
  // Load matches when component mounts
  useEffect(() => {
    dispatch(fetchMatches());
  }, [dispatch]);
  
  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    dispatch(fetchMatches()).finally(() => setRefreshing(false));
  };
  
  // Handle match join
  const handleJoinMatch = (matchId) => {
    dispatch(joinMatch(matchId)).unwrap()
      .then(() => {
        navigation.navigate('Game', { mode: 'multiplayer' });
      })
      .catch(err => {
        Alert.alert(
          uiStrings[systemLang].error || 'Error',
          err || 'Failed to join match'
        );
      });
  };
  
  // Handle create new match
  const handleCreateMatch = () => {
    dispatch(createMatch()).unwrap()
      .then(() => {
        navigation.navigate('Game', { mode: 'multiplayer' });
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
  if (loading && !refreshing && matches.length === 0) {
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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
          <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
          <Pressable 
            style={[styles.retryButton, { backgroundColor: theme.colors.button }]}
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
          style={[
            styles.createButton, 
            { 
              backgroundColor: loading ? theme.colors.disabled : theme.colors.button,
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
    marginBottom: 12,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryText: {
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