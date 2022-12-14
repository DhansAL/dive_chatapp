import styled from "styled-components";
import Message from "./Message";
import TimeAgo from "timeago-react";
import firebase from "firebase";
import getRecipientEmail from "../utils/getRecipientEmail";
import "emoji-mart/css/emoji-mart.css";
import UIfx from "uifx";
// import moment from 'moment';
import InsertEmoticonIcon from "@material-ui/icons/InsertEmoticon";
import StopRoundedIcon from "@material-ui/icons/StopRounded";
import SendRoundedIcon from "@material-ui/icons/SendRounded";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import MicIcon from "@material-ui/icons/Mic";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";
import { auth, db } from "../firebase";
import { useRouter } from "next/dist/client/router";
import { Avatar, IconButton } from "@material-ui/core";
import { useState, useRef, useEffect } from "react";
import { Picker } from "emoji-mart";
import HomeOutlinedIcon from "@material-ui/icons/HomeOutlined";
import Router from "next/router";
import moment from "moment";

function ChatScreen({ chat, messages, chatId }) {

  let emojiPicker;

  const inputElement = document.getElementById("inputField");

  const [emojiPickerState, SetEmojiPicker] = useState(false);

  const [user] = useAuthState(auth);

  const [input, setInput] = useState("");

  const endOfMessagesRef = useRef(null);
  const lastmessageRef = useRef(null);
  const lastSeenDivRef = useRef(null);

  const router = useRouter();

  const [messagesSnapshot] = useCollection(
    db
      .collection("chats")
      .doc(router.query.id)
      .collection("messages")
      .orderBy("timestamp", "asc")
  );

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.isIntersecting) {
        db.collection("chats").doc(chatId).collection("messages").get().then(function (messageSnapshot) {
          messageSnapshot.forEach(function (doc) {
            let messageData = doc.data()
            // whoever recieved is reading latest message, UPDATE all previous messages to "read"
            if (user.email !== messageData.user) {
              doc.ref.update({ message_state: "READ" }, { merge: true })
            }

          })
        })
        // db.collection("chats").get().then(function (querySnapshot) {
        //   querySnapshot.forEach(function (doc) {
        //     let chatdata = doc.data()
        //     // find the targeted chat
        //     if (chatdata.users[1] === chat.users[1]) {
        //       if (user.email === chat.users[0]) {
        //         // chat owner
        //         doc.ref.update({ chatOwnerSeenAll: true }, { merge: true })
        //       }
        //       if (user.email === chat.users[1]) {
        //         //recipient
        //         doc.ref.update({ chatRecipientSeenll: true }, { merge: true })
        //       }
        //     }
        //   })
        // })
      } else {
        // db.collection("chats").get().then(function (querySnapshot) {
        //   querySnapshot.forEach(function (doc) {
        //     let chatdata = doc.data()
        //     if (chatdata.users[1] === chat.users[1]) {
        //       if (user.email === chat.users[0]) {
        //         // chat owner
        //         doc.ref.update({ chatOwnerSeenAll: false }, { merge: true })
        //       }
        //       if (user.email === chat.users[1]) {
        //         //recipient
        //         doc.ref.update({ chatRecipientSeenll: false }, { merge: true })
        //       }
        //     }
        //   })
        // })
      }
    });
    observer.observe(lastmessageRef.current);

  }, [lastmessageRef, messagesSnapshot]);

  const [recipientSnapshot] = useCollection(
    db
      .collection("users")
      .where("email", "==", getRecipientEmail(chat.users, user))
  );

  if (emojiPickerState) {
    emojiPicker = (
      <Picker
        title="Pick your emoji . . . "
        emoji="point_up"
        onSelect={(emoji) => setInput(input + emoji.native)}
      />
    );
  }

  function triggerPicker(event) {
    event.preventDefault();
    SetEmojiPicker(!emojiPickerState);
    if (emojiPickerState) {
      document.getElementById("inputField").focus();
    } else {
      document.getElementById("inputField").blur();
    }
  }



  const showMessages = () => {
    if (messagesSnapshot) {
      return messagesSnapshot.docs.map((message) => (
        <>
          <Message
            key={message.id}
            user={message.data().user}
            message={{
              ...message.data(),
              timestamp: message.data().timestamp?.toDate().getTime(),
            }}
          />

        </>
      ));
    } else {
      return JSON.parse(messages).map((message) => (
        <Message key={message.id} user={message.user} message={message} />
      ));
    }
  };

  const scrollToBottom = () => {
    endOfMessagesRef.current.scrollIntoView({
      behaviour: "smooth",
      block: "start",
    });
  };

  const recipient = recipientSnapshot?.docs?.[0]?.data();
  const recipientEmail = getRecipientEmail(chat.users, user);
  const surname = recipientEmail.split("@");

  const sendMessage = (e) => {
    e.preventDefault();
    db.collection("users").doc(user.uid).set(
      {
        lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    //----

    db.collection("chats").doc(router.query.id).collection("messages").add({
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      message: input,
      user: user.email,
      message_state: recipient.isOnline ? "DELIVERED" : "SENT",
      photoURL: user.photoURL,
    });
    playMessageSentSound();
    setInput("");
    scrollToBottom();
  };




  const playMessageSentSound = () => {
    const sm = new UIfx("/send message.mp3");
    sm.play();
  };

  const openMenu = () => {
    const menu = document.querySelector(".mc");
    const compStyles = getComputedStyle(menu);

    if (compStyles.display === "none") {
      menu.style.display = "flex";
      menu.style.justifyContent = "center";
      menu.style.alignItems = "center";
    } else {
      menu.style.display = "none";
    }
  };

  const deleteChat = async () => {
    db.collection("chats")
      .doc(`${chat.id}`)
      .delete()
      .then(() => {
      })
      .catch((error) => {
        alert("Error removing chat: ", error);
      });

    router.push(`/`);
  };




  return (
    <Container>
      <Header>
        {recipient ? (
          <Avatar src={recipient?.photoURL} />
        ) : (
          <Avatar>{recipientEmail[0]}</Avatar>
        )}

        <HeaderInfo>
          <h3>{surname[0]}</h3>
          {/* <Typing>
            {temp === true && TypeOfMessage !== 'Sender' ? 'Typing...' : ''}
          </Typing> */}
          {recipientSnapshot ? (
            <p ref={lastSeenDivRef}>
              Last Active:{" "}

              {recipient?.isOnline ? "Online" :


                recipient?.lastSeen?.toDate() ? (
                  <TimeAgo datetime={recipient?.lastSeen?.toDate()} />
                ) : (
                  "Unavailable"
                )}
            </p>
          ) : (
            <p>Loading Last Active...</p>
          )}
        </HeaderInfo>
        <HeaderIcons>
          <IconButton
            onClick={() => {
              Router.replace("/");
            }}
          >
            <HomeOutlinedIcon style={{ fontSize: 25 }} />
          </IconButton>
          <IconButton>
            <AttachFileIcon style={{ fontSize: 25 }} />
          </IconButton>
          <IconButton onClick={openMenu}>
            <MoreVertIcon style={{ fontSize: 25 }} />
          </IconButton>
        </HeaderIcons>
      </Header>

      <MessageContainer>
        {showMessages()}
        <div style={{ height: "0px" }} ref={lastmessageRef}>-</div>
        <EndOfMessage ref={endOfMessagesRef} />
      </MessageContainer>

      <InputContainer >
        <IconContainer>{emojiPicker}</IconContainer>
        <IconButton onClick={triggerPicker}>
          <InsertEmoticonIcon
            style={{ fontSize: 25 }}
          // onMouseLeave={triggerPicker1}
          />
        </IconButton>
        <Input
          // maxLength="75"
          id="inputField"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          // onKeyDown={() => setTemp(true)}
          // onKeyUp={() => setTimeout(() => setTemp(false), 3100)}
          // onKeyDown={(e) => checkLength_and_CreateNewLine(e.target.value)}
          placeholder="Type a message..."
          autoFocus
        />
        <button hidden disabled={!input} type="submit" onClick={sendMessage}>
          Send Message
        </button>
        {input == "" ? (
          <>
          </>
        ) : (
          <IconButton onClick={sendMessage}>
            <SendRoundedIcon style={{ fontSize: 25 }} />
          </IconButton>
        )}
      </InputContainer>
      <MenuContainer className="mc" onClick={deleteChat}>
        <p>Delete Chat</p>
      </MenuContainer>
    </Container>
  );
}

export default ChatScreen;

const Container = styled.div``;

const Header = styled.div`
  position: sticky;
  background-color: #fff;
  z-index: 100;
  top: 0;
  display: flex;
  padding: 1.1rem;
  height: 7rem;
  align-items: center;
  border-bottom: 1px solid whitesmoke;
`;

const HeaderInfo = styled.div`
  margin-left: 1.5rem;
  flex: 1;

  > h3 {
    margin-bottom: 0.3rem;
    color: #495057;
    font-size: 1.35rem;
  }

  > p {
    font-size: 1.2rem;
    color: gray;
  }
`;

const EndOfMessage = styled.div`
  margin-bottom: 6.5rem;
`;

const HeaderIcons = styled.div``;

const MessageContainer = styled.div`
  padding: 3rem;
  background-color: #e5ded8;
  min-height: 90vh;
  position: relative;
`;

const InputContainer = styled.form`
  display: flex;
  align-items: center;
  padding: 1rem;
  position: sticky;
  bottom: 0;
  background-color: #fff;
  z-index: 100;
`;

const Input = styled.input`
  flex: 1;
  border: none;
  outline: none;
  border-radius: 3rem;
  align-items: center;
  padding: 1.3rem 3rem 1.3rem 1.3rem;
  font-size: 1.55rem;
  margin-left: 1.5rem;
  margin-right: 1.5rem;
  background-color: whitesmoke;
  inline-size: min-content;
`;

const Typing = styled.div`
  color: #25d366;
  font-weight: bold;
  font-size: 1.3rem;
  /* margin: 0.2rem 0; */
`;

const IconContainer = styled.div`
  position: absolute;
  top: -45rem;
  left: 2rem;
  right: 0;
`;

const MenuContainer = styled.div`
  height: 3rem;
  width: 11rem;
  cursor: pointer;
  background-color: #fff;
  padding: 1rem;
  font-size: 1.45rem;
  z-index: 1000;
  box-shadow: 0px 4px 10px -3px rgba(0, 0, 0, 0.7);
  position: absolute;
  top: 5.5rem;
  right: 4.5rem;
  border-radius: 0.7rem;
  display: none;
`;
