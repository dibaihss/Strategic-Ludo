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
  ActivityIndicator
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import { uiStrings } from '../assets/shared/hardCodedData.js';
import { loginUser } from '../assets/store/authSlice.jsx';

const LoginPage = () => {
  const dispatch = useDispatch();
  const theme = useSelector(state => state.theme.current);
  const systemLang = useSelector(state => state.language.systemLang);
  const authError = useSelector(state => state.auth.error);
  const loading = useSelector(state => state.auth.loading);
  
  const [username, setUsername] = useState('');

  const handleLoginPress = () => {
    if (!username.trim()) {
      Alert.alert(
        uiStrings[systemLang].error || 'Error',
        uiStrings[systemLang].fillFields || 'Please enter a username'
      );
      return;
    }
    
    // Use the loginUser thunk
    dispatch(loginUser(username));
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
            style={[styles.button, { 
              backgroundColor: loading ? theme.colors.disabled : theme.colors.button 
            }]}
            onPress={handleLoginPress}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.buttonText} />
            ) : (
              <Text style={[styles.buttonText, { color: theme.colors.buttonText }]}>
                {uiStrings[systemLang].login || 'Login'}
              </Text>
            )}
          </Pressable>
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
    marginBottom: 20,
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
  errorText: {
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'center',
  }
});

export default LoginPage;