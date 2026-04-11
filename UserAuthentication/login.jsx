import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  TextInput,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createLoginStyles } from "./login.styles.js";
import { useDispatch, useSelector } from "react-redux";
import { MaterialIcons } from "@expo/vector-icons";
import { uiStrings } from "../assets/shared/hardCodedData.js";
import { loginGuest } from "../assets/store/authSlice.jsx";
import { setIsOnline } from "../assets/store/gameSlice.jsx";
import Toast from "react-native-toast-message";

const LoginPage = ({ navigation }) => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.current);
  const styles = useMemo(() => createLoginStyles(theme), [theme]);
  const systemLang = useSelector((state) => state.language.systemLang);
  const authError = useSelector((state) => state.auth.error);
  const loading = useSelector((state) => state.auth.loading);
  const { width, height } = useWindowDimensions();
  const isSmallScreen = width < 375 || height < 667;
  const [showGuestNameModal, setShowGuestNameModal] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestNameError, setGuestNameError] = useState("");

  const guestNameTitle = uiStrings[systemLang].guestNameTitle || "Choose your guest name";
  const guestNameMessage =
    uiStrings[systemLang].guestNameMessage || "Enter the name you want to use before joining as a guest.";
  const guestNamePlaceholder = uiStrings[systemLang].guestNamePlaceholder || "Your name";
  const guestNameConfirm = uiStrings[systemLang].guestNameConfirm || "Continue";
  const guestNameRequired =
    uiStrings[systemLang].guestNameRequired || "Please enter your name to continue.";

  const openGuestNameModal = () => {
    setGuestNameError("");
    setShowGuestNameModal(true);
  };

  const closeGuestNameModal = () => {
    if (loading) return;
    setShowGuestNameModal(false);
    setGuestNameError("");
  };

  const handleGuestLogin = () => {
    const trimmedGuestName = guestName.trim();

    if (!trimmedGuestName) {
      setGuestNameError(guestNameRequired);
      return;
    }

    console.log("Logging in as guest", { name: trimmedGuestName });
    setGuestNameError("");
    dispatch(setIsOnline(true));
    dispatch(loginGuest(trimmedGuestName))
      .unwrap()
      .then((result) => {
        console.log("Guest login successful:", result);
        setShowGuestNameModal(false);
        setGuestName("");
        Toast.show({
          type: "success",
          text1: uiStrings[systemLang].success,
          text2: uiStrings[systemLang].guestLoginSuccess,
          position: "bottom",
        });
      })
      .catch((error) => {
        console.error("Guest login failed:", error);
        Toast.show({
          type: "error",
          text1: uiStrings[systemLang].error,
          text2: error || uiStrings[systemLang].guestLoginFailed,
          position: "bottom",
        });
      });
  };

  const goDirectlyToGame = () => {
    navigation.navigate("Home");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={[styles.content, isSmallScreen && styles.contentCompact]}>
          <View style={styles.header}>
            <View style={styles.logoShell}>
              <Image
                source={require("../assets/iconPWA.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{uiStrings[systemLang].guest}</Text>
            </View>
            <Text style={styles.title}>Strategic Ludo</Text>
            <Text style={styles.subtitle}>
              {`${uiStrings[systemLang].continueAsGuest} ${uiStrings[systemLang].or} ${uiStrings[systemLang].playOffline}`}
            </Text>
          </View>

          <View style={styles.actionsCard}>
            <Pressable
              testID="login-guest-button"
              style={[
                styles.actionButton,
                styles.primaryAction,
                isSmallScreen && styles.actionButtonCompact,
                loading && styles.actionButtonDisabled,
              ]}
              onPress={openGuestNameModal}
              disabled={loading}
            >
              <View style={styles.actionIconWrap}>
                {loading ? (
                  <ActivityIndicator color={theme.colors.buttonText} />
                ) : (
                  <MaterialIcons
                    name="person-outline"
                    size={24}
                    color={theme.colors.buttonText}
                  />
                )}
              </View>
              <Text style={[styles.actionText, styles.primaryActionText]}>
                {uiStrings[systemLang].continueAsGuest}
              </Text>
              <MaterialIcons
                name="arrow-forward-ios"
                size={18}
                color={theme.colors.buttonText}
              />
            </Pressable>

            <Pressable
              testID="login-offline-button"
              style={[
                styles.actionButton,
                styles.secondaryAction,
                isSmallScreen && styles.actionButtonCompact,
              ]}
              onPress={goDirectlyToGame}
            >
              <View style={styles.secondaryActionIconWrap}>
                <MaterialIcons
                  name="sports-esports"
                  size={24}
                  color={theme.colors.success}
                />
              </View>
              <Text style={[styles.actionText, styles.secondaryActionText]}>
                {uiStrings[systemLang].playOffline}
              </Text>
              <MaterialIcons
                name="arrow-forward-ios"
                size={18}
                color={theme.colors.success}
              />
            </Pressable>

            {authError ? (
              <Text style={styles.errorText}>{authError}</Text>
            ) : null}
          </View>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={showGuestNameModal}
        transparent
        animationType="fade"
        onRequestClose={closeGuestNameModal}
      >
        <View style={styles.modalOverlay} testID="guest-name-modal">
          <View style={styles.modalCard}>
            <View style={styles.modalIconWrap}>
              <MaterialIcons
                name="person-outline"
                size={28}
                color={theme.colors.buttonText}
              />
            </View>
            <Text style={styles.modalTitle}>{guestNameTitle}</Text>
            <Text style={styles.modalMessage}>{guestNameMessage}</Text>

            <View style={styles.inputWrap}>
              <TextInput
                testID="guest-name-input"
                style={styles.input}
                placeholder={guestNamePlaceholder}
                placeholderTextColor={theme.colors.textSecondary}
                value={guestName}
                onChangeText={(value) => {
                  setGuestName(value);
                  if (guestNameError) {
                    setGuestNameError("");
                  }
                }}
                editable={!loading}
                autoCapitalize="words"
                autoFocus
                maxLength={24}
                returnKeyType="done"
                onSubmitEditing={handleGuestLogin}
              />
            </View>

            {guestNameError ? <Text style={styles.errorText}>{guestNameError}</Text> : null}
            {!guestNameError && authError ? <Text style={styles.errorText}>{authError}</Text> : null}

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={closeGuestNameModal}
                disabled={loading}
              >
                <Text style={styles.modalButtonSecondaryText}>{uiStrings[systemLang].cancel}</Text>
              </Pressable>

              <Pressable
                testID="guest-name-confirm-button"
                style={[
                  styles.modalButton,
                  styles.modalButtonPrimary,
                  loading && styles.actionButtonDisabled,
                ]}
                onPress={handleGuestLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={theme.colors.buttonText} />
                ) : (
                  <Text style={styles.modalButtonPrimaryText}>{guestNameConfirm}</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      <Toast />
    </SafeAreaView>
  );
};

export default LoginPage;
