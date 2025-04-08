/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { DarkThemeToggle } from "flowbite-react";
import { Message } from "@/types/message";
import { useSocket } from "../contexts/SocketContext";
import { User } from "@/types/user";

export default function Home() {
  const [userData, setUserData] = useState<User>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [me, setMe] = useState<string | null>(null);
  const [users, setUsers] = useState<string[]>([]);

  const { socket } = useSocket();

  useEffect(() => {
    // Initialize socket connection
    if (!socket) {
      //   console.log("Socket not initialized");
      //   console.log(socket);
      return;
    }

    const handleConnect = () => {
      console.log("✅ Socket connected:", socket.id);

      socket.emit("join_room", "PublicRoom");

      socket.emit("get_username", (name: string) => {
        console.log("myname", name);
        setMe(name);
      });

      console.log("ming1235");

      socket.on("user-list", (usernames: string[]) => {
        setUsers(usernames);
      });

      socket.on(
        "receive_message",
        ({ roomId, message, sender, createdAt, senderName }) => {
          const newMessage: Message = {
            _id: "message.id",
            roomId,
            sender,
            senderName,
            message,
            createdAt,
          };

          setMessages((prev) => [...prev, newMessage]);
        },
      );

      const fetchMessagesByRoomId = async (roomId: string) => {
        try {
          const response = await fetch(
            `http://localhost:8080/messages/roomId/${roomId}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            },
          );
          if (!response.ok) {
            throw new Error("Failed to fetch messages");
          }
          const data = await response.json();
          console.log("Fetched messages:", data);
          setMessages(data.data); // Assuming the messages are in data.data
        } catch (error) {
          console.error(
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
          );
        }
      };

      const fetchUserData = async () => {
        try {
          const response = await fetch("http://localhost:8080/me", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          });
          if (!response.ok) {
            throw new Error("Failed to fetch user data");
          }
          const data = await response.json();
          console.log("Fetched user data:", data);
          setUserData(data.data); // Assuming the user data is in data.data
          setMe(data.data.username);
          socket.emit("set-username", data.data.username);
        } catch (error) {
          console.error(
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
          );
        }
      };
      fetchUserData();
      fetchMessagesByRoomId("PublicRoom");
      setIsLoading(false);
    };

    if (socket.connected) {
      handleConnect();
    } else {
      socket.once("connect", handleConnect);
    }
  }, [socket]);

  const createMessageByRoomId = async (
    roomId: string,
    message: string,
    senderId: string,
    senderName: string,
  ) => {
    try {
      const response = await fetch(`http://localhost:8080/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomId: roomId,
          senderId: senderId,
          senderName: senderName,
          content: message,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to create message");
      }
      const data = await response.json();
      console.log("Created message:", data);
      return data.data; // Assuming the created message is in data.data
    } catch (error) {
      console.error(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    }
  };

  const sendMessage = async (message: string) => {
    if (input.trim() === "" || !me) {
      console.log(me, socket);
      console.log("ming123");
      return;
    }

    console.log("mingza123", me);

    const sentMessage = await createMessageByRoomId(
      "PublicRoom",
      message,
      "Public",
      me,
    );

    console.log("Sent message:", sentMessage);

    if (socket) {
      // Emit the message to the server
      socket.emit("send_message", {
        roomId: "PublicRoom",
        message: sentMessage.message,
        sender: sentMessage.sender,
        senderName: sentMessage.senderName,
        createdAt: sentMessage.createdAt,
      });
    }

    // setMessages((prevMessages) => [...prevMessages, sentMessage]);
  };

  const handleSendMessage = () => {
    sendMessage(input);
    setInput("");
  };

  //   if (isLoading) {
  //     return (
  //       <>
  //         <div>Loading</div>
  //       </>
  //     );
  //   }

  if (!socket || isLoading) return <p>🔄 Connecting to chat server...</p>;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-24 dark:bg-gray-900">
      <div className="absolute top-4 right-4">
        <DarkThemeToggle />
      </div>

      <div className="absolute left-18">
        <div className="mb-4 rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
          <h2 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
            Online Users
          </h2>
          <ul className="space-y-2">
            {users.map((user, index) => (
              <li
                key={index}
                className="flex items-center gap-2 rounded-lg bg-gray-100 p-2 text-sm text-gray-900 shadow-sm dark:bg-gray-800 dark:text-white"
              >
                <span className="inline-block h-2 w-2 rounded-full bg-green-500"></span>
                {user}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="w-full max-w-md">
        <h1 className="mb-4 text-center text-xl font-bold text-gray-900 dark:text-white">
          Room: {"PulbicChat"}
        </h1>
        <div className="mb-4 h-64 overflow-y-auto rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
          {messages.map((message, index) => (
            <div
              key={index}
              className="mb-2 text-sm text-gray-900 dark:text-white"
            >
              {message.senderName}: {message.message}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            placeholder="Type your message..."
          />
          <button
            onClick={handleSendMessage}
            className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-300 focus:outline-none dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Send
          </button>
        </div>
      </div>
    </main>
  );
}
