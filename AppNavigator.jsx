import GameScreen from './Menu/GameScreen.jsx';
import HomeScreen from './Menu/HomeScreen.jsx';
import { setSystemLanguage } from './assets/store/languageSlice.jsx';
import { gameInstructions } from "./assets/shared/hardCodedData.js";
import { useDispatch } from 'react-redux';

import { View, Platform, ActivityIndicator } from 'react-native'; // Added ActivityIndicator
import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginPage from './Menu/login.jsx'; // Import LoginPage

const Stack = createNativeStackNavigator();
// --- App Navigator ---
export default function AppNavigator() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true); // Check auth status on load
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Auth state

  // Language detection effect
  useEffect(() => {
    const detectedLang = Platform.OS === 'web'
      ? navigator.language.split('-')[0]
      : Platform.OS === 'ios'
        ? 'en' // Replace with actual detection if needed
        : 'en'; // Replace with actual detection if needed
    dispatch(setSystemLanguage(gameInstructions[detectedLang] ? detectedLang : 'en'));
  }, [dispatch]);


  // Simulate checking auth status on app start
  useEffect(() => {
    setIsLoading(false);
  }, []);

  // Login handler function
  const handleLogin = (username) => {
    console.log('Logged in as:', username);
    // dispatch(setGameUsername(username)); // Store username in Redux if needed
    setIsLoggedIn(true);

  };

  // Show loading indicator while checking auth
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          animation: 'slide_from_right',
        }}
      >
        {isLoggedIn ? (
          // Screens shown when logged in
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Game" component={GameScreen} />
            {/* Add other authenticated screens here */}
          </>
        ) : (
          // Screen shown when logged out
          <Stack.Screen name="Login">
            {(props) => <LoginPage {...props} onLogin={handleLogin} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}