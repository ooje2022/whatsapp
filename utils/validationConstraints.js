import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { validate } from "validate.js";

export const validateString = (id, value) => {
  const constraints = {
    presence: { allowEmpty: false },
  };
  if (value !== "") {
    constraints.format = {
      pattern: "[a-z]+",
      flags: "i", //case insensitive
      message: "Alphabets only allowed.",
    };
  }
  const validationResult = validate({ [id]: value }, { [id]: constraints });
  return validationResult && validationResult[id];
};

/* The personal information part can contain the following ASCII characters:

Uppercase and lowercase letters (A-Z and a-z)
Numeric characters (0-9)
Special characters - ! # $ % & ' * + - / = ? ^ _ ` { | } ~
Period, dot, or full stop (.) with the condition that it cannot be the first or last letter of the email and cannot repeat one after another */

/* export const validateNewEmail = (input) => {
  const validRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

  if (input.value.match(validRegex)) {
    alert("Valid email address!");

    //document.form1.text1.focus();

    return true;
  } else {
    alert("Invalid email address!");

    //document.form1.text1.focus();

    return false;
  }
}; */

export const validateEmail = (id, value) => {
  const constraints = {
    presence: { allowEmpty: false },
  };
  if (value !== "") {
    constraints.format = {
      pattern: "[A-Z0-9+_.-]+@[A-Z0-9.-]+", //"((([a-zA-Z-0-9]+.)+[a-zA-Z]{2,}))", //, //"[a-z0-9]+",
      flags: "i", //case insensitive
    };
  }

  const validationResult = validate({ [id]: value }, { [id]: constraints });
  return validationResult && validationResult[id];
};

export const validatePassword = (id, value) => {
  const constraints = {
    presence: { allowEmpty: false },
  };
  if (value !== "") {
    constraints.length = {
      minimum: 6,
      message: "must be at least 6 characters long.",
    };
  }

  const validationResult = validate({ [id]: value }, { [id]: constraints });
  return validationResult && validationResult[id];
};

export const validateLength = (id, value, minLength, maxLength, allowEmpty) => {
  const constraints = {
    presence: { allowEmpty: true },
  };
  if (!allowEmpty || value !== "") {
    constraints.length = {};
    if (minLength !== null) {
      constraints.length.minimum = minLength;
    }
    if (maxLength !== null) {
      constraints.length.maximum = maxLength;
    }
  }
  const validationResult = validate({ [id]: value }, { [id]: constraints });
  return validationResult && validationResult[id];
};

const styles = StyleSheet.create({});
