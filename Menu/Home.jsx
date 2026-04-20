import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  Pressable,
  Image,
  Modal,
  ScrollView,
  useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import { uiStrings } from '../assets/shared/hardCodedData.js';
import { createHomeStyles } from './Home.styles.js';

const HomePage = ({
  onStartMultiplayerGame,
  onStartOffline,
  showOfflineOptions,
  onChooseOfflineMode,
  onCancelOfflineChoice,
  showBotDifficultyPrompt,
  onChooseBotDifficulty,
  onCancelBotDifficultyPrompt,
  showLoginPrompt,
  onCancelLoginPrompt,
  onConfirmLoginPrompt,
  onLogout,
}) => {

  const theme = useSelector(state => state.theme.current);
  const systemLang = useSelector(state => state.language.systemLang);
  const user = useSelector(state => state.auth.user);
  const { width, height } = useWindowDimensions();

  const layout = useMemo(() => {
    if (height < 760 || width < 360) {
      return {
        horizontalPadding: 16,
        topPadding: 20,
        bottomPadding: 24,
        sectionGap: 16,
        headerMarginBottom: 12,
        logoSize: 82,
        titleFontSize: 28,
        titleMarginBottom: 10,
        cardPadding: 16,
        cardMarginBottom: 12,
        welcomeFontSize: 14,
        usernameFontSize: 20,
        logoutPadding: 8,
        dashboardMarginBottom: 12,
        dashboardTitleFontSize: 18,
        dashboardTitleMarginBottom: 14,
        statsGap: 6,
        statValueFontSize: 22,
        statLabelFontSize: 12,
        buttonsGap: 12,
        buttonsMarginBottom: 12,
        buttonVerticalPadding: 14,
        buttonHorizontalPadding: 16,
        buttonGap: 8,
        buttonTextFontSize: 16,
        footerPaddingTop: 8,
        footerFontSize: 11,
      };
    }

    if (height < 920 || width < 430) {
      return {
        horizontalPadding: 20,
        topPadding: 28,
        bottomPadding: 32,
        sectionGap: 20,
        headerMarginBottom: 18,
        logoSize: 104,
        titleFontSize: 32,
        titleMarginBottom: 12,
        cardPadding: 20,
        cardMarginBottom: 18,
        welcomeFontSize: 15,
        usernameFontSize: 22,
        logoutPadding: 10,
        dashboardMarginBottom: 20,
        dashboardTitleFontSize: 20,
        dashboardTitleMarginBottom: 18,
        statsGap: 10,
        statValueFontSize: 24,
        statLabelFontSize: 13,
        buttonsGap: 14,
        buttonsMarginBottom: 20,
        buttonVerticalPadding: 17,
        buttonHorizontalPadding: 20,
        buttonGap: 10,
        buttonTextFontSize: 17,
        footerPaddingTop: 10,
        footerFontSize: 12,
      };
    }

    return {
      horizontalPadding: 24,
      topPadding: 40,
      bottomPadding: 40,
      sectionGap: 24,
      headerMarginBottom: 24,
      logoSize: 120,
      titleFontSize: 36,
      titleMarginBottom: 16,
      cardPadding: 24,
      cardMarginBottom: 24,
      welcomeFontSize: 16,
      usernameFontSize: 24,
      logoutPadding: 12,
      dashboardMarginBottom: 24,
      dashboardTitleFontSize: 22,
      dashboardTitleMarginBottom: 20,
      statsGap: 12,
      statValueFontSize: 28,
      statLabelFontSize: 14,
      buttonsGap: 16,
      buttonsMarginBottom: 28,
      buttonVerticalPadding: 20,
      buttonHorizontalPadding: 24,
      buttonGap: 12,
      buttonTextFontSize: 18,
      footerPaddingTop: 12,
      footerFontSize: 12,
    };
  }, [height, width]);

  const styles = useMemo(() => createHomeStyles(theme, layout), [theme, layout]);

  const handleLogout = () => {
    onLogout();
  };

  // Get appropriate user display name
  const displayName = user?.name || user?.email || user?.username || "User";
  const isGuest = user?.isGuest || false;

  return (
    <SafeAreaView testID="home-screen" style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
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
          testID="home-play-offline-button"
          style={[styles.button, styles.buttonPrimary]}
          onPress={onStartOffline}
        >
          <MaterialIcons name="devices" size={28} color={theme.colors.text} />
          <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
            {uiStrings[systemLang].playOffline}
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
      </ScrollView>

      {/* Offline options modal */}
      <Modal
        visible={showOfflineOptions}
        transparent={true}
        animationType="fade"
        onRequestClose={onCancelOfflineChoice}
      >
        <View style={styles.modalOverlay} testID="offline-choice-modal">
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{uiStrings[systemLang].offlineChoiceTitle}</Text>
            <Text style={styles.modalMessage}>{uiStrings[systemLang].offlineChoiceMessage}</Text>
            <View style={styles.modalButtonsRow}>
              <Pressable
                testID="offline-choice-bot-button"
                style={[styles.button, styles.optionButton]}
                onPress={() => onChooseOfflineMode('bot')}
              >
                <MaterialIcons name="android" size={24} color={theme.colors.buttonText} />
                <Text style={styles.optionButtonText}>{uiStrings[systemLang].playVsBot}</Text>
              </Pressable>
              <Pressable
                testID="offline-choice-local-button"
                style={[styles.button, styles.optionButton, { backgroundColor: theme.colors.accent }]}
                onPress={() => onChooseOfflineMode('local')}
              >
                <MaterialIcons name="group" size={24} color={theme.colors.buttonText} />
                <Text style={styles.optionButtonText}>{uiStrings[systemLang].playWithFamily}</Text>
              </Pressable>
            </View>
            <Pressable
              testID="offline-choice-cancel-button"
              style={[styles.button, styles.cancelButton]}
              onPress={onCancelOfflineChoice}
            >
              <Text style={styles.buttonTextSecondary}>{uiStrings[systemLang].cancel}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showBotDifficultyPrompt}
        transparent={true}
        animationType="fade"
        onRequestClose={onCancelBotDifficultyPrompt}
      >
        <View style={styles.modalOverlay} testID="bot-difficulty-modal">
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{uiStrings[systemLang].chooseBotDifficultyTitle}</Text>
            <Text style={styles.modalMessage}>{uiStrings[systemLang].chooseBotDifficultyMessage}</Text>
            <View style={styles.modalButtonsRow}>
              <Pressable
                testID="bot-difficulty-easy-button"
                style={[styles.button, styles.optionButton]}
                onPress={() => onChooseBotDifficulty('easy')}
              >
                <MaterialIcons name="sentiment-satisfied-alt" size={24} color={theme.colors.buttonText} />
                <Text style={styles.optionButtonText}>{uiStrings[systemLang].easy}</Text>
              </Pressable>
              <Pressable
                testID="bot-difficulty-normal-button"
                style={[styles.button, styles.optionButton, { backgroundColor: theme.colors.accent }]}
                onPress={() => onChooseBotDifficulty('normal')}
              >
                <MaterialIcons name="smart-toy" size={24} color={theme.colors.buttonText} />
                <Text style={styles.optionButtonText}>{uiStrings[systemLang].normal}</Text>
              </Pressable>
              <Pressable
                testID="bot-difficulty-hard-button"
                style={[styles.button, styles.optionButton, { backgroundColor: theme.colors.error }]}
                onPress={() => onChooseBotDifficulty('hard')}
              >
                <MaterialIcons name="bolt" size={24} color={theme.colors.buttonText} />
                <Text style={styles.optionButtonText}>{uiStrings[systemLang].hard}</Text>
              </Pressable>
            </View>
            <Pressable
              testID="bot-difficulty-cancel-button"
              style={[styles.button, styles.cancelButton]}
              onPress={onCancelBotDifficultyPrompt}
            >
              <Text style={styles.buttonTextSecondary}>{uiStrings[systemLang].cancel}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showLoginPrompt}
        transparent={true}
        animationType="fade"
        onRequestClose={onCancelLoginPrompt}
      >
        <View style={styles.modalOverlay} testID="login-required-modal">
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{uiStrings[systemLang].loginRequiredTitle}</Text>
            <Text style={styles.modalMessage}>{uiStrings[systemLang].loginRequiredMessage}</Text>
            <View style={styles.modalButtonsRow}>
              <Pressable
                testID="login-required-confirm-button"
                style={[styles.button, styles.optionButton, { backgroundColor: theme.colors.accent }]}
                onPress={onConfirmLoginPrompt}
              >
                <MaterialIcons name="login" size={24} color={theme.colors.buttonText} />
                <Text style={styles.optionButtonText}>{uiStrings[systemLang].login}</Text>
              </Pressable>
            </View>
            <Pressable
              testID="login-required-cancel-button"
              style={[styles.button, styles.cancelButton]}
              onPress={onCancelLoginPrompt}
            >
              <Text style={styles.buttonTextSecondary}>{uiStrings[systemLang].cancel}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

HomePage.propTypes = {
  onStartMultiplayerGame: PropTypes.func.isRequired,
  onStartOffline: PropTypes.func.isRequired,
  showOfflineOptions: PropTypes.bool.isRequired,
  onChooseOfflineMode: PropTypes.func.isRequired,
  onCancelOfflineChoice: PropTypes.func.isRequired,
  showBotDifficultyPrompt: PropTypes.bool.isRequired,
  onChooseBotDifficulty: PropTypes.func.isRequired,
  onCancelBotDifficultyPrompt: PropTypes.func.isRequired,
  showLoginPrompt: PropTypes.bool.isRequired,
  onCancelLoginPrompt: PropTypes.func.isRequired,
  onConfirmLoginPrompt: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
};

export default HomePage;
