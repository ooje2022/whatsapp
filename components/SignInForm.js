import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import React, { useCallback, useEffect, useReducer, useState } from "react";
import Input from "../components/Input";
import { Feather } from "@expo/vector-icons";
import SubmitButton from "../components/SubmitButton";
import { validateInput } from "../utils/actions/formActions";
import { reducer } from "../utils/reducers/formReducer";
import { signIn, signUp } from "../utils/actions/authActions";
import { useDispatch } from "react-redux";
import colors from "../constants/colors";

const isTestMode = true;

const initialState = {
  inputValues: {
    email: isTestMode ? "ooje2012@gmail.com" : "",
    password: isTestMode ? "pass1234" : "",
  },
  inputValidities: {
    email: isTestMode ? true : false,
    password: isTestMode ? true : false,
  },
  formIsValid: isTestMode ? true : false,
};

const SignInForm = () => {
  const dispatch = useDispatch();
  const [error, setError] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [formState, dispatchFormState] = useReducer(reducer, initialState);

  const inputChangeHandler = useCallback(
    (inputId, inputValue) => {
      const result = validateInput(inputId, inputValue);
      dispatchFormState({ inputId, validationResult: result, inputValue });
    },
    [dispatchFormState]
  );

  useEffect(() => {
    if (error) {
      Alert.alert("An error occured.", error, [{ text: "okay" }]);
    }
  }, [error]);

  const authHandler = useCallback(async () => {
    try {
      setIsLoading(true);
      const action = signIn(
        formState.inputValues.email,
        formState.inputValues.password
      );
      setError(null);

      await dispatch(action); // Check if crash
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  }, [dispatch, formState]);

  /*   const authHandler = () => {
    signUp(formState.inputValues.email, formState.inputValues.password);
  }; */

  return (
    <>
      <Input
        id="email"
        label="Email"
        icon="mail"
        iconPack={Feather}
        autoCapitalize="none"
        keyboardType="email-address"
        onInputChange={inputChangeHandler}
        initialValue={formState.inputValues.email}
        errorText={formState.inputValidities["email"]}
      />
      <Input
        id="password"
        label="Password"
        icon="lock"
        iconPack={Feather}
        autoCapitalize="none"
        //keyboardType="email-address"
        secureTextEntry
        onInputChange={inputChangeHandler}
        initialValue={formState.inputValues.password}
        //errorText={"This is a demo error text"}
      />
      {isLoading ? (
        <ActivityIndicator
          size={"small"}
          color={colors.primary}
          style={{ marginTop: 20 }}
        />
      ) : (
        <SubmitButton
          onPress={authHandler}
          title="Sign in"
          style={{ marginTop: 20 }}
          disabled={!formState.formIsValid}
        />
      )}
    </>
  );
};

export default SignInForm;

const styles = StyleSheet.create({});
