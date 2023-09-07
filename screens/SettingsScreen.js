import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useCallback, useReducer, useState } from "react";
import PageTitle from "../components/PageTitle";
import PageContainer from "../components/PageContainer";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { validateInput } from "../utils/actions/formActions";
import { reducer } from "../utils/reducers/formReducer";
import Input from "../components/Input";
import { useDispatch, useSelector } from "react-redux";
import SubmitButton from "../components/SubmitButton";
//import { isLoading } from "expo-font";
import colors from "../constants/colors";
import { logOUT, updateSignedInUserData } from "../utils/actions/authActions";
import { updateLoggedInUserData } from "../store/authSlice";
import ProfileImage from "../components/ProfileImage";

const SettingsScreen = (props) => {
  //aCCESSING USERDATA
  const userData = useSelector((state) => state.auth.userData);
  const dispatch = useDispatch();
  //States
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessMsg, setShowSuccessMsg] = useState(false);

  const firstName = userData.firstName || "";
  const lastName = userData.lastName || "";
  const email = userData.email || "";
  const about = userData.about || "";

  const initialState = {
    inputValues: {
      firstName,
      lastName,
      email,
      about,
    },
    inputValidities: {
      firstName: undefined,
      lastName: undefined,
      email: undefined,
      about: undefined,
    },
    formIsValid: false,
  };

  const check = initialState.inputValues;

  const [formState, dispatchFormState] = useReducer(reducer, initialState);

  const inputChangeHandler = useCallback(
    (inputId, inputValue) => {
      const result = validateInput(inputId, inputValue);
      dispatchFormState({ inputId, validationResult: result, inputValue });
    },
    [dispatchFormState]
  );

  const saveHandler = useCallback(async () => {
    const updatedValues = formState.inputValues;
    try {
      setIsLoading(true);
      await updateSignedInUserData(userData.userId, updatedValues); // update the database
      dispatch(updateLoggedInUserData({ newData: updatedValues })); //update the state
      setShowSuccessMsg(true);
      setTimeout(() => {
        setShowSuccessMsg(false);
      }, 3000);
    } catch (err) {
      Alert.alert(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [formState, dispatch]);

  //Function to detect changs in the userdata
  const hasChanges = () => {
    const currentValues = formState.inputValues;

    return (
      currentValues.firstName != firstName ||
      currentValues.lastName != lastName ||
      currentValues.email != email ||
      currentValues.about != about
    );
  };

  return (
    <PageContainer style={styles.container}>
      <PageTitle>Settings</PageTitle>

      {/* <PageTitle text="Settings" /> */}
      <ScrollView contentContainerStyle={styles.formContainer}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoingView}
          bahavior={Platform.OS === "ios" ? "height" : undefined}
          keyboardVerticalOffset={100}
        >
          <ProfileImage
            size={120}
            userId={userData.userId}
            uri={userData.profilePicture}
            showEditButton={true}
          />
          <Input
            id="firstName"
            label="First Name"
            icon="user-o"
            iconPack={FontAwesome}
            autoCapitalize="none"
            onInputChange={inputChangeHandler}
            errorText={formState.inputValidities["firstName"]}
            initialValue={userData.firstName}
          />
          <Input
            id="lastName"
            label="Last Name"
            icon="user-o"
            iconPack={FontAwesome}
            autoCapitalize="none"
            onInputChange={inputChangeHandler}
            errorText={formState.inputValidities["lastName"]}
            initialValue={userData.lastName}
          />
          <Input
            id="email"
            label="Email"
            icon="mail"
            iconPack={Feather}
            autoCapitalize="none"
            keyboardType="email-address"
            onInputChange={inputChangeHandler}
            errorText={formState.inputValidities["email"]}
            initialValue={userData.email}
          />
          <Input
            id="about"
            label="About"
            icon="user-o"
            iconPack={FontAwesome}
            autoCapitalize="none"
            onInputChange={inputChangeHandler}
            errorText={formState.inputValidities["about"]}
            initialValue={userData.about}
          />
          <View style={{ marginTop: 20 }}>
            {showSuccessMsg && <Text>Update saved</Text>}
            {isLoading ? (
              <ActivityIndicator
                size={"small"}
                color={colors.primary}
                style={{ marginTop: 20 }}
              />
            ) : (
              hasChanges() && (
                <SubmitButton
                  onPress={saveHandler}
                  title="Save"
                  style={{ marginTop: 20 }}
                  disabled={!formState.formIsValid}
                />
              )
            )}
          </View>
          <SubmitButton
            onPress={() => dispatch(logOUT())}
            title="Logout"
            style={{ marginTop: 20 }}
            color={"orange"}
          />
        </KeyboardAvoidingView>
      </ScrollView>
    </PageContainer>
  );
};
PageContainer;
export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoingView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  // formContainer: {
  //   alignItems: "center",
  // },
});
