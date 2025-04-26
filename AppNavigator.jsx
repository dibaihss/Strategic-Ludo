import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Text, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import HomeScreen from './Menu/HomeScreen.jsx';
import GameScreen from './Menu/GameScreen.jsx';
import LoginPage from './Menu/login.jsx';
import MatchListPage from './Menu/MultiplayerMenu.jsx';
import { setSystemLanguage } from './assets/store/languageSlice.jsx';
import { gameInstructions } from "./assets/shared/hardCodedData.js";
import { selectIsLoggedIn, selectUser } from './assets/store/authSlice.jsx';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const user = useSelector(selectUser);
  const [isLoading, setIsLoading] = useState(true);

  // Language detection effect
  useEffect(() => {
    const detectedLang = Platform.OS === 'web'
      ? navigator.language.split('-')[0]
      : Platform.OS === 'ios'
        ? 'en' // Replace with actual detection if needed
        : 'en'; // Replace with actual detection if needed
    dispatch(setSystemLanguage(gameInstructions[detectedLang] ? detectedLang : 'en'));
    
    // Simulate initial loading
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, [dispatch]);

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
            <Stack.Screen name="MatchList" component={MatchListPage} />
            <Stack.Screen name="Game" component={GameScreen} />
          </>
        ) : (
          // Screen shown when logged out
          <Stack.Screen 
            name="Login" 
            component={LoginPage}
            options={{ gestureEnabled: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}