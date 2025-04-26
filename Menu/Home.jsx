import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  Image, 
  Dimensions, 
  SafeAreaView 
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import { uiStrings } from '../assets/shared/hardCodedData.js';
import { useWebSocket } from '../assets/shared/SimpleWebSocketConnection.jsx';

const HomePage = ({ onStartLocalGame, onStartMultiplayerGame }) => {
  const dispatch = useDispatch();
  const theme = useSelector(state => state.theme.current);
  const systemLang = useSelector(state => state.language.systemLang);
  const { connected } = useWebSocket();
  
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  const isSmallScreen = windowWidth < 375 || windowHeight < 667;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: "rgb(255 255 255)" }]}>
      {/* Logo and Title */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Strategic Ludo
        </Text>
        <Image 
          source={require('../assets/iconPWA.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      
      {/* User Dashboard */}
      <View style={[styles.dashboard, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.dashboardTitle, { color: theme.colors.text }]}>
          {uiStrings[systemLang].dashboard || 'Dashboard'}
        </Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <MaterialIcons name="emoji-events" size={24} color={theme.colors.primary} />
            <Text style={[styles.statValue, { color: theme.colors.text }]}>5</Text>
            <Text style={[styles.statLabel, { color: theme.colors.text }]}>
              {uiStrings[systemLang].wins || 'Wins'}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <MaterialIcons name="history" size={24} color={theme.colors.primary} />
            <Text style={[styles.statValue, { color: theme.colors.text }]}>12</Text>
            <Text style={[styles.statLabel, { color: theme.colors.text }]}>
              {uiStrings[systemLang].gamesPlayed || 'Games Played'}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <MaterialIcons name="star" size={24} color={theme.colors.primary} />
            <Text style={[styles.statValue, { color: theme.colors.text }]}>1024</Text>
            <Text style={[styles.statLabel, { color: theme.colors.text }]}>
              {uiStrings[systemLang].points || 'Points'}
            </Text>
          </View>
        </View>
      </View>
      
      {/* Game Mode Buttons */}
      <View style={styles.buttonsContainer}>
        <Pressable
          style={[styles.button, { backgroundColor: theme.colors.button }]}
          onPress={onStartLocalGame}
        >
          <MaterialIcons name="people" size={28} color={theme.colors.buttonText} />
          <Text style={[styles.buttonText, { color: theme.colors.buttonText }]}>
            {uiStrings[systemLang].playLocal || 'Play Local'}
          </Text>
        </Pressable>
        
        <Pressable
          style={[
            styles.button, 
            { 
              backgroundColor: connected ? theme.colors.button : theme.colors.disabled,
              opacity: connected ? 1 : 0.7 
            }
          ]}
          onPress={onStartMultiplayerGame}
          disabled={!connected}
        >
          <MaterialIcons name="public" size={28} color={theme.colors.buttonText} />
          <Text style={[styles.buttonText, { color: theme.colors.buttonText }]}>
            {uiStrings[systemLang].playMultiplayer || 'Multiplayer'}
          </Text>
          {!connected && (
            <Text style={[styles.connectionWarning, { color: theme.colors.error }]}>
              {uiStrings[systemLang].serverOffline || 'Server offline'}
            </Text>
          )}
        </Pressable>
      </View>
      
      {/* Version Footer */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
          v1.0.0
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  dashboard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  dashboardTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 14,
  },
  buttonsContainer: {
    gap: 15,
    marginBottom: 40,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  connectionWarning: {
    position: 'absolute',
    bottom: -20,
    fontSize: 12,
    fontStyle: 'italic',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
  },
});

export default HomePage;