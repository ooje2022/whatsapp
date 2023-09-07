import {
  child,
  endAt,
  get,
  getDatabase,
  orderByChild,
  query,
  ref,
  startAt,
} from "firebase/database";
import { getFirebaseApp } from "../firebaseHelper";

export const getUserData = async (userId) => {
  try {
    //create firebase app
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));
    const userRef = child(dbRef, `users/${userId}`);

    const snapShot = await get(userRef);
    //console.log(snapShot); //console.log(snapShot.val())
    return snapShot.val();
  } catch (err) {
    console.log(err);
  }
};

export const searchUsers = async (queryText) => {
  //convert searchterm to lower case
  const searchTerm = queryText.toLowerCase();

  try {
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));
    const userRef = child(dbRef, "users"); //users node in the database

    //Note that firebase is no sql database like mongodb.
    const queryRef = query(
      userRef,
      orderByChild("firstLast"),
      startAt(searchTerm),
      endAt(searchTerm + "\uf8ff")
    );
    //\uf8ff is a end of the line unicode permitng work search that has single charactter "a" to multiple character "zzz" as next alphabets. Eg searching for "fre" wil also results with "freak", "fred", "freeze", ...."frey" etc.

    const snapShot = await get(queryRef);
    if (snapShot.exists()) {
      return snapShot.val(); //extract result
    }
    return {};
  } catch (err) {
    console.log(err);
    throw err;
  }
};
