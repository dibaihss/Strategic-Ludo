import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import HomeScreen from './Menu/HomeScreen.jsx';
import GameScreen from './Menu/GameScreen.jsx';
import LoginPage from './Menu/login.jsx';
import RegisterPage from './Menu/Register.jsx'; // Import the RegisterPage
import MatchListPage from './Menu/MultiplayerMenu.jsx';
import { setSystemLanguage } from './assets/store/languageSlice.jsx';
import { gameInstructions } from "./assets/shared/hardCodedData.js";
import { selectIsLoggedIn, loadStoredUser } from './assets/store/authSlice.jsx';


const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const [isLoading, setIsLoading] = useState(true);

    // Check for stored login and detect language
    useEffect(() => {
      const init = async () => {
        // Detect language
        const detectedLang = Platform.OS === 'web'
          ? navigator.language.split('-')[0]
          : Platform.OS === 'ios'
            ? 'en' // Replace with actual detection if needed
            : 'en'; // Replace with actual detection if needed
        dispatch(setSystemLanguage(gameInstructions[detectedLang] ? detectedLang : 'en'));
        
        // Try to load stored user
        try {
          await dispatch(loadStoredUser()).unwrap();
        } catch (err) {
          // User not found in storage - that's okay
          console.log('No stored user found');
        }
        
        // Complete initialization
        setIsLoading(false);
      };
      
      init();
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
            // Screens shown when logged out
            <>
              <Stack.Screen 
                name="Login" 
                component={LoginPage}
                options={{ gestureEnabled: false }}
              />
              <Stack.Screen 
                name="Register" 
                component={RegisterPage}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    );
  }