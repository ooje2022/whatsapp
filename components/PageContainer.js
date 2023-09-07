import { StyleSheet, Text, View } from "react-native";
import React from "react";

const PageContainer = (props) => {
  return (
    <View style={{ ...styles.container, ...props.style }}>
      {props.children}
    </View>
  );
};

export default PageContainer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: "white",
  },
  label: {
    color: "black",
    fontSize: 18,
    fontFamily: "regular",
  },
});
