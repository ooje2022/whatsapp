import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Colors } from "react-native/Libraries/NewAppScreen";

const PageTitle = (props) => {
  return (
    <View stye={styles.container}>
      <Text style={styles.text}>{props.text}</Text>
      {/* <Text style={styles.text}>{props.text}</Text> */}
    </View>
  );
};

export default PageTitle;

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  text: {
    fontSize: 28,
    color: Colors.textColor,
    fontFamily: "bold",
    letterSpacing: 0.3,
  },
});
