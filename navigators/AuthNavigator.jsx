import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginPage from "../UserAuthentication/login.jsx";
import RegisterPage from "../UserAuthentication/Register.jsx";

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginPage} />
      <Stack.Screen
        name="Register"
        component={RegisterPage}
        options={{ unmountOnBlur: true }}
      />
    </Stack.Navigator>
  );
}
