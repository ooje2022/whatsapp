// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

export const getFirebaseApp = () => {
  //import { getAnalytics } from "firebase/analytics";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyBJuxirRtHzQPDy-iu3oJh5UNRs_CZlIdQ",
    authDomain: "whatsapp-7086d.firebaseapp.com",
    projectId: "whatsapp-7086d",
    storageBucket: "whatsapp-7086d.appspot.com",
    messagingSenderId: "533122208984",
    appId: "1:533122208984:web:21ad13895f452ddd3a33ad",
    measurementId: "G-TDVCZGC0Y4",
  };

  // Initialize Firebase
  //const app = initializeApp(firebaseConfig);

  //const analytics = getAnalytics(app);
  //console.log(app)

  return initializeApp(firebaseConfig);
};
