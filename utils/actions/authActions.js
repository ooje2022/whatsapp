import { getFirebaseApp } from "../firebaseHelper";
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { child, getDatabase, ref, set, update } from "firebase/database";
import { authenticate, logout } from "../../store/authSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserData } from "./userActions";

let timer;

export const signUp = (firstName, lastName, email, password) => {
  return async (dispatch) => {
    const app = getFirebaseApp();
    const auth = getAuth(app);

    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const { uid, stsTokenManager } = result.user;
      const { accessToken, expirationTime } = stsTokenManager;

      const expiryDate = new Date(expirationTime);

      //Timeout check to logout
      const timeNow = new Date();
      const millisecondUntilExpiry = expiryDate - timeNow;

      const userData = await createUser(firstName, lastName, email, uid);

      dispatch(authenticate({ token: accessToken, userData }));

      // Persist the user data to stay logged on even afetr refresh

      saveDataToStorage(accessToken, uid, expiryDate);

      //logout user when time out
      timer = setTimeout(() => {
        dispatch(logOUT());
      }, millisecondUntilExpiry);
    } catch (err) {
      console.log(err);
      const errorCode = err.code;

      let message = "Something went wrong";

      if (errorCode === "auth/email-already-in-use") {
        message = "This email is already in use.";
      }
      throw new Error(message);
    }
  };
};

export const logOUT = () => {
  return async (dispatch) => {
    AsyncStorage.clear();
    clearTimeout(timer);
    dispatch(logout());
  };
};

export const signIn = (email, password) => {
  return async (dispatch) => {
    const app = getFirebaseApp();
    const auth = getAuth(app);

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const { uid, stsTokenManager } = result.user;
      const { accessToken, expirationTime } = stsTokenManager;

      const expiryDate = new Date(expirationTime);

      //Timeout check to logout
      const timeNow = new Date();
      const millisecondUntilExpiry = expiryDate - timeNow;

      const userData = await getUserData(uid);

      dispatch(authenticate({ token: accessToken, userData }));

      // Persist the user data to stay logged on even afetr refresh

      saveDataToStorage(accessToken, uid, expiryDate);

      //logout user when time out
      timer = setTimeout(() => {
        dispatch(logOUT());
      }, millisecondUntilExpiry);
    } catch (err) {
      console.log(err);
      const errorCode = err.code;

      let message = "Something went wrong";

      if (
        errorCode === "auth/wrong-password" ||
        errorCode === "auth/user-not-found"
      ) {
        message = "The username or password are/is incorrect.";
      }
      throw new Error(message);
    }
  };
};

const createUser = async (firstName, lastName, email, userId) => {
  const firstLast = `${firstName} ${lastName}`.toLowerCase();
  const userData = {
    firstName,
    lastName,
    firstLast,
    email,
    userId,
    signUpDate: new Date().toISOString(),
  };

  const dbRef = ref(getDatabase());
  const childRef = child(dbRef, `users/${userId}`); //dbRef is the db root or parent
  await set(childRef, userData);
  return userData;
};

export const updateSignedInUserData = async (userId, newData) => {
  if (newData.firstName && newData.lastName) {
    const firstLast = `${newData.firstName} ${newData.lastName}`.toLowerCase();
    newData.firstLast = firstLast;
  }

  const dbRef = ref(getDatabase());
  const childRef = child(dbRef, `users/${userId}`); //dbRef is the db root or parent
  await update(childRef, newData);
  //return userData;
};

const saveDataToStorage = (token, userId, expiryDate) => {
  AsyncStorage.setItem(
    "userData",
    JSON.stringify({
      token,
      userId,
      expiryDate: expiryDate.toISOString(),
    })
  );
};
