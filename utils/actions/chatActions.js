import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { getFirebaseApp } from "../firebaseHelper";
import {
  child,
  get,
  getDatabase,
  push,
  ref,
  remove,
  set,
  update,
} from "firebase/database";

export const createChat = async (loggedInUserId, chatData) => {
  //=========== THE CODE BELOW IS TO SAVE THE CHATS IN CHATS NODE ON FIREBASE ==============
  const newChatData = {
    ...chatData,
    createdBy: loggedInUserId,
    updatedBy: loggedInUserId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const app = getFirebaseApp();
  const dbRef = ref(getDatabase(app));

  const newChat = await push(child(dbRef, "chats"), newChatData);

  //"chats" is the node to be updated. newChatData is the data to be saved in firebase, dbRef is the database reference sort of the writing pen.

  //========== THE CODE BELOW IS TO SAVE INDIVIDUAL USERS CHATS IN THE USERS NODE. THIS HELP CHAT RETREIEVAL================
  const chatUsers = newChatData.users;

  for (let i = 0; i < chatUsers.length; i++) {
    const userId = chatUsers[i];
    await push(child(dbRef, `userChats/${userId}`), newChat.key);
  }
  return newChat.key;
};

export const sendTextMessage = async (
  chatId,
  senderId,
  messageText,
  replyTo
) => {
  await sendMessage(chatId, senderId, messageText, (imageUrl = null), replyTo);
};

export const sendImage = async (chatId, senderId, imageUrl, replyTo) => {
  await sendMessage(chatId, senderId, "Image", imageUrl, replyTo);
};

const sendMessage = async (
  chatId,
  senderId,
  messageText,
  imageUrl,
  replyTo
) => {
  const app = getFirebaseApp();
  const dbRef = ref(getDatabase(app));

  const messagesRef = child(dbRef, `messages/${chatId}`);

  //Data to be sent to the database
  const messageData = {
    sendBy: senderId,
    sendAt: new Date().toISOString(),
    text: messageText,
  };

  if (replyTo) {
    messageData.replyTo = replyTo;
    //if replyTo has a value, we add that value to the message data.
  }

  if (imageUrl) {
    messageData.imageUrl = imageUrl;
  }

  await push(messagesRef, messageData);

  //Update "chats"node
  const chatRef = child(dbRef, `chats/${chatId}`);
  await update(chatRef, {
    updatedBy: senderId,
    updatedAt: new Date().toISOString(),
    latestMessageText: messageText,
  });
};

export const starMessage = async (messageId, chatId, userId) => {
  //starred messages will be seene only by the user that starred the message. For that reason a separate node will be setup in firebase for starrded message
  try {
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));

    const childRef = child(
      dbRef,
      `userStarredMessages/${userId}/${chatId}/${messageId}`
    );
    const snapshot = await get(childRef);

    if (snapshot.exists()) {
      //console.log("unstarring");
      await remove(childRef);
    } else {
      //console.log("starring");
      const starredMessageData = {
        messageId,
        chatId,
        starredAt: new Date().toISOString(),
      };

      await set(childRef, starredMessageData);
    }
  } catch (err) {
    console.log(err);
  }
};

const styles = StyleSheet.create({});
