import React, { useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  SafeAreaView,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
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

  const handleGuestLogin = () => {
    console.log("Logging in as guest");
    dispatch(setIsOnline(true));
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
              onPress={handleGuestLogin}
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
      <Toast />
    </SafeAreaView>
  );
};

export default LoginPage;
