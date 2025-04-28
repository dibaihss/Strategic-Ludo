import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import HomeScreen from './Menu/HomeScreen.jsx';
import GameScreen from './Menu/GameScreen.jsx';
import LoginPage from './Menu/login.jsx';
import RegisterPage from './Menu/Register.jsx';
import MatchListPage from './Menu/MultiplayerMenu.jsx';
import WaitingRoom from './Menu/WaitingRoom.jsx'; // Make sure this is imported
import ModalUserInput from './Menu/modelInputTest.jsx';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector(state => state.auth.isLoggedIn);
  const [isLoading, setIsLoading] = useState(true);

  // Load stored user on startup
  useEffect(() => {
    // Your loading logic
    setIsLoading(false);
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
      <Stack.Navigator initialRouteName='input' screenOptions={{ headerShown: false }}>
      <Stack.Screen name="input" component={ModalUserInput} />
      <Stack.Screen name="Game" component={GameScreen} />
     
        {/* {isLoggedIn ? (
          // Fix: Remove any whitespace between the fragments
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Game" component={GameScreen} />
            <Stack.Screen name="MatchList" component={MatchListPage} />
            <Stack.Screen name="WaitingRoom" component={WaitingRoom} />
          </>
        ) : (
          // Fix: Remove any whitespace between the fragments
          <>
            <Stack.Screen name="Login" component={LoginPage} />
            <Stack.Screen name="Register" component={RegisterPage} />
          </>
        )} */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}