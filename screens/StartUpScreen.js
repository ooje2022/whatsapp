import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";
import colors from "../constants/colors";
import commonStyles from "../constants/commonStyles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import { authenticate, setDidTryAutoLogin } from "../store/authSlice";
import { getUserData } from "../utils/actions/userActions";

const StartUpScreen = () => {
  const dispatch = useDispatch();

  //Check for token
  useEffect(() => {
    // The function below was created to avoid async directly on useffect.
    const tryLogin = async () => {
      const storeAuthInfo = await AsyncStorage.getItem("userData");

      // No userData found in storage
      if (!storeAuthInfo) {
        //console.log("No storage found");
        dispatch(setDidTryAutoLogin());
        return;
      }

      // User data found in storage
      const parseData = JSON.parse(storeAuthInfo); // to change from stored string to JS object
      const { token, userId, expiryDate: expiryDateString } = parseData;
      //expiryDate: expiryDateString renames expiryDate to expiryDateString and leaves the name  tag expiryDate for reuse

      //convert expiry date from string to date object
      const expiryDate = new Date(expiryDateString);

      // There is token in storage but it has expired
      if (expiryDate <= new Date() || !token || !userId) {
        dispatch(setDidTryAutoLogin());
        return;
      }

      //Token in storage and still viable
      const userData = await getUserData(userId);
      dispatch(authenticate({ token: token, userData }));
    };
    tryLogin();
  }, [dispatch]);
  return (
    <View style={commonStyles.center}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
};

export default StartUpScreen;

const styles = StyleSheet.create({});
