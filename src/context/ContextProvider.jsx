import { useEffect, useState } from "react";
import AppContext from "./AppContext";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, firestore } from "../FireBase";
import { collection, onSnapshot } from "firebase/firestore";

export const ContextProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [user] = useAuthState(auth);

  useEffect(() => {
    if (!user) {
      return;
    }
    const userRef = collection(firestore, "users");
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      const usersObject = {};
      snapshot.docs.forEach((doc) => {
        usersObject[doc.id] = doc.data();
      });
      setUsers(usersObject);
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  return <AppContext.Provider value={users}>{children}</AppContext.Provider>;
};
