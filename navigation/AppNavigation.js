import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import MainNavigator from "./MainNavigator";
import AuthScreen from "../screens/AuthScreen";
import { useSelector } from "react-redux";
import StartUpScreen from "../screens/StartUpScreen";
StartUpScreen;

const AppNavigation = () => {
  //Signup and go to main page
  const isAuth = useSelector(
    (state) => state.auth.token !== null && state.auth.toke !== ""
  );
  const didTryAutoLogin = useSelector((state) => state.auth.didTryAutoLogin);

  return (
    <NavigationContainer>
      {isAuth && <MainNavigator />}
      {!isAuth && didTryAutoLogin && <AuthScreen />}
      {!isAuth && !didTryAutoLogin && <StartUpScreen />}
    </NavigationContainer>
  );
};

export default AppNavigation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  label: {
    color: "black",
    fontSize: 18,
    fontFamily: "regular",
  },
});
