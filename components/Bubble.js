import {
  Image,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import React, { useRef } from "react";
import colors from "../constants/colors";
import {
  Menu,
  MenuTrigger,
  MenuOption,
  MenuOptions,
} from "react-native-popup-menu";
import uuid from "react-native-uuid";
import * as Clipboard from "expo-clipboard";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { starMessage } from "../utils/actions/chatActions";
import { useSelector } from "react-redux";

function formatAmPm(dateString) {
  const date = new Date(dateString);
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes;
  return hours + ":" + minutes + " " + ampm;
  /* return (date.getMonth()+1) + "/" + date.getDate() + "/" + date.getFullYear() + "  " + strTime; */
}

const MenuItem = (props) => {
  const Icon = props.iconPack ?? Feather;
  //if iconpack is paased use it otherwise use Feather icn type.

  return (
    <MenuOption onSelect={props.onSelect}>
      <View style={styles.menuItemContainer}>
        <Text style={styles.menuText}>{props.text}</Text>
        <Icon name={props.icon} size={16} />
      </View>
    </MenuOption>
  );
};

const Bubble = (props) => {
  const {
    text,
    type,
    messageId,
    chatId,
    userId,
    date,
    setReply,
    replyingTo,
    name,
    imageUrl,
  } = props;

  const starredMessages = useSelector(
    (state) => state.messages.starredMessages[chatId] ?? {}
  ); //remember to include chatId else all starred messages and not only those reated to this chat will be opened.

  //console.log(JSON.stringify(starredMessages, null, 4));

  const storedUsers = useSelector((state) => state.users.storedUsers);

  const bubbleStyle = { ...styles.container };
  const textStyle = { ...styles.text };
  const wrapperStyle = { ...styles.wrapperStyle };

  const menuRef = useRef(null);

  //set up each chat log pressed with id
  const id = useRef(uuid.v4());
  //using useRef ensure that once the id is setup it reamin in place throughout the ve time of the element ie. each chat long pressed on. if we have done const id = uuid.ve that will generate new id wverything the screen renders.

  //USEREF remembers vaue and kee them in exsitence for the life time of the element.

  //console.log(id.current);

  let Container = View;

  let isUserMessage = false;

  const dateString = date && formatAmPm(date);

  switch (type) {
    case "system":
      textStyle.color = "#65644A";
      bubbleStyle.backgroundColor = colors.beige;
      bubbleStyle.alignItems = "center";
      bubbleStyle.marginTop = 10;
      break;
    case "error":
      bubbleStyle.backgroundColor = "red";
      textStyle.color = "white";
      bubbleStyle.marginTop = 10;
      break;
    case "myMessage":
      wrapperStyle.justifyContent = "flex-end";
      bubbleStyle.backgroundColor = "#E7FED6";
      bubbleStyle.maxWidh = "90%";
      Container = TouchableWithoutFeedback;
      isUserMessage = true;
      break;
    case "theirMessage":
      wrapperStyle.justifyContent = "flex-start";
      Container = TouchableWithoutFeedback;
      isUserMessage = true;
      break;
    case "reply":
      bubbleStyle.backgroundColor = "pink"; //#f2f2f2
      break;

    default:
      break;
  }

  const copyToClipboard = async () => {
    try {
      await Clipboard.setStringAsync(text);
    } catch (err) {
      console.log(err);
    }
  };

  let isStarred = isUserMessage && starredMessages[messageId] !== undefined;
  const replyingToUser = replyingTo && storedUsers[replyingTo.sendBy]; //ths pulls the userId of the person the message is replied to.

  //console.log("isStarred = ", isStarred);

  return (
    <View style={wrapperStyle}>
      <Container
        onLongPress={() =>
          menuRef.current.props.ctx.menuActions.openMenu(id.current)
        }
        style={{ width: "100%" }}
      >
        <View style={bubbleStyle}>
          {name && <Text style={styles.name}>{name}</Text>}
          {replyingToUser && (
            <Bubble
              type="reply"
              text={replyingTo.text}
              name={`${replyingToUser.firstName} ${replyingToUser.lastName}`}
            />
          )}
          {!imageUrl && <Text styles={textStyle}>{text}</Text>}

          {imageUrl && (
            <Image source={{ uri: imageUrl }} style={styles.image} />
          )}
          {dateString && (
            <View style={styles.timeContainer}>
              {isStarred && (
                <FontAwesome
                  name="star"
                  size={14}
                  color={colors.textColor}
                  style={{ marginRight: 5 }}
                />
              )}
              <Text style={styles.time}>{dateString}</Text>
            </View>
          )}
          <Menu name={id.current} ref={menuRef}>
            <MenuTrigger />
            <MenuOptions>
              <MenuItem
                text="copy to clipboard"
                icon={"copy"}
                onSelect={() => copyToClipboard(text)}
              />
              <MenuItem
                text={`${isStarred ? "Unstar" : "Star"} message`}
                icon={isStarred ? "star-o" : "star"}
                iconPack={FontAwesome}
                onSelect={() => starMessage(messageId, chatId, userId)}
              />
              <MenuItem
                text="Reply"
                icon="reply"
                iconPack={FontAwesome}
                onSelect={setReply}
              />
            </MenuOptions>
          </Menu>
        </View>
      </Container>
    </View>
  );
};

export default Bubble;

const styles = StyleSheet.create({
  wrapperStyle: {
    flexDirection: "row",
    justifyContent: "center",
  },
  text: {
    fontFamily: "regular",
    letterSpacing: 0.3,
  },
  container: {
    backgroundColor: "white",
    borderRadius: 6,
    padding: 5,
    marginBottom: 10,
    borderColor: "#E2DACC",
    borderWidth: 1,
  },
  menuItemContainer: {
    flexDirection: "row",
    paddingTop: 3,
  },
  menuText: {
    flex: 1,
    fontFamily: "regular",
    letterSpacing: 0.3,
    fontSize: 16,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  time: {
    fontFamily: "regular",
    letterSpacing: 0.3,
    fontSize: 12,
    color: colors.gray,
  },
  name: {
    fontFamily: "medium",
    letterSpacing: 0.3,
  },
  image: {
    width: 300,
    height: 300,
    marginBottom: 5,
  },
});
