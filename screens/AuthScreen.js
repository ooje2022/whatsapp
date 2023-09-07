import {
  Image,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import PageContainer from "../components/PageContainer";
import Input from "../components/Input";
import { FontAwesome, Feather } from "@expo/vector-icons";
import SubmitButton from "../components/SubmitButton";
import logo from "../assets/images/logo.png";
import SignUpForm from "../components/SignUpForm";
import SignInForm from "../components/SignInForm";
import colors from "../constants/colors";

const AuthScreen = (props) => {
  const [isSignUp, setIsSignUp] = useState(false);
  return (
    <SafeAreaView style={styles.safeArea}>
      <PageContainer>
        <ScrollView>
          <KeyboardAvoidingView
            style={styles.keyboardAvoingView}
            bahavior={Platform.OS === "ios" ? "height" : undefined}
            keyboardVerticalOffset={100}
          >
            <View style={styles.imageContainer}>
              <Image style={styles.image} source={logo} />
            </View>
            {isSignUp ? <SignUpForm /> : <SignInForm />}
            <TouchableOpacity
              onPress={() => setIsSignUp((prevState) => !prevState)}
              style={styles.linkContainer}
            >
              <Text style={styles.link}>{`Switch to ${
                isSignUp ? "Sign in" : "Sign up"
              }`}</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </ScrollView>
      </PageContainer>
    </SafeAreaView>
  );
};

export default AuthScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "50%",
    resizeMode: "contain",
  },
  linkContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 15,
  },
  link: {
    color: colors.blue,
    fontFamily: "medium",
    letterSpacing: 0.3,
  },
  keyboardAvoingView: {
    flex: 1,
    justifyContent: "center",
  },
});
