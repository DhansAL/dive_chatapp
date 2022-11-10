import Head from "next/head";
import styled from "styled-components";
import ChatScreen from "../../components/ChatScreen";
import Sidebar from "../../components/Sidebar";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../firebase";
import getRecipientEmail from "../../utils/getRecipientEmail";
import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
function Chat({ chat, messages, chatId }) {
  const [user, loading] = useAuthState(auth);

  const endOfMessagesRef = useRef(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current.scrollIntoView({
      behaviour: "smooth",
      block: "start",
    });
  };

  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     if (!loading && user) {
  //       console.log("updating user");
  //       db.collection("users").doc(user.uid).set(
  //         {
  //           isOnline: true,
  //         },
  //         { merge: true }
  //       );
  //     }
  //   }, 1000);
  //   return () => clearInterval(timer);
  // }, []);

  return (
    <Container>
      <Head>
        <title>
          Chat{" "}
          {getRecipientEmail(chat.users, user) !== undefined
            ? "With " + getRecipientEmail(chat.users, user)
            : ""}
        </title>
      </Head>
      <div className="mdHidden">
        <Sidebar />
      </div>
      <ChatContainer onLoad={scrollToBottom}>
        <ChatScreen chat={chat} messages={messages} chatId={chatId} />
        <EndOfMessage ref={endOfMessagesRef} />
      </ChatContainer>
    </Container>
  );
}

export default Chat;

export async function getServerSideProps(context) {
  const ref = db.collection("chats").doc(context.query.id);

  const messagesRef = await ref
    .collection("messages")
    .orderBy("timestamp", "asc")
    .get();

  const messages = messagesRef.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    .map((messages) => ({
      ...messages,
      timestamp: messages.timestamp.toDate().getTime(),
    }));

  const chatRef = await ref.get();

  const chat = {
    id: chatRef.id,
    ...chatRef.data(),
  };

  return {
    props: {
      messages: JSON.stringify(messages),
      chat: chat,
      chatId: context.query.id
    },
  };
}

const Container = styled.div`
  display: flex;
`;

const ChatContainer = styled.div`
  flex: 1;
  overflow-y: scroll;
  overflow-x: hidden;
  height: 100vh;

  ::-webkit-srollbar {
    display: none;
  }

  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const EndOfMessage = styled.div`
height:5px
`;
