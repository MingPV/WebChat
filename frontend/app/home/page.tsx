"use client";

import { Friend } from "@/types/friend";
import { User } from "@/types/user";
import { DarkThemeToggle } from "flowbite-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const [userData, setUserData] = useState<User>();
  const [friendName, setFriendName] = useState("");
  const [friends, setFriends] = useState<Friend[]>([]);

  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("http://localhost:8080/me", {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) {
          console.log(response);
          throw new Error("Failed to fetch username");
        }
        const { data } = await response.json();
        console.log(data._id);
        const response2 = await fetch(
          `http://localhost:8080/friends/userId/${data._id}`,
          {
            method: "GET",
            credentials: "include",
          },
        );
        if (!response2.ok) {
          console.log(response2);
          throw new Error("Failed to fetch friends");
        }
        const { data: data2 } = await response2.json();
        console.log(data2);

        setFriends(data2);
        setUserData(data);
      } catch (error) {
        console.error(
          error instanceof Error ? error.message : "An unknown error occurred",
        );
      }
    };

    fetchUserData();
  }, []);

  const handleSignOut = async () => {
    try {
      const response = await fetch("http://localhost:8080/auth/sign-out", {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to sign out");
      }
      console.log("Sign-out successfully");
      router.push("/");
    } catch (error) {
      console.error(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    }
  };

  const handleAcceptFriend = async (
    friend_request_id: string,
    friend_id: string,
  ) => {
    try {
      const response = await fetch(
        `http://localhost:8080/friends/${friend_request_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userData?._id,
            friend_id: friend_id,
            status: "accepted",
            since: new Date().toISOString(),
            is_accepted: true,
          }),
          credentials: "include",
        },
      );
      if (!response.ok) {
        throw new Error("Failed to accept friend request");
      }

      console.log("Accept friend request successfully");
    } catch (error) {
      console.error(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    }
  };

  const handleRejectFriend = async (
    friend_request_id: string,
    friend_id: string,
  ) => {
    try {
      console.log(friend_id);
      const response = await fetch(
        `http://localhost:8080/friends/${friend_request_id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userData?._id,
            friend_id: friend_id,
          }),
          credentials: "include",
        },
      );
      if (!response.ok) {
        throw new Error("Failed to reject friend request");
      }
      console.log("Reject friend request successfully");
    } catch (error) {
      console.error(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    }
  };

  const handleAddFriend = async () => {
    try {
      const friend_response = await fetch(
        `http://localhost:8080/user/${friendName}`,
      );
      if (!friend_response.ok) {
        throw new Error("Failed to fetch friend data");
      }
      const friend_data = await friend_response.json();

      const response = await fetch("http://localhost:8080/friends", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userData?._id,
          friend_id: friend_data.data._id,
          user_name: userData?.username,
          friend_name: friend_data.data.username,
        }),
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to add friend");
      }
      console.log("Add friend successfully");
      console.log(response);
    } catch (error) {
      console.error(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-24 dark:bg-gray-900">
      <div className="absolute top-4 right-4">
        <DarkThemeToggle />
      </div>
      <div className="flex flex-row gap-12">
        <div className="flex flex-col gap-2 border p-4">
          <div>Friend Requests</div>
          {friends.map(
            (friend) =>
              !friend.is_accepted && (
                <div
                  key={friend._id}
                  className="flex flex-row gap-2 border-b p-2"
                >
                  <div>{friend.friend_name}</div>
                  <div
                    className="cursor-pointer rounded-md bg-lime-500 p-2"
                    onClick={() => {
                      handleAcceptFriend(friend._id, friend.friend_id);
                      // hide this component after accept
                    }}
                  >
                    Accept
                  </div>
                  <div
                    className="cursor-pointer rounded-md bg-red-500 p-2"
                    onClick={() => {
                      handleRejectFriend(friend._id, friend.friend_id);
                      // hide this component after reject
                    }}
                  >
                    Reject
                  </div>
                </div>
              ),
          )}
          <div>Friends</div>
          {friends.map(
            (friend) =>
              friend.is_accepted && (
                <div
                  key={friend._id}
                  className="flex flex-row gap-2 border-b p-2"
                >
                  <div>{friend.friend_name}</div>
                  <div className="cursor-pointer rounded-md bg-sky-300 p-2">
                    Chat
                  </div>
                </div>
              ),
          )}
        </div>
        <div className="flex w-full flex-col justify-center">
          <div className="m-2">Add friend by username</div>
          <div className="flex w-full flex-col items-center justify-center bg-lime-200 p-4">
            <div>
              <input
                type="text"
                className="bg-white"
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
              />
            </div>
            <div className="flex w-full justify-center">
              <div
                className="mt-4 cursor-pointer border border-black bg-white p-2 text-center"
                onClick={handleAddFriend}
              >
                {" "}
                Add
              </div>
            </div>
          </div>
          <div className="flex w-full justify-center">
            <div
              className="mt-12 flex w-fit cursor-pointer rounded-md bg-red-500 p-2"
              onClick={handleSignOut}
            >
              Logout
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
