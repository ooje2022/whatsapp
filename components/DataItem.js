import { StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";
import React from "react";
import ProfileImage from "./ProfileImage";
import colors from "../constants/colors";
import { Ionicons } from "@expo/vector-icons";

const DataItem = (props) => {
  const { title, subTitle, image, type, isChecked } = props;
  return (
    <TouchableWithoutFeedback onPress={props.onPress}>
      <View style={styles.container}>
        <ProfileImage uri={image} size={40} />

        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.subTitle} numberOfLines={1}>
            {subTitle}
          </Text>
        </View>
        {type === "checkbox" && (
          <View
            style={{
              ...styles.iconContainer,
              ...(isChecked && styles.checkStyle),
            }}
          >
            <Ionicons name="checkmark" size={24} color="white" />
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default DataItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingVertical: 7,
    borderBottomColor: colors.extraLightGray,
    borderBottomWidth: 1,
    alignItems: "center",
    minHeight: 50,
  },
  title: {
    fontFamily: "medium",
    fontSize: 16,
    letterSpacing: 0.3,
  },
  subTitle: {
    fontFamily: "regular",
    color: colors.gray,
    letterSpacing: 0.3,
  },
  textContainer: {
    flex: 1,
    marginLeft: 14,
  },
  iconContainer: {
    borderWidth: 1,
    borderRadius: 50,
    borderColor: colors.lightGray,
    backgroundColor: colors.white,
  },
  checkStyle: {
    backgroundColor: colors.primary,
    borderColor: "transparent",
  },
});
