import { Button, StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";

//import { Ionicons } from "@expo/vector-icons";

const ChatSettingScreen = (props) => {
  return (
    <View style={styles.container}>
      <Text>ChatSettingScreen</Text>
    </View>
  );
};

export default ChatSettingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    color: "black",
    fontSize: 18,
    fontFamily: "regular",
  },
});
