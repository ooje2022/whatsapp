/* import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  TextInput,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import CustomHeaderButton from "../components/CustomHeaderButton";
import { FontAwesome } from "@expo/vector-icons";
import colors from "../constants/colors";
import PageContainer from "../components/PageContainer";
import commonStyles from "../constants/commonStyles";
import { searchUsers } from "../utils/actions/userActions";
import DataItem from "../components/DataItem";
import { useDispatch, useSelector } from "react-redux";
import { setStoredUsers } from "../store/userSlice";
import ProfileImage from "../components/ProfileImage";

const NewChatScreen = (props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState();
  const [noResultsFound, setNoResultsFound] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [chatName, setChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const storedUsers = useSelector((state) => state.users.storedUsers);

  const userData = useSelector((state) => state.auth.userData);

  const selectedUsersFlatList = useRef();

  const dispatch = useDispatch();

  const isGroupChat = props.route.params && props.route.params.isGroupChat;

  const isGroupChatDisabled = selectedUsers.length === 0 || chatName === "";

  useEffect(() => {
    props.navigation.setOptions({
      headerLeft: () => {
        return (
          <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
            <Item title="Close" onPress={() => props.navigation.goBack()} />
          </HeaderButtons>
        );
      },
      headerRight: () => {
        return (
          <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
            {isGroupChat && (
              <Item
                title="Create"
                disabled={isGroupChatDisabled}
                color={isGroupChatDisabled ? colors.lightGray : undefined}
                onPress={() => {
                  props.navigation.navigate("ChatList", {
                    selectedUsers,
                    chatName,
                  });
                }}
              />
            )}
          </HeaderButtons>
        );
      },
      headerTitle: isGroupChat ? "New Group" : "New chat",
    });
    // <Text style={{ alignItems: "flex-start" }}>
    //   {isGroupChat ? "Add participants" : ""}
    // </Text>;
  }, [chatName, selectedUsers]);

  //Initiate seach s soon as user type in the search box
  useEffect(() => {
    //initiate search after 0.5sec delay
    const delaySearch = setTimeout(async () => {
      if (!searchTerm || searchTerm === "") {
        //when there is no entry in search term that is NOT no result found. Its a empty search hence the noResultFound is set to false NOT true
        setUsers();
        setNoResultsFound(false);
        return;
      }
      //console.log("Hello");
      setIsLoading(true);

      const usersResult = await searchUsers(searchTerm);

      //remove the loggedin usser from the search result
      delete usersResult[userData.userId];

      //console.log(usersResult);
      setUsers(usersResult);

      if (Object.keys(usersResult).length === 0) {
        setNoResultsFound(true);
      } else {
        setNoResultsFound(false);

        dispatch(setStoredUsers({ newUsers: usersResult }));
      }

      setIsLoading(false);
    }, 500);
    return () => clearTimeout(delaySearch);
    //clearTime out included nuisance search that want to restart every hald second. so instead it wait until user finihs his each (as ong as the delay between his punching of letters ins ess than half seconds).
  }, [searchTerm]);

  const userPressed = (userId) => {
    if (isGroupChat) {
      const newSelectedUsers = selectedUsers.includes(userId)
        ? selectedUsers.filter((id) => id !== userId)
        : selectedUsers.concat(userId);
      //.concat is referred for state modification not push for states that hold array objects. concat will return new array rather that modify existing state.
      //The code above select a user when pressed and deselect when pressed again.

      setSelectedUsers(newSelectedUsers);
    } else {
      props.navigation.navigate("ChatList", { selectedUserId: userId });
    }
  };

  return (
    <PageContainer>
      {isGroupChat && (
        <>
          <View style={styles.chatNameContainer}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textBox}
                placeholder="Enter a name for your chat"
                autoCorrect={false}
                autoComplete="off"
                onChangeText={(text) => setChatName(text)}
              />
            </View>
          </View>
          <View style={styles.selectedUsersContainer}>
            <FlatList
              stye={styles.selectedUserList}
              data={selectedUsers}
              horizontal={true}
              contentContainerStyle={{ alignItems: "center" }}
              ref={(ref) => (selectedUsersFlatList.current = ref)}
              onContentSizeChange={() =>
                selectedUsersFlatList.current.scrollToEnd()
              }
              keyExtractor={(item) => item} //item is our data which is userId which is good enough as key hence the item => item otherwise it would have been item => item.userId is our item had been an object.
              renderItem={(itemData) => {
                const userId = itemData.item;
                const userData = storedUsers[userId];
                return (
                  <ProfileImage
                    size={40}
                    uri={userData.profilePicture}
                    onPress={() => userPressed(userId)}
                    showRemoveButton={true}
                    style={styles.selectedUserStyle}
                  />
                );
              }}
            />
          </View>
        </>
      )}
      <View style={styles.searchContainer}>
        <FontAwesome name="search" size={25} color={colors.lightGray} />
        <TextInput
          placeholder="search"
          style={styles.searchBox}
          onChangeText={(text) => {
            setSearchTerm(text);
          }}
        />
      </View>
      {isLoading && (
        <View style={commonStyles.center}>
          <ActivityIndicator size={"large"} color={colors.primary} />
        </View>
      )}
      {!isLoading && !noResultsFound && users && (
        <FlatList
          data={Object.keys(users)}
          renderItem={(itemData) => {
            const userId = itemData.item;
            const userData = users[userId];
            return (
              <DataItem
                title={`${userData.firstName} ${userData.lastName}`}
                subTitle={`${userData.about}`}
                image={userData.profilePicture}
                onPress={() => userPressed(userId)}
                type={isGroupChat ? "checkbox" : ""}
                isChecked={selectedUsers.includes(userId)}
              />
            );
          }}
        />
      )}
      {!isLoading && noResultsFound && (
        <View style={commonStyles.center}>
          <FontAwesome
            name="question"
            size={75}
            color={colors.lightGray}
            style={styles.noResultsIcon}
          />
          <Text style={styles.noResultsText}>No users found.</Text>
        </View>
      )}

      {!isLoading && !users && (
        <View style={commonStyles.center}>
          <FontAwesome
            name="users"
            size={75}
            color={colors.lightGray}
            style={styles.noResultsIcon}
          />
          <Text style={styles.noResultsText}>
            Enter a name to search for a user.
          </Text>
        </View>
      )}
    </PageContainer>
  );
};

export default NewChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  label: {
    color: "black",
    fontSize: 18,
    fontFamily: "regular",
  },
  searchContainer: {
    flexDirection: "row",
    backgroundColor: colors.extraLightGray,
    alignItems: "center",
    height: 35,
    marginVertical: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 5,
  },
  searchBox: {
    marginLeft: 8,
    fontSize: 15,
    width: "100%",
  },
  noResultsText: {
    color: colors.textColor,
    fontFamily: "regular",
    letterSpacing: 0.3,
  },
  noResultsIcon: {
    marginBottom: 20,
  },
  chatNameContainer: {
    paddingVertical: 10,
  },
  inputContainer: {
    width: "100%",
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: colors.nearlyWhite,
    flexDirection: "row",
    borderRadius: 2,
  },
  textBox: {
    color: colors.textBox,
    width: "100%",
    fontFamily: "regular",
    letterSpacing: 0.3,
  },
  selectedUsersContainer: {
    height: 50,
    justifyContent: "center",
  },
  selectedUsersList: {
    height: "100%",
    paddingTop: 10,
  },
  selectedUserStyle: {
    marginRight: 10,
  },
});
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  TextInput,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import CustomHeaderButton from "../components/CustomHeaderButton";
import PageContainer from "../components/PageContainer";
import { FontAwesome } from "@expo/vector-icons";
import colors from "../constants/colors";
import commonStyles from "../constants/commonStyles";
import { searchUsers } from "../utils/actions/userActions";
import DataItem from "../components/DataItem";
import { useDispatch, useSelector } from "react-redux";
import { setStoredUsers } from "../store/userSlice";

const NewChatScreen = (props) => {
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState();
  const [noResultsFound, setNoResultsFound] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const userData = useSelector((state) => state.auth.userData);

  useEffect(() => {
    props.navigation.setOptions({
      headerLeft: () => {
        return (
          <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
            <Item title="Close" onPress={() => props.navigation.goBack()} />
          </HeaderButtons>
        );
      },
      headerTitle: "New chat",
    });
  }, []);

  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (!searchTerm || searchTerm === "") {
        setUsers();
        setNoResultsFound(false);
        return;
      }

      setIsLoading(true);

      const usersResult = await searchUsers(searchTerm);
      delete usersResult[userData.userId];
      setUsers(usersResult);

      if (Object.keys(usersResult).length === 0) {
        setNoResultsFound(true);
      } else {
        setNoResultsFound(false);

        dispatch(setStoredUsers({ newUsers: usersResult }));
      }

      setIsLoading(false);
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  const userPressed = (userId) => {
    props.navigation.navigate("ChatList", {
      selectedUserId: userId,
    });
  };

  return (
    <PageContainer>
      <View style={styles.searchContainer}>
        <FontAwesome name="search" size={15} color={colors.lightGrey} />

        <TextInput
          placeholder="Search"
          style={styles.searchBox}
          onChangeText={(text) => setSearchTerm(text)}
        />
      </View>

      {isLoading && (
        <View style={commonStyles.center}>
          <ActivityIndicator size={"large"} color={colors.primary} />
        </View>
      )}

      {!isLoading && !noResultsFound && users && (
        <FlatList
          data={Object.keys(users)}
          renderItem={(itemData) => {
            const userId = itemData.item;
            const userData = users[userId];

            return (
              <DataItem
                title={`${userData.firstName} ${userData.lastName}`}
                subTitle={userData.about}
                image={userData.profilePicture}
                onPress={() => userPressed(userId)}
              />
            );
          }}
        />
      )}

      {!isLoading && noResultsFound && (
        <View style={commonStyles.center}>
          <FontAwesome
            name="question"
            size={55}
            color={colors.lightGrey}
            style={styles.noResultsIcon}
          />
          <Text style={styles.noResultsText}>No users found!</Text>
        </View>
      )}

      {!isLoading && !users && (
        <View style={commonStyles.center}>
          <FontAwesome
            name="users"
            size={55}
            color={colors.lightGrey}
            style={styles.noResultsIcon}
          />
          <Text style={styles.noResultsText}>
            Enter a name to search for a user!
          </Text>
        </View>
      )}
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.extraLightGrey,
    height: 30,
    marginVertical: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 5,
  },
  searchBox: {
    marginLeft: 8,
    fontSize: 15,
    width: "100%",
  },
  noResultsIcon: {
    marginBottom: 20,
  },
  noResultsText: {
    color: colors.textColor,
    fontFamily: "regular",
    letterSpacing: 0.3,
  },
});

export default NewChatScreen;
