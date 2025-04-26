import GameScreen from './Menu/GameScreen.jsx';
import HomeScreen from './Menu/HomeScreen.jsx';
import { setSystemLanguage } from './assets/store/languageSlice.jsx';
import { gameInstructions } from "./assets/shared/hardCodedData.js";
import { useDispatch } from 'react-redux';

import { View, Platform, ActivityIndicator, Alert } from 'react-native'; // Added Alert
import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginPage from './Menu/login.jsx'; // Import LoginPage
// Assuming you have this action creator
// import { setGameUsername, setUserId } from './assets/store/gameSlice.jsx';

const Stack = createNativeStackNavigator();
// --- App Navigator ---
export default function AppNavigator() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true); // Check auth status on load
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Auth state
  const [loginError, setLoginError] = useState(null); // State for login errors

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
    // In a real app, check AsyncStorage/SecureStore for a token/user info
    setIsLoading(false);
  }, []);

  // Login handler function with API call
  const handleLogin = async (username, password) => { // Accept password if needed by API
    console.log('Attempting login for:', username);
    setLoginError(null); // Clear previous errors
    setIsLoading(true); // Show loading state during API call

    try {
      // --- API Call to Create/Get User ---
      // Adjust the URL and body based on your actual API endpoint for login/user creation
      const response = await fetch('http://localhost:8080/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Sending username, assuming status is handled by backend or default
        // If your API expects password, include it here
        body: JSON.stringify({
          name: username,
          // password: password, // Uncomment if your API needs password
          status: "active" // Or let backend handle status
        }),
      });

      if (!response.ok) {
        // Handle API errors (e.g., user already exists, validation errors)
        const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const userData = await response.json();
      console.log('User created/fetched:', userData);

      // --- Login Success ---
      // Store user data if needed (e.g., user ID, token)
      // dispatch(setUserId(userData.id)); // Example: Store user ID in Redux
      // dispatch(setGameUsername(username)); // Store username in Redux

      setIsLoggedIn(true); // Update login state

    } catch (error) {
      console.error('Login failed:', error);
      setLoginError(error.message || 'An unexpected error occurred during login.');
      // Show error to the user
      Alert.alert('Login Failed', error.message || 'Could not log in. Please try again.');
    } finally {
      setIsLoading(false); // Hide loading state
    }
  };

  // Show loading indicator while checking auth or during login API call
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        {loginError && <Text style={{ color: 'red', marginTop: 10 }}>{loginError}</Text>}
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: true, // Enable gesture only when logged in?
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
          <Stack.Screen name="Login" options={{ gestureEnabled: false }}>
            {(props) => <LoginPage {...props} onLogin={handleLogin} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}