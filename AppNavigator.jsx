import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from './Menu/HomeScreen.jsx';
import GameScreen from './Menu/GameScreen.jsx';
import LoginPage from './Menu/login.jsx';
import RegisterPage from './Menu/Register.jsx';
import MatchListPage from './Menu/MultiplayerMenu.jsx';
import WaitingRoom from './Menu/WaitingRoom.jsx';
import { setUser, setLoggedIn } from './assets/store/dbSlice.jsx';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector(state => state.auth.isLoggedIn);
  const [isLoading, setIsLoading] = useState(true);

  // Load stored user on startup
  useEffect(() => {
    const checkStoredUser = async () => {
      try {
        // Check if user data exists in AsyncStorage
        const storedUserData = await AsyncStorage.getItem('user');
        
        console.log('Stored user data:', storedUserData); // Debugging line
        if (storedUserData) {
          const userData = JSON.parse(storedUserData);
          
          // Dispatch actions to set user data and login state
          // Use the appropriate actions from your dbSlice
          dispatch(setUser(userData)); // Assuming you have a setUser action
          dispatch(setLoggedIn(true)); // Assuming you have a setLoggedIn action
          
          console.log('User found in storage, auto-login successful');
        } else {
          console.log('No stored user found, staying on login screen');
        }
      } catch (error) {
        console.error('Error checking stored user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // checkStoredUser();
    setIsLoading(false); // For testing purposes, set loading to false immediately
  }, [dispatch]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Game" component={GameScreen} />
            <Stack.Screen name="MatchList" component={MatchListPage} />
            <Stack.Screen name="WaitingRoom" component={WaitingRoom} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginPage} />
            <Stack.Screen name="Register" component={RegisterPage} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}