import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  Image, 
  SafeAreaView 
} from 'react-native';
import { useSelector } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import { uiStrings } from '../assets/shared/hardCodedData.js';

const HomePage = ({ onStartLocalGame, onStartMultiplayerGame, onLogout }) => {

  const theme = useSelector(state => state.theme.current);
  const systemLang = useSelector(state => state.language.systemLang);
  const user = useSelector(state => state.auth.user);

  const handleLogout = () => {
    onLogout();
  };

  // Get appropriate user display name
  const displayName = user?.name || user?.email || user?.username || "User";
  const isGuest = user?.isGuest || false;

  return (
    <SafeAreaView testID="home-screen" style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
      
      {/* User Profile Section */}
      <View style={[styles.profileCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1 }]}>
        <View style={styles.profileHeader}>
          <View style={styles.profileInfo}>
            <Text style={[styles.welcomeText, { color: theme.colors.textSecondary }]}>
              {uiStrings[systemLang].welcome}
            </Text>
            <Text style={[styles.username, { color: theme.colors.text }]}>
              {displayName}
              {isGuest && (
                <Text style={[styles.guestBadge, { color: theme.colors.accent }]}>
                  {" "}({uiStrings[systemLang].guest})
                </Text>
              )}
            </Text>
          </View>
          
          <Pressable 
            testID="home-logout-button"
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <MaterialIcons name="logout" size={24} color={theme.colors.accent} />
          </Pressable>
        </View>
      </View>
      
      {/* User Dashboard */}
      <View style={[styles.dashboard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1 }]}>
        <Text style={[styles.dashboardTitle, { color: theme.colors.text }]}>
          {uiStrings[systemLang].dashboard}
        </Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <MaterialIcons name="emoji-events" size={28} color={theme.colors.accent} />
            <Text style={[styles.statValue, { color: theme.colors.text }]}>5</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              {uiStrings[systemLang].wins}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <MaterialIcons name="history" size={28} color={theme.colors.accent} />
            <Text style={[styles.statValue, { color: theme.colors.text }]}>12</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              {uiStrings[systemLang].gamesPlayed}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <MaterialIcons name="star" size={28} color={theme.colors.accent} />
            <Text style={[styles.statValue, { color: theme.colors.text }]}>1024</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              {uiStrings[systemLang].points}
            </Text>
          </View>
        </View>
      </View>
      
      {/* Game Mode Buttons */}
      <View style={styles.buttonsContainer}>
        <Pressable
          testID="home-play-local-button"
          style={[styles.button, { backgroundColor: theme.colors.accent, borderColor: theme.colors.border, borderWidth: 1 }]}
          onPress={onStartLocalGame}
        >
          <MaterialIcons name="people" size={28} color={theme.colors.buttonText} />
          <Text style={[styles.buttonText, { color: theme.colors.buttonText }]}>
            {uiStrings[systemLang].playLocal}
          </Text>
        </Pressable>
        
        <Pressable
          testID="home-play-multiplayer-button"
          style={[
            styles.button, 
            { 
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
              borderWidth: 1,
            }
          ]}
          onPress={onStartMultiplayerGame}
        >
          <MaterialIcons name="public" size={28} color={theme.colors.text} />
          <Text style={[styles.buttonText, { color: theme.colors.text }]}>
            {uiStrings[systemLang].playMultiplayer}
          </Text>
        </Pressable>
      </View>
      
      {/* Version Footer */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
          {uiStrings[systemLang].developmentPhase}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  profileCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    marginBottom: 8,
  },
  username: {
    fontSize: 24,
    fontWeight: '700',
  },
  guestBadge: {
    fontStyle: 'italic',
    fontWeight: '500',
  },
  logoutButton: {
    padding: 12,
    borderRadius: 24,
  },
  dashboard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  dashboardTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
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
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  buttonsContainer: {
    gap: 16,
    marginBottom: 48,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
