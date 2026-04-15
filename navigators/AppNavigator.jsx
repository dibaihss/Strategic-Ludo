import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../Menu/HomeScreen.jsx";
import GameScreen from "../Menu/GameScreen.jsx";
import MatchListPage from "../LobbyMatchMaking/MultiplayerMenu.jsx";
import WaitingRoom from "../LobbyMatchMaking/WaitingRoom.jsx";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ unmountOnBlur: true }}
      />
      <Stack.Screen
        name="Game"
        component={GameScreen}
        options={{ unmountOnBlur: true }}
      />
      <Stack.Screen name="MatchList" component={MatchListPage} />
      <Stack.Screen name="WaitingRoom" component={WaitingRoom} />
    </Stack.Navigator>
  );
}
