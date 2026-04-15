import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginPage from "../UserAuthentication/login.jsx";
import RegisterPage from "../UserAuthentication/Register.jsx";
import HomeScreen from "../Menu/HomeScreen.jsx";
import GameScreen from "../Menu/GameScreen.jsx";

const Stack = createNativeStackNavigator();

export default function OfflineNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginPage} />
      <Stack.Screen name="Register" component={RegisterPage} />
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
    </Stack.Navigator>
  );
}
