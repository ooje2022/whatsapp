import * as ImagePicker from "expo-image-picker";
import { Platform, StyleSheet, Text, View } from "react-native";
import React from "react";
import { getFirebaseApp } from "./firebaseHelper";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import uuid from "react-native-uuid";

export const launchImagePicker = async () => {
  await checkMediaPermissions();

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [3, 4],
    quality: 1,
  });
  //console.log("Result ==> ", result);
  if (!result.canceled) {
    return result.assets[0].uri;
  }
};

export const openCamera = async () => {
  const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

  if (permissionResult.granted === false) {
    console.log("Camera access permission denied.");
    return;
  }
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [3, 4],
    quality: 1,
  });
  //console.log("Result ==> ", result);
  if (!result.canceled) {
    return result.assets[0].uri;
  }
};

export const uploadImageAsync = async (uri, isChatImage = false) => {
  //chatId=null means passing chatId is optional
  const app = getFirebaseApp();
  // Why are we using XMLHttpRequest? See:
  // https://github.com/expo/expo/issues/2402#issuecomment-443726662
  //=============convert image to blob ===========
  const blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function (e) {
      console.log(e);
      reject(new TypeError("Network request failed"));
    };
    xhr.responseType = "blob";
    xhr.open("GET", uri, true);
    xhr.send(null);
  });
  const pathFolder = isChatImage ? "chatImages" : "profilePics";
  const storageRef = ref(getStorage(app), `${pathFolder}/${uuid.v4()}`);

  const result = await uploadBytes(storageRef, blob);

  // We're done with the blob, close and release it
  blob.close();

  return await getDownloadURL(storageRef);
};

const checkMediaPermissions = async () => {
  if (Platform.OS !== "web") {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      return Promise.reject(
        "Permission required to access your photo gallary."
      );
    }
    return Promise.resolve();
  }
};

const styles = StyleSheet.create({});
