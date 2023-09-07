/* import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import CustomHeaderButton from "../components/CustomHeaderButton";
import { useSelector } from "react-redux";
import DataItem from "../components/DataItem";
import PageContainer from "../components/PageContainer";
import PageTitle from "../components/PageTitle";
import colors from "../constants/colors";

const ChatListScreen = (props) => {
  //Use the route.params to capture the id of the selected user
  const selectedUser = props.route?.params?.selectedUserId;
  const selectedUsersList = props.route?.params?.selectedUsers;
  const chatName = props.route?.params?.chatName;

  //Capture the is of the loggedin user to include in the charts
  const userData = useSelector((state) => state.auth.userData);
  const storedUsers = useSelector((state) => state.users.storedUsers);
  const userChats = useSelector((state) => {
    const chatsData = state.chats.chatsData;
    return Object.values(chatsData).sort((a, b) => {
      return new Date(b.updatedAt) - new Date(a.updatedAt); //returned sorted lsit with latest at the top
    });
  });
  //Note that using useSelector is symnomimous to using useState but for redux state decared in a store

  //console.log(JSON.stringify(userChats, null, 4));

  //console.log(JSON.stringify(storedUsers, null, 4));

  useEffect(() => {
    props.navigation.setOptions({
      headerRight: () => {
        return (
          <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
            <Item
              title="New chat"
              iconName="create-outline"
              onPress={() => props.navigation.navigate("NewChat")}
            />
          </HeaderButtons>
        );
      },
    });
  }, []);

  //Navigate to chatscreen involving loggedin and user selected from the newchat/chatlist/search screen
  useEffect(() => {
    if (!selectedUser && !selectedUsersList) return;

    let chatData;
    let navigationProps;

    if (selectedUser) {
      chatData = userChats.find(
        (cd) => !cd.isGroupChat && cd.users.includes(selectedUser)
      );
    }

    if (chatData) {
      navigationProps = { chatId: chatData.key };
    } else {
      const chatUsers = selectedUsersList || [selectedUser]; //, userData.userId

      if (!chatUsers.includes(userData.userId)) {
        chatUsers.push(userData.userId); //this is to inludes ourself in the user list if not already there.
      }

      navigationProps = {
        newChatData: {
          users: chatUsers,
          isGroupChat: selectedUsersList !== undefined,
          chatName,
        },
      }; //newChatData as node of chatUsers
    }

    props.navigation.navigate("ChatScreen", navigationProps);
  }, [props.route?.params]);
  //selectedUser wasuse as dependency before but it did not rrender the chatscreen on repress this is due to the no change in dependency as selectedUser remains the same.

  return (
    <PageContainer>
      <PageTitle text="Chats" />
      <View>
        <TouchableOpacity
          onPress={() =>
            props.navigation.navigate("NewChat", { isGroupChat: true })
          }
        >
          <Text style={styles.newGroupText}>New Group</Text>
        </TouchableOpacity>
        {/* pls is to use the isGroupChat beig truth to format the destination screen accordingly. *
      </View>
      <FlatList
        data={userChats}
        renderItem={(itemData) => {
          //Usually data in flatlist is an array but this is an object of objects.
          //The solution is to redeclare the userChats object as an object of object.. see the relevantt useSelector line above

          const chatData = itemData.item;
          //console.log(JSON.stringify(chatData, null, 4));
          const chatId = chatData.key;
          const otherUserId = chatData.users.find(
            (uid) => uid !== userData.userId
          );

          //console.log(otherUserId);

          const otherUser = storedUsers[otherUserId];

          if (!otherUser) return;

          const title = `${otherUser.firstName} ${otherUser.lastName}`;
          const subTitle = chatData.latestMessageText || "New chat";
          const image = otherUser.profilePicture;

          return (
            <DataItem
              title={title}
              subTitle={subTitle}
              image={image}
              onPress={() =>
                props.navigation.navigate("ChatScreen", { chatId })
              }
            />
          );
        }}
      />
    </PageContainer>
  );
};

export default ChatListScreen;

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
  newGroupText: {
    color: colors.blue,
    fontSize: 17,
    marginBottom: 5,
  },
}); */

import React, { useEffect } from "react";
import { View, Text, StyleSheet, Button, FlatList } from "react-native";
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import { useSelector } from "react-redux";
import CustomHeaderButton from "../components/CustomHeaderButton";
import DataItem from "../components/DataItem";
import PageContainer from "../components/PageContainer";
import PageTitle from "../components/PageTitle";

const ChatListScreen = (props) => {
  const selectedUser = props.route?.params?.selectedUserId;

  const userData = useSelector((state) => state.auth.userData);
  const storedUsers = useSelector((state) => state.users.storedUsers);
  const userChats = useSelector((state) => {
    const chatsData = state.chats.chatsData;
    return Object.values(chatsData).sort((a, b) => {
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
  });

  useEffect(() => {
    props.navigation.setOptions({
      headerRight: () => {
        return (
          <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
            <Item
              title="New chat"
              iconName="create-outline"
              onPress={() => props.navigation.navigate("NewChat")}
            />
          </HeaderButtons>
        );
      },
    });
  }, []);

  useEffect(() => {
    if (!selectedUser) {
      return;
    }

    const chatUsers = [selectedUser, userData.userId];

    const navigationProps = {
      newChatData: { users: chatUsers },
    };

    props.navigation.navigate("ChatScreen", navigationProps);
  }, [props.route?.params]);

  return (
    <PageContainer>
      <PageTitle text="Chats" />

      <FlatList
        data={userChats}
        renderItem={(itemData) => {
          const chatData = itemData.item;
          const chatId = chatData.key;

          const otherUserId = chatData.users.find(
            (uid) => uid !== userData.userId
          );
          const otherUser = storedUsers[otherUserId];

          if (!otherUser) return;

          const title = `${otherUser.firstName} ${otherUser.lastName}`;
          const subTitle = chatData.latestMessageText || "New chat";
          const image = otherUser.profilePicture;

          return (
            <DataItem
              title={title}
              subTitle={subTitle}
              image={image}
              onPress={() =>
                props.navigation.navigate("ChatScreen", { chatId })
              }
            />
          );
        }}
      />
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ChatListScreen;
