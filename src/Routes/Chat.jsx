import React, { useState, useEffect, useRef, useContext } from "react";
import { firestore, auth } from "../FireBase";
import { Avatar, HStack, Stack, Box } from "@chakra-ui/react";
import { collection, orderBy, onSnapshot, query } from "firebase/firestore";
import Header from "../components/Header";
import SendMsg from "../components/SendMsg";
import { useTitle } from "react-haiku";
import AppContext from "../context/AppContext";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const scroll = useRef();
  const users = useContext(AppContext);
  useTitle("Chat App | Chats");

  const formatDate = (currentDate) => {
    return currentDate.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  useEffect(() => {
    const q = query(
      collection(firestore, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe1 = onSnapshot(q, (snapshot) => {
      const docs = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        docs.push({
          id: doc.id,
          message: data.message,
          uid: data.uid,
          name: data.name,
          createdAt: data.createdAt,
        });
      });
      setMessages(docs);
    });

    return () => {
      unsubscribe1();
    };
  }, []);

  useEffect(() => {
    scroll.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  let previousDate = null;
  const today = new Date().toLocaleDateString("en-US");

  return (
    <>
      <Header />
      <Stack my="75px">
        {messages.map(({ message, uid, name, id, createdAt }) => {
          const currentDate =
            createdAt && createdAt.seconds
              ? new Date(createdAt.seconds * 1000)
              : null;
          const displayDate =
            currentDate &&
            (previousDate &&
            previousDate.toDateString() === currentDate.toDateString()
              ? null
              : currentDate.toLocaleDateString("en-US") === today
              ? "Today"
              : formatDate(currentDate));

          previousDate = currentDate;

          return (
            <Box key={id}>
              {displayDate && (
                <Box
                  my={2}
                  p={2}
                  mx={"auto"}
                  rounded={"md"}
                  boxShadow={"md"}
                  bg={"gray.200"}
                  width={"fit-content"}
                >
                  {displayDate}
                </Box>
              )}
              <div
                className={`msg ${
                  uid === auth.currentUser.uid ? "sent" : "received"
                }`}
              >
                <div className="name">
                  {uid === auth.currentUser.uid ? "" : "~" + name}
                </div>
                <HStack spacing={2} alignItems="center">
                  <Avatar size="sm" src={users && users[uid]?.photoURL} />
                  <p>{message}</p>
                </HStack>
              </div>
            </Box>
          );
        })}
      </Stack>
      <SendMsg />
      <div ref={scroll}></div>
    </>
  );
};

export default Chat;
