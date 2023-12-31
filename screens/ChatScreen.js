/* import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";

import bgimage from "../assets/images/leaves3.jpeg";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import colors from "../constants/colors";
import { useSelector } from "react-redux";
import Bubble from "../components/Bubble";
import PageContainer from "../components/PageContainer";
import {
  createChat,
  sendImage,
  sendTextMessage,
} from "../utils/actions/chatActions";
import ReplyTo from "../components/ReplyTo";
import {
  launchImagePicker,
  openCamera,
  uploadImageAsync,
} from "../utils/imagePickerHelper";
import AwesomeAlert from "react-native-awesome-alerts";

const ChatScreen = (props) => {
  const [messageText, setMessageText] = useState("");
  const [chatUsers, setChatUsers] = useState([]);
  const [chatId, setChatId] = useState(props.route?.params?.chatId);
  const [errorBannerText, setErrorBannerText] = useState("");
  const [replyingTo, setReplyingTo] = useState();
  const [tempImageUri, setTempImageUri] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const flatList = useRef();

  console.log(
    "ChatScreen => :........... ",
    JSON.stringify(chatUsers, null, 4)
  );

  const storedUsers = useSelector((state) => state.users.storedUsers);
  const storedChats = useSelector((state) => state.chats.chatsData);

  const userData = useSelector((state) => state.auth.userData);

  const chatMessages = useSelector((state) => {
    if (!chatId) return [];
    const chatMessagesData = state.messages.messagesData[chatId];
    //chatMessages is not an array but an object so we can't iterate over it. So we need amend it to sthat we can get messages from it.

    if (!chatMessagesData) return [];

    //converting set o fobjects to array
    const messagesList = [];
    for (const key in chatMessagesData) {
      const message = chatMessagesData[key];
      //message.key = key;
      messagesList.push({
        key,
        ...message,
      });
    }
    return messagesList;
  });
  //console.log(chatMessages);
  //console.log(chatMessages);

  //console.log(JSON.stringify(storedUsers, null, 4));

  //Access the chatUsers node passed from chatlist
  const chatData =
    (chatId && storedChats[chatId]) || props.route?.params?.newChatData;
  //console.log(chatData);

  //At this point we intend to display chat with selected user but we dont have it, at least not without gong bck to repository (firebase to get it).

  //Howevere we already have that user data from firebase when we retrive va search in the chatlistscreen.

  //So to ensure this data is available throughout our app what we do is create a userSlice and dump this data there for access to redux.

  const getChatTitleFromName = () => {
    //get the userId of the other person ie persn to chat with
    const otherUserId = chatUsers.find((uid) => uid !== userData.userId);

    //get uerData of the other user
    const otherUserData = storedUsers[otherUserId];

    //return the names of the other user
    return `${otherUserData?.firstName} ${otherUserData?.lastName}`;
  };
  useEffect(() => {
    props.navigation.setOptions({ headerTitle: getChatTitleFromName() });
    setChatUsers(chatData.users);
  }, [chatUsers]);

  const sendMessage = useCallback(async () => {
    try {
      //to force the app to throw an error for testing
      //throw new Error("Error test message.");

      //Th code below is to create a chatId for new user so that app does not crash as chatId is required to store chat in storage before they are pulled into the state.
      let id = chatId;
      if (!id) {
        //no chatid .. create chat now
        id = await createChat(userData.userId, props.route.params.newChatData);
        setChatId(id);
      }

      //pull message from database and display on screen
      await sendTextMessage(
        chatId,
        userData.userId,
        messageText,
        replyingTo && replyingTo.key
      );

      setMessageText(""); //ensure this cleat message set s placed within the try block to ensure that failed message are not cleared from the inputtext box for resend opportunity.
      setReplyingTo(null);
    } catch (err) {
      console.log(err);
      setErrorBannerText("Message failed to send.");
      setTimeout(() => setErrorBannerText(""), 5000);
    }
  }, [messageText, chatId]);
  //console.log(messageText);

  const pickImage = useCallback(async () => {
    try {
      const tempUri = await launchImagePicker();
      if (!tempUri) return;
      setTempImageUri(tempUri);
    } catch (error) {
      console.log(err);
    }
  }, [tempImageUri]);
  //callback is used to ensure that this function returns a memorised version of the function so it won't rerender unelss one of its dependencies change.

  const takePhoto = useCallback(async () => {
    try {
      const tempUri = await openCamera();
      if (!tempUri) return;
      setTempImageUri(tempUri);
    } catch (error) {
      console.log(err);
    }
  }, [tempImageUri]);

  const uploadImage = useCallback(async () => {
    setIsLoading(true);

    //send Image to firebase storage

    try {
      let id = chatId;
      if (!id) {
        //no chatid .. create chat now
        id = await createChat(userData.userId, props.route.params.newChatData);
        setChatId(id);
      }
      //upoad to storage
      const uploadUrl = await uploadImageAsync(
        tempImageUri,
        (isChatImage = true)
      );
      setIsLoading(false);
      //set image to the bubble
      await sendImage(
        id, //chatId,
        userData.userId,
        uploadUrl,
        replyingTo && replyingTo.key
      );
      setReplyingTo(null);

      setTimeout(() => setTempImageUri(""), 500);
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    } finally {
    }
  }, [tempImageUri, isLoading, chatId]);

  return (
    <SafeAreaView edges={["right", "left", "bottom"]} style={styles.container}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={100}
      >
        <ImageBackground source={bgimage} style={styles.backgroundImage}>
          <PageContainer style={{ backgroundColor: "transparent" }}>
            {!chatId && (
              <Bubble
                text={"Test message to the chat screen saying Hi....."}
                type={"system"}
              />
            )}
            {errorBannerText !== "" && (
              <Bubble text={errorBannerText} type="error" />
            )}
            {chatId && (
              <FlatList
                ref={(ref) => (flatList.current = ref)} //assigning reference to this flatlist to flatlist.current. This is done to ensure that long chat scroll automatically to the top when opened without you having to scroll manually.
                onContentSizeChange={() =>
                  flatList.current.scrollToEnd({ animated: false })
                }
                onLayout={() =>
                  flatList.current.scrollToEnd({ animated: false })
                }
                data={chatMessages}
                renderItem={(itemData) => {
                  const message = itemData.item;
                  const isOwnMessage = message.sendBy === userData.userId;
                  const messageType = isOwnMessage
                    ? "myMessage"
                    : "theirMessage";
                  return (
                    <Bubble
                      type={messageType}
                      text={message.text}
                      messageId={message.key}
                      userId={userData.userId}
                      chatId={chatId}
                      date={message.sendAt}
                      setReply={() => setReplyingTo(message)}
                      replyingTo={
                        message.replyTo &&
                        chatMessages.find((i) => i.key === message.replyTo)
                      }
                      imageUrl={message.imageUrl}
                    />
                  );
                }}
              />
            )}
          </PageContainer>
          {replyingTo && (
            <ReplyTo
              text={replyingTo.text}
              user={storedUsers[replyingTo.sendBy]}
              onCancel={() => setReplyingTo(null)}
            />
          )}
        </ImageBackground>
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.mediaButtons} onPress={pickImage}>
            <Feather name="plus" size={24} color={colors.blue} />
          </TouchableOpacity>
          <TextInput
            onChangeText={(text) => setMessageText(text)}
            value={messageText}
            style={styles.textBox}
            onSubmitEditing={sendMessage}
          />
          {messageText === "" && (
            <TouchableOpacity
              style={styles.mediaButtons}
              onPress={takePhoto} //send message. Also do for return button on keyboard
            >
              <Feather name="camera" size={24} color={colors.blue} />
            </TouchableOpacity>
          )}

          {messageText !== "" && (
            <TouchableOpacity
              style={{ ...styles.mediaButtons, ...styles.sendButton }}
              onPress={sendMessage}
            >
              <Feather name="send" size={20} color={colors.white} />
            </TouchableOpacity>
          )}

          <AwesomeAlert
            show={tempImageUri !== ""}
            title="send Image?"
            closeOnToucOutside={true}
            closeOnHardwareBackPress={true}
            showCancelButton={true}
            showConfirmButton={true}
            cancelText="Cancel"
            confirmText="Load image"
            confirmButtonColor={colors.primary}
            cancelButtonColor={colors.red}
            titleStyle={styles.popupTitleStyle}
            onCancelPressed={() => setTempImageUri("")}
            onConfirmPressed={uploadImage}
            onDismiss={() => setTempImageUri("")}
            customView={
              <View>
                {isLoading && (
                  <ActivityIndicator size={"small"} color={colors.primary} />
                )}
                {!isLoading && tempImageUri !== "" && (
                  <Image
                    source={{ uri: tempImageUri }}
                    style={{ width: 200, height: 200 }}
                  />
                )}
              </View>
            }
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    flexDirection: "column",
  },
  screen: {
    flex: 1,
  },
  label: {
    color: "black",
    fontSize: 18,
    fontFamily: "regular",
  },
  backgroundImage: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 10,
    height: 50,
  },
  textBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 50,
    borderColor: colors.lightGray,
    marginHorizontal: 15,
    paddingHorizontal: 12,
  },
  mediaButtons: {
    alignItems: "center",
    justifyContent: "center",
    width: 35,
  },
  sendButton: {
    backgroundColor: colors.blue,
    borderRadius: 50,
    padding: 8,
  },
  popupTitleStyle: {
    fontFamily: "medium",
    letterSpacing: 0.3,
    color: colors.textColor,
  },
});
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import backgroundImage from "../assets/images/droplet.jpeg";
import colors from "../constants/colors";
import { useSelector } from "react-redux";
import PageContainer from "../components/PageContainer";
import Bubble from "../components/Bubble";
import {
  createChat,
  sendImage,
  sendTextMessage,
} from "../utils/actions/chatActions";
import ReplyTo from "../components/ReplyTo";
import {
  launchImagePicker,
  openCamera,
  uploadImageAsync,
} from "../utils/imagePickerHelper";
import AwesomeAlert from "react-native-awesome-alerts";

const ChatScreen = (props) => {
  const [chatUsers, setChatUsers] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [chatId, setChatId] = useState(props.route?.params?.chatId);
  const [errorBannerText, setErrorBannerText] = useState("");
  const [replyingTo, setReplyingTo] = useState();
  const [tempImageUri, setTempImageUri] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const flatList = useRef();

  const userData = useSelector((state) => state.auth.userData);
  const storedUsers = useSelector((state) => state.users.storedUsers);
  const storedChats = useSelector((state) => state.chats.chatsData);
  const chatMessages = useSelector((state) => {
    if (!chatId) return [];

    const chatMessagesData = state.messages.messagesData[chatId];

    if (!chatMessagesData) return [];

    const messageList = [];
    for (const key in chatMessagesData) {
      const message = chatMessagesData[key];

      messageList.push({
        key,
        ...message,
      });
    }

    return messageList;
  });

  const chatData =
    (chatId && storedChats[chatId]) || props.route?.params?.newChatData;

  const getChatTitleFromName = () => {
    const otherUserId = chatUsers.find((uid) => uid !== userData.userId);
    const otherUserData = storedUsers[otherUserId];

    return (
      otherUserData && `${otherUserData.firstName} ${otherUserData.lastName}`
    );
  };

  useEffect(() => {
    props.navigation.setOptions({
      headerTitle: getChatTitleFromName(),
    });
    setChatUsers(chatData.users);
  }, [chatUsers]);

  const sendMessage = useCallback(async () => {
    try {
      let id = chatId;
      if (!id) {
        // No chat Id. Create the chat
        id = await createChat(userData.userId, props.route.params.newChatData);
        setChatId(id);
      }

      await sendTextMessage(
        chatId,
        userData.userId,
        messageText,
        replyingTo && replyingTo.key
      );

      setMessageText("");
      setReplyingTo(null);
    } catch (error) {
      console.log(error);
      setErrorBannerText("Message failed to send");
      setTimeout(() => setErrorBannerText(""), 5000);
    }
  }, [messageText, chatId]);

  const pickImage = useCallback(async () => {
    try {
      const tempUri = await launchImagePicker();
      if (!tempUri) return;

      setTempImageUri(tempUri);
    } catch (error) {
      console.log(error);
    }
  }, [tempImageUri]);

  const takePhoto = useCallback(async () => {
    try {
      const tempUri = await openCamera();
      if (!tempUri) return;

      setTempImageUri(tempUri);
    } catch (error) {
      console.log(error);
    }
  }, [tempImageUri]);

  const uploadImage = useCallback(async () => {
    setIsLoading(true);

    try {
      let id = chatId;
      if (!id) {
        // No chat Id. Create the chat
        id = await createChat(userData.userId, props.route.params.newChatData);
        setChatId(id);
      }

      const uploadUrl = await uploadImageAsync(tempImageUri, true);
      setIsLoading(false);

      await sendImage(
        id,
        userData.userId,
        uploadUrl,
        replyingTo && replyingTo.key
      );
      setReplyingTo(null);

      setTimeout(() => setTempImageUri(""), 500);
    } catch (error) {
      console.log(error);
    }
  }, [isLoading, tempImageUri, chatId]);

  return (
    <SafeAreaView edges={["right", "left", "bottom"]} style={styles.container}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={100}
      >
        <ImageBackground
          source={backgroundImage}
          style={styles.backgroundImage}
        >
          <PageContainer style={{ backgroundColor: "transparent" }}>
            {!chatId && (
              <Bubble text="This is a new chat. Say hi!" type="system" />
            )}

            {errorBannerText !== "" && (
              <Bubble text={errorBannerText} type="error" />
            )}

            {chatId && (
              <FlatList
                ref={(ref) => (flatList.current = ref)}
                onContentSizeChange={() =>
                  flatList.current.scrollToEnd({ animated: false })
                }
                onLayout={() =>
                  flatList.current.scrollToEnd({ animated: false })
                }
                data={chatMessages}
                renderItem={(itemData) => {
                  const message = itemData.item;

                  const isOwnMessage = message.sentBy === userData.userId;

                  const messageType = isOwnMessage
                    ? "myMessage"
                    : "theirMessage";

                  return (
                    <Bubble
                      type={messageType}
                      text={message.text}
                      messageId={message.key}
                      userId={userData.userId}
                      chatId={chatId}
                      date={message.sentAt}
                      setReply={() => setReplyingTo(message)}
                      replyingTo={
                        message.replyTo &&
                        chatMessages.find((i) => i.key === message.replyTo)
                      }
                      imageUrl={message.imageUrl}
                    />
                  );
                }}
              />
            )}
          </PageContainer>

          {replyingTo && (
            <ReplyTo
              text={replyingTo.text}
              user={storedUsers[replyingTo.sentBy]}
              onCancel={() => setReplyingTo(null)}
            />
          )}
        </ImageBackground>

        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.mediaButton} onPress={pickImage}>
            <Feather name="plus" size={24} color={colors.blue} />
          </TouchableOpacity>

          <TextInput
            style={styles.textbox}
            value={messageText}
            onChangeText={(text) => setMessageText(text)}
            onSubmitEditing={sendMessage}
          />

          {messageText === "" && (
            <TouchableOpacity style={styles.mediaButton} onPress={takePhoto}>
              <Feather name="camera" size={24} color={colors.blue} />
            </TouchableOpacity>
          )}

          {messageText !== "" && (
            <TouchableOpacity
              style={{ ...styles.mediaButton, ...styles.sendButton }}
              onPress={sendMessage}
            >
              <Feather name="send" size={20} color={"white"} />
            </TouchableOpacity>
          )}

          <AwesomeAlert
            show={tempImageUri !== ""}
            title="Send image?"
            closeOnTouchOutside={true}
            closeOnHardwareBackPress={false}
            showCancelButton={true}
            showConfirmButton={true}
            cancelText="Cancel"
            confirmText="Send image"
            confirmButtonColor={colors.primary}
            cancelButtonColor={colors.red}
            titleStyle={styles.popupTitleStyle}
            onCancelPressed={() => setTempImageUri("")}
            onConfirmPressed={uploadImage}
            onDismiss={() => setTempImageUri("")}
            customView={
              <View>
                {isLoading && (
                  <ActivityIndicator size="small" color={colors.primary} />
                )}
                {!isLoading && tempImageUri !== "" && (
                  <Image
                    source={{ uri: tempImageUri }}
                    style={{ width: 200, height: 200 }}
                  />
                )}
              </View>
            }
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
  },
  screen: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 10,
    height: 50,
  },
  textbox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 50,
    borderColor: colors.lightGrey,
    marginHorizontal: 15,
    paddingHorizontal: 12,
  },
  mediaButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 35,
  },
  sendButton: {
    backgroundColor: colors.blue,
    borderRadius: 50,
    padding: 8,
  },
  popupTitleStyle: {
    fontFamily: "medium",
    letterSpacing: 0.3,
    color: colors.textColor,
  },
});

export default ChatScreen;
