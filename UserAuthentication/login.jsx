import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  SafeAreaView,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { createLoginStyles } from './login.styles.js';
import { useDispatch, useSelector } from "react-redux";
import { MaterialIcons } from "@expo/vector-icons";
import { uiStrings } from "../assets/shared/hardCodedData.js";
import {
  loginUser,
  loginGuest,
  setOfflineModus,
} from "../assets/store/authSlice.jsx";
import Toast from "react-native-toast-message";

const LoginPage = ({ navigation }) => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.current);
  const styles = useMemo(() => createLoginStyles(theme), [theme]);
  const systemLang = useSelector((state) => state.language.systemLang);
  const authError = useSelector((state) => state.auth.error);
  const loading = useSelector((state) => state.auth.loading);
  const offlineModus = useSelector((state) => state.auth.offlineModus);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;
  const isSmallScreen = windowWidth < 375 || windowHeight < 667;

  const handleLoginPress = () => {
    console.log("Registering user:", { email, password }); // Debugging line

    // Basic validation
    if (!email.trim() || !password.trim()) {
      Toast.show({
        type: "error",
        text1: uiStrings[systemLang].error,
        text2: uiStrings[systemLang].fillFields,
        position: "bottom",
      });
      return;
    }

    dispatch(
      loginUser({
        email,
        password,
      })
    )
      .unwrap()
      .then((result) => {
        console.log("Login successful:", result);
      })
      .catch((error) => {
        console.error("Login failed:", error);
      });
  };
  const handleGuestLogin = () => {
    console.log("Logging in as guest");
    dispatch(loginGuest())
      .unwrap()
      .then((result) => {
        console.log("Guest login successful:", result);
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

  const goToRegister = () => {
    navigation.navigate("Register");
  };

  const goDirectlyToGame = () => {
   dispatch(setOfflineModus(true)); // Set offline mode in the store
    setTimeout(() => {
      console.log(offlineModus);
      navigation.navigate("Game", { mode: "local" }); // This should be 'Game', not 'GameScreen'
    }, 1000); // Wait for 1 second before navigating
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Logo and Title */}
          <View style={styles.header}>
            <Image
              source={require("../assets/iconPWA.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {uiStrings[systemLang].loginTitle}
            </Text>
          </View>

          {/* Input Fields */}
          <View style={styles.inputContainer}>
            {/* Email Input */}
            <View
              style={[
                styles.inputWrapper,
                { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.inputBorder },
              ]}
              testID="login-email-wrapper"
            >
              <MaterialIcons
                name="email"
                size={24}
                color={theme.colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                testID="login-email-input"
                style={[styles.input, { color: theme.colors.text }]}
                placeholder={uiStrings[systemLang].email}
                placeholderTextColor={theme.colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
              />
            </View>

            {/* Password Input */}
            <View
              style={[
                styles.inputWrapper,
                { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.inputBorder },
              ]}
              testID="login-password-wrapper"
            >
              <MaterialIcons
                name="lock"
                size={24}
                color={theme.colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                testID="login-password-input"
                style={[styles.input, { color: theme.colors.text }]}
                placeholder={uiStrings[systemLang].password}
                placeholderTextColor={theme.colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>
          </View>

          {/* Error message */}
          {authError && (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {authError}
            </Text>
          )}

          {/* Login Button */}
          <Pressable
            testID="login-submit-button"
            style={[
              styles.button,
              {
                backgroundColor: loading
                  ? theme.colors.disabled
                  : theme.colors.accent,
              },
            ]}
            onPress={handleLoginPress}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.buttonText} />
            ) : (
              <Text
                style={[styles.buttonText, { color: theme.colors.buttonText }]}
              >
                {uiStrings[systemLang].login}
              </Text>
            )}
          </Pressable>

          {/* Forgot Password */}
          <TouchableOpacity style={styles.forgotPasswordContainer}>
            <Text
              style={[
                styles.forgotPasswordText,
                { color: theme.colors.accent },
              ]}
            >
              {uiStrings[systemLang].forgotPassword}
            </Text>
          </TouchableOpacity>

          {/* Register Link */}
          <TouchableOpacity
            style={styles.registerContainer}
            onPress={goToRegister}
          >
            <Text
              style={[styles.registerText, { color: theme.colors.textSecondary }]}
            >
              {uiStrings[systemLang].noAccount}
              <Text style={{ fontWeight: "bold", color: theme.colors.accent }}>
                {" "}
                {uiStrings[systemLang].signUp}
              </Text>
            </Text>
          </TouchableOpacity>
          {/* Divider */}
          <View style={styles.divider}>
            <View
              style={[
                styles.dividerLine,
                { backgroundColor: theme.colors.border },
              ]}
            />
            <Text
              style={[
                styles.dividerText,
                { color: theme.colors.textSecondary },
              ]}
            >
              {uiStrings[systemLang].or}
            </Text>
            <View
              style={[
                styles.dividerLine,
                { backgroundColor: theme.colors.border },
              ]}
            />
          </View>

          {/* Guest Login */}
          {/* Guest Login and Play Offline buttons in the same row */}
          <View style={styles.buttonsRow}>
            <Pressable
              testID="login-guest-button"
              style={[
                styles.buttonHalf,
                {
                  backgroundColor: loading
                    ? theme.colors.disabled
                    : theme.colors.card,
                  borderColor: theme.colors.border,
                  borderWidth: 1,
                },
                isSmallScreen && styles.buttonHalfSmall,
              ]}
              onPress={handleGuestLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator
                  color={theme.colors.text}
                  size={isSmallScreen ? "small" : "large"}
                />
              ) : (
                <Text
                  style={[
                    styles.buttonText,
                    { color: theme.colors.text },
                    isSmallScreen && styles.buttonTextSmall,
                  ]}
                >
                  {uiStrings[systemLang].continueAsGuest}
                </Text>
              )}
            </Pressable>

            <Pressable
              testID="login-offline-button"
              style={[
                styles.buttonHalf,
                {
                  backgroundColor: theme.colors.success,
                },
                isSmallScreen && styles.buttonHalfSmall,
              ]}
              onPress={goDirectlyToGame}
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: "#FFFFFF" },
                  isSmallScreen && styles.buttonTextSmall,
                ]}
              >
                {uiStrings[systemLang]?.playOffline || "Play Offline"}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
      <Toast />
    </SafeAreaView>
  );
};

export default LoginPage;
