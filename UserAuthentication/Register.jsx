import React, { useState, useMemo } from 'react';
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
} from 'react-native';
import { createRegisterStyles } from './Register.styles.js';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { uiStrings } from '../assets/shared/hardCodedData.js';
import { registerUser } from '../assets/store/authSlice.jsx';

const RegisterPage = ({ navigation }) => {
  const dispatch = useDispatch();
  const theme = useSelector(state => state.theme.current);
  const styles = useMemo(() => createRegisterStyles(theme), [theme]);
  const systemLang = useSelector(state => state.language.systemLang);
  const loading = useSelector(state => state.auth.loading);
  const error = useSelector(state => state.auth.error);
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = () => {
    console.log("Registering user:", { username, email, password }); // Debugging line
    
    // Basic validation
    if (!username.trim() || !email.trim() || !password.trim()) {
      Toast.show({
        type: 'error',
        text1: uiStrings[systemLang].error || 'Error',
        text2: uiStrings[systemLang].fillFields || 'Please fill in all fields',
        position: 'bottom',
      });
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Toast.show({
        type: 'error',
        text1: uiStrings[systemLang].error || 'Error',
        text2: uiStrings[systemLang].invalidEmail || 'Please enter a valid email address',
        position: 'bottom',
      });
      return;
    }
    
    // Validate username length
    if (username.length < 3) {
      Toast.show({
        type: 'error',
        text1: uiStrings[systemLang].error || 'Error',
        text2: uiStrings[systemLang].usernameTooShort || 'Username must be at least 3 characters',
        position: 'bottom',
      });
      return;
    }
    
    // Validate password length
    if (password.length < 6) {
      Toast.show({
        type: 'error',
        text1: uiStrings[systemLang].error || 'Error',
        text2: uiStrings[systemLang].passwordTooShort || 'Password must be at least 6 characters',
        position: 'bottom',
      });
      return;
    }
    
    // Register using the registerUser thunk
    dispatch(registerUser({
      username,
      email,
      password,
    }))

  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Image
              source={require('../assets/iconPWA.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {uiStrings[systemLang].registerTitle || 'Create Account'}
            </Text>
          </View>

          {/* Input Fields */}
          <View style={styles.inputContainer}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {uiStrings[systemLang].accountDetails || 'Account Details'}
            </Text>
            
            {/* Username Input */}
            <View style={[styles.inputWrapper, { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.inputBorder }]}>
              <MaterialIcons name="person" size={24} color={theme.colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder={uiStrings[systemLang].chooseUsername || 'Choose Username'}
                placeholderTextColor={theme.colors.textSecondary}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                editable={!loading}
              />
            </View>
            
            {/* Email Input */}
            <View style={[styles.inputWrapper, { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.inputBorder }]}>
              <MaterialIcons name="email" size={24} color={theme.colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder={uiStrings[systemLang].email || 'Email Address'}
                placeholderTextColor={theme.colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
              />
            </View>
            
            {/* Password Input */}
            <View style={[styles.inputWrapper, { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.inputBorder }]}>
              <MaterialIcons name="lock" size={24} color={theme.colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder={uiStrings[systemLang].password || 'Password'}
                placeholderTextColor={theme.colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>
          </View>

          {/* Error message */}
          {error && (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {error}
            </Text>
          )}

          {/* Register Button */}
          <Pressable
            style={[styles.button, { 
              backgroundColor: loading ? theme.colors.disabled : theme.colors.accent 
            }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.buttonText} />
            ) : (
              <Text style={[styles.buttonText, { color: theme.colors.buttonText }]}>
                {uiStrings[systemLang].createAccount || 'Create Account'}
              </Text>
            )}
          </Pressable>
          
          {/* Back to Login */}
          <TouchableOpacity 
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={[styles.loginText, { color: theme.colors.textSecondary }]}>
              {uiStrings[systemLang].backToLogin || 'Already have an account? Log in'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      
      {/* Toast component */}
      <Toast />
    </SafeAreaView>
  );
};

export default RegisterPage;
