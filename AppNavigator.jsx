import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSelector, useDispatch } from "react-redux";
import HomeScreen from "./Menu/HomeScreen.jsx";
import GameScreen from "./Menu/GameScreen.jsx";
import LoginPage from "./UserAuthentication/login.jsx";
import RegisterPage from "./UserAuthentication/Register.jsx";
import MatchListPage from "./LobbyMatchMaking/MultiplayerMenu.jsx";
import WaitingRoom from "./LobbyMatchMaking/WaitingRoom.jsx";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const isOnline = useSelector((state) => state.game.isOnline);
  const [isLoading, setIsLoading] = useState(true);

  // Load stored user on startup
  useEffect(() => {

    setIsLoading(false); // For testing purposes, set loading to false immediately
  }, [dispatch]);



  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
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
        ) : !isOnline ? (
          <>
            <Stack.Screen name="Login" component={LoginPage} />
            <Stack.Screen name="Register" component={RegisterPage} />
            <Stack.Screen name="Home" component={HomeScreen}  />
            <Stack.Screen name="Game" component={GameScreen}  />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginPage} />
            <Stack.Screen name="Register" component={RegisterPage}  />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
