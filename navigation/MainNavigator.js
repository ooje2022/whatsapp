import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import SettingsScreen from "../screens/SettingsScreen";
import ChatListScreen from "../screens/ChatListScreen";
import ChatSettingScreen from "../screens/ChatSettingScreen";
import ChatScreen from "../screens/ChatScreen";
import NewChatScreen from "../screens/NewChatScreen";
import { useDispatch, useSelector } from "react-redux";
import { getFirebaseApp } from "../utils/firebaseHelper";
import { child, get, getDatabase, off, onValue, ref } from "firebase/database";
import { setChatsData } from "../store/chatSlice";
import colors from "../constants/colors";
import commonStyles from "../constants/commonStyles";
import { setStoredUsers } from "../store/userSlice";
import { setChatMessages, setStarredMessages } from "../store/messagesSlice";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerTitle: "",
        headerShadowVisible: false,
      }}
    >
      <Tab.Screen
        name="ChatList"
        component={ChatListScreen}
        options={{
          tabBarLabel: "Chats",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-outline" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const StackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Group>
        <Stack.Screen
          name="Home"
          component={TabNavigator}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ChatScreen"
          component={ChatScreen}
          options={{
            headerTitle: "",
          }}
        />
        <Stack.Screen
          name="ChatSettings"
          component={ChatSettingScreen}
          options={{
            headerTitle: "Settings",
          }}
        />
      </Stack.Group>
      <Stack.Group screenOptions={{ presentation: "modal" }}>
        <Stack.Screen name="NewChat" component={NewChatScreen} />
      </Stack.Group>
    </Stack.Navigator>
  );
};

const MainNavigator = (props) => {
  const userData = useSelector((state) => state.auth.userData);
  const storedUsers = useSelector((state) => state.users.storedUsers);

  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(true);

  //Retreive \userchat from database
  useEffect(() => {
    console.log("Subscribing to firebase listeners");

    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));

    const userChatsRef = child(dbRef, `userChats/${userData.userId}`); //use the loggedin user id to pull all his prior chats

    const refs = [userChatsRef];

    onValue(userChatsRef, (querySnapshot) => {
      //console.log(querySnapshot.val());

      //retrivev user chat data
      const chatIdsData = querySnapshot.val() || {};
      const chatIds = Object.values(chatIdsData);

      const chatsData = {};
      let chatsFoundCount = 0;
      for (let i = 0; i < chatIds.length; i++) {
        const chatId = chatIds[i];
        const chatRef = child(dbRef, `chats/${chatId}`); //accssing the chat node using the chatId retrieved from the userChats node

        refs.push(chatRef); //adding chatRef to list of Refs array - listners services to unsubcribed.

        onValue(chatRef, (chatSnapshot) => {
          chatsFoundCount++;
          //console.log(chatSnapshot.val());

          const data = chatSnapshot.val();

          if (data) {
            data.key = chatSnapshot.key; //change data key to the snapshot key

            //iteraret over the users array to itemize the userId
            data.users.forEach((userId) => {
              if (storedUsers[userId]) return;
              //Aboove means the storedUsers array has the target userId which is the loggedin user is then the storedUsers already oggedin data

              //if otherwise add the userId t the storedUsers list
              const userRef = child(dbRef, `users/${userId}`);

              get(userRef).then((userSnashot) => {
                const userSnapshotData = userSnashot.val();
                dispatch(setStoredUsers({ newUsers: { userSnapshotData } }));
                //Note the extra curly brace on the userSbapshot this is sue to the way the users wa declared in the userSlice.
                //Note also tat unlike onValue, get returns a promise hence the .then()
              });

              refs.push(userRef);
            });

            //Load the data into the chatData object
            chatsData[chatSnapshot.key] = data;
          }

          if (chatsFoundCount >= chatIds.length) {
            //This means all chats are loaded into the chatsData object and action is ready to be dispatched to the state to change chat
            dispatch(setChatsData({ chatsData }));
            setIsLoading(false);
          }
        });

        //==============RETRIEVE ALL MESSAGE AN PUT THEM ON STATE ====================

        const messagesRef = child(dbRef, `messages/${chatId}`);
        refs.push(messagesRef);

        onValue(messagesRef, (messagesSnapshot) => {
          const messagesData = messagesSnapshot.val();
          //Dispatch action to mesagesReducer which we created in messagesSlice module
          dispatch(setChatMessages({ chatId, messagesData }));
        });

        //
        if (chatsFoundCount === 0) {
          setIsLoading(false);
        }
      }

      //retrieve the user chat id
      //console.log(chatIds);
    });

    //RETRIEVE ALL STARRED MESSAGES FOR A USER
    const userStarredMessagesRef = child(
      dbRef,
      `userStarredMessages/${userData.userId}`
    );
    refs.push(userStarredMessagesRef);

    onValue(userStarredMessagesRef, (querySnapshot) => {
      const starredMessages = querySnapshot.val() ?? {};
      dispatch(setStarredMessages({ starredMessages }));
    });

    //Unsubscribing from the listener
    return () => {
      console.log("Unsubscribing firebase listeners");
      refs.forEach((ref) => off(ref));
    };
  }, []);

  if (!isLoading) {
    <View>
      <ActivityIndicator
        size={"large"}
        color={colors.primary}
        style={commonStyles.center}
      />
    </View>;
  }
  return <StackNavigator />;
};

export default MainNavigator;

const styles = StyleSheet.create({});
