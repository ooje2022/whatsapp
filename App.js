import "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect, useCallback } from "react";
import { Button, LogBox, StyleSheet, Text } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import * as font from "expo-font";
import AppNavigation from "./navigation/AppNavigation";
import { store } from "./store/store";
import { Provider } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MenuProvider } from "react-native-popup-menu";

//LogBox.ignoreLogs([]);

//==============================================
//AsyncStorage.clear(); // This is a backdoor logout
// To be comented out when not needed
//==============================================

SplashScreen.preventAutoHideAsync(); //keep the splashcereen on display

export default function App() {
  const [appIsLoaded, setAppIsLoaded] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      try {
        await font.loadAsync({
          black: require("./assets/fonts/Roboto-Black.ttf"),
          blackItalic: require("./assets/fonts/Roboto-BlackItalic.ttf"),
          bold: require("./assets/fonts/Roboto-Bold.ttf"),
          boldItalic: require("./assets/fonts/Roboto-BoldItalic.ttf"),
          italic: require("./assets/fonts/Roboto-Italic.ttf"),
          light: require("./assets/fonts/Roboto-Light.ttf"),
          lightItalic: require("./assets/fonts/Roboto-LightItalic.ttf"),
          medium: require("./assets/fonts/Roboto-Medium.ttf"),
          mediumItalic: require("./assets/fonts/Roboto-MediumItalic.ttf"),
          regular: require("./assets/fonts/Roboto-Regular.ttf"),
          thin: require("./assets/fonts/Roboto-Thin.ttf"),
          thinItalic: require("./assets/fonts/Roboto-ThinItalic.ttf"),
        });
      } catch (err) {
        console.log(err);
      } finally {
        setAppIsLoaded(true);
      }
    };

    prepare();
  }, []);

  const onLayout = useCallback(async () => {
    if (appIsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [appIsLoaded]);
  //<StatusBar style="light" />
  if (!appIsLoaded) return null;
  return (
    <Provider store={store}>
      <SafeAreaProvider style={styles.container} onLayout={onLayout}>
        <MenuProvider>
          <AppNavigation />
        </MenuProvider>
      </SafeAreaProvider>
    </Provider>
  );
}

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
