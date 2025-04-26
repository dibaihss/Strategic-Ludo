import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSelector } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import { uiStrings } from '../assets/shared/hardCodedData.js';
import { useDispatch } from 'react-redux';
import { loginUser } from '../assets/store/authSlice.jsx';

const LoginPage = ({ onLogin }) => {
    const dispatch = useDispatch();
  const theme = useSelector(state => state.theme.current);
  const systemLang = useSelector(state => state.language.systemLang);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginPress = () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert(
        uiStrings[systemLang].error || 'Error',
        uiStrings[systemLang].fillFields || 'Please fill in all fields.'
      );
      return;
    }
    setLoading(true);
    // Simulate login process
    setTimeout(() => {
      // In a real app, you'd call your auth API here
      onLogin(username); // Pass username to the parent handler
      setLoading(false);
    }, 1500);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: "white" }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Logo and Title */}
          <View style={styles.header}>
            <Image
              source={require('../assets/iconPWA.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {uiStrings[systemLang].loginTitle || 'Login to Ludo'}
            </Text>
          </View>

          {/* Input Fields */}
          <View style={styles.inputContainer}>
            <View style={[styles.inputWrapper, { borderColor: theme.colors.border }]}>
              <MaterialIcons name="person" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder={uiStrings[systemLang].username || 'Username'}
                placeholderTextColor={theme.colors.textSecondary}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

            <View style={[styles.inputWrapper, { borderColor: theme.colors.border }]}>
              <MaterialIcons name="lock" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder={uiStrings[systemLang].password || 'Password'}
                placeholderTextColor={theme.colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          {/* Login Button */}
          <Pressable
            style={[styles.button, { backgroundColor: loading ? theme.colors.disabled : theme.colors.button }]}
            onPress={handleLoginPress}
            disabled={loading}
          >
            <Text style={[styles.buttonText, { color: theme.colors.buttonText }]}>
              {loading ? (uiStrings[systemLang].loggingIn || 'Logging In...') : (uiStrings[systemLang].login || 'Login')}
            </Text>
          </Pressable>

          {/* Optional: Links for Sign Up / Forgot Password */}
          <View style={styles.linksContainer}>
            <Pressable onPress={() => Alert.alert('Navigate', 'Go to Sign Up')}>
              <Text style={[styles.linkText, { color: theme.colors.primary }]}>
                {uiStrings[systemLang].signUp || 'Sign Up'}
              </Text>
            </Pressable>
            <Pressable onPress={() => Alert.alert('Navigate', 'Go to Forgot Password')}>
              <Text style={[styles.linkText, { color: theme.colors.textSecondary }]}>
                {uiStrings[systemLang].forgotPassword || 'Forgot Password?'}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 30,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  linkText: {
    fontSize: 14,
  },
});

export default LoginPage;