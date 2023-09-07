import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import userImage from "../assets/images/userImage.jpeg";
import colors from "../constants/colors";
import { FontAwesome } from "@expo/vector-icons";
import {
  launchImagePicker,
  uploadImageAsync,
} from "../utils/imagePickerHelper";
import { updateSignedInUserData } from "../utils/actions/authActions";
import { updateLoggedInUserData } from "../store/authSlice";
import { useDispatch } from "react-redux";

const ProfileImage = (props) => {
  const dispatch = useDispatch();
  const source = props.uri ? { uri: props.uri } : userImage; //when uriis not local you provide it as an object

  const [avatar, setAvatar] = useState(source);
  const [isLoading, setIsLoading] = useState(false);

  //
  const showEditButton = props.showEditButton && props.showEditButton === true;
  const showRemoveButton =
    props.showRemoveButton && props.showRemoveButton === true;

  //Obtain user
  const userId = props.userId;

  const pickImage = async () => {
    try {
      //console.log("Launching image picker.");
      const tempUri = await launchImagePicker();
      if (!tempUri) return;

      //Upload the image
      setIsLoading(true);

      const uploadUrl = await uploadImageAsync(tempUri);

      setIsLoading(false);

      if (!uploadUrl) throw new Error("Could not upload image.");

      const newData = { profilePicture: uploadUrl };

      //Save/update user profile image on userdata object on server
      await updateSignedInUserData(userId, newData);

      //save/update user profile image on the state management system
      dispatch(updateLoggedInUserData({ newData })); //update the state

      // set/save the image
      setAvatar({ uri: uploadUrl });
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  };

  const Container = props.onPress || showEditButton ? TouchableOpacity : View;

  return (
    <Container style={props.style} onPress={props.onPress || pickImage}>
      {isLoading ? (
        <View
          style={styles.imageLoadingIndicator}
          height={props.size}
          width={props.size}
        >
          <ActivityIndicator size={"large"} color={colors.primary} />
        </View>
      ) : (
        <Image
          style={{
            ...styles.image,
            ...{ width: props.size, height: props.size },
          }}
          source={avatar}
        />
      )}

      {showEditButton && !isLoading && (
        <View style={styles.editIconContainer}>
          <FontAwesome name="pencil" size={15} color="black" />
        </View>
      )}
      {showRemoveButton && !isLoading && (
        <View style={styles.removeIconContainer}>
          <FontAwesome name="close" size={15} color="black" />
        </View>
      )}
    </Container>
  );
};

export default ProfileImage;

const styles = StyleSheet.create({
  image: {
    borderRadius: 60,
    borderColor: colors.gray,
    borderWidth: 1,
  },
  editIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: colors.lightGray,
    borderRadius: 20,
    padding: 5,
  },
  removeIconContainer: {
    position: "absolute",
    bottom: -3,
    right: -3,
    backgroundColor: colors.lightGray,
    borderRadius: 20,
    padding: 3,
  },
  imageLoadingIndicator: {
    justifyContent: "center",
    alignItems: "center",
  },
});
