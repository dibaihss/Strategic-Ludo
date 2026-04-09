import React, { useMemo } from 'react';
import { 
  View, 
  Text, 
  Pressable, 
  Image, 
  SafeAreaView 
} from 'react-native';
import { useSelector } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import { uiStrings } from '../assets/shared/hardCodedData.js';
import { createHomeStyles } from './Home.styles.js';

const HomePage = ({ onStartLocalGame, onStartMultiplayerGame, onLogout }) => {

  const theme = useSelector(state => state.theme.current);
  const systemLang = useSelector(state => state.language.systemLang);
  const user = useSelector(state => state.auth.user);
  const styles = useMemo(() => createHomeStyles(theme), [theme]);

  const handleLogout = () => {
    onLogout();
  };

  // Get appropriate user display name
  const displayName = user?.name || user?.email || user?.username || "User";
  const isGuest = user?.isGuest || false;

  return (
    <SafeAreaView testID="home-screen" style={styles.container}>
      {/* Logo and Title */}
      <View style={styles.header}>
        <Text style={styles.title}>
          Strategic Ludo
        </Text>
        <Image 
          source={require('../assets/iconPWA.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      
      {/* User Profile Section */}
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.profileInfo}>
            <Text style={styles.welcomeText}>
              {uiStrings[systemLang].welcome}
            </Text>
            <Text style={styles.username}>
              {displayName}
              {isGuest && (
                <Text style={styles.guestBadge}>
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
      <View style={styles.dashboard}>
        <Text style={styles.dashboardTitle}>
          {uiStrings[systemLang].dashboard}
        </Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <MaterialIcons name="emoji-events" size={28} color={theme.colors.accent} />
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>
              {uiStrings[systemLang].wins}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <MaterialIcons name="history" size={28} color={theme.colors.accent} />
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>
              {uiStrings[systemLang].gamesPlayed}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <MaterialIcons name="star" size={28} color={theme.colors.accent} />
            <Text style={styles.statValue}>1024</Text>
            <Text style={styles.statLabel}>
              {uiStrings[systemLang].points}
            </Text>
          </View>
        </View>
      </View>
      
      {/* Game Mode Buttons */}
      <View style={styles.buttonsContainer}>
        <Pressable
          testID="home-play-local-button"
          style={[styles.button, styles.buttonPrimary]}
          onPress={onStartLocalGame}
        >
          <MaterialIcons name="people" size={28} color={theme.colors.buttonText} />
          <Text style={[styles.buttonText, styles.buttonTextPrimary]}>
            {uiStrings[systemLang].playLocal}
          </Text>
        </Pressable>
        
        <Pressable
          testID="home-play-multiplayer-button"
          style={[styles.button, styles.buttonSecondary]}
          onPress={onStartMultiplayerGame}
        >
          <MaterialIcons name="public" size={28} color={theme.colors.text} />
          <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
            {uiStrings[systemLang].playMultiplayer}
          </Text>
        </Pressable>
      </View>
      
      {/* Version Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {uiStrings[systemLang].developmentPhase}
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default HomePage;
