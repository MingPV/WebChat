import { Friend } from "@/types/friend";
import { User } from "@/types/user";
import { useEffect, useState } from "react";
import { IoTrashBin } from "react-icons/io5";
interface CreateGroupProps {
  myData: User;
}

export default function CreateGroup({ myData }: CreateGroupProps) {
  const [groupName, setGroupName] = useState("");
  const [memberName, setMemberName] = useState("");
  const [memberId, setMemberId] = useState("");
  const [members, setMembers] = useState<string[]>([myData.username]);
  const [members_id, setMembers_id] = useState<string[]>([myData._id]);
  const [friends, setFriends] = useState<Friend[]>([]);

  useEffect(() => {
    const fetchFriends = async () => {
      console.log(myData?._id);
      try {
        const response = await fetch(
          `http://localhost:8080/friends/userId/${myData?._id}`,
          {
            method: "GET",
            credentials: "include",
          },
        );
        if (!response.ok) {
          throw new Error("Failed to fetch friends");
        }
        const { data } = await response.json();
        setFriends(data);
        console.log("friend", data);
      } catch (error) {
        console.error(
          error instanceof Error ? error.message : "An unknown error occurred",
        );
      }
    };
    fetchFriends();
  }, []);

  const addMember = () => {
    if (memberName.trim()) {
      setMembers([...members, memberName.trim()]);
      setMembers_id([...members_id, memberId]);
      setMemberName("");
      setMemberId("");
      console.log("add : ");
      console.log("members_id", members_id);
      console.log("members", members);
    }
  };

  const removeMember = (name: string, id: string) => {
    console.log("remove member and id", name, id);
    setMembers(members.filter((member) => member !== name));
    setMembers_id(members_id.filter((member) => member !== id));
    console.log("remove : ");
    console.log("members_id", members_id);
    console.log("members", members);
  };

  const createGroup = async () => {
    if (!groupName || members.length === 0) {
      alert("ใส่ชื่อกลุ่มและสมาชิกอย่างน้อย 1 คนก่อนนะ!");
      return;
    }

    const groupData = {
      groupName,
      members,
    };

    console.log("Group Created:", groupData);
    console.log("Members ID:", members_id);
    // TODO: ส่ง groupData ไปยัง backend หรือ socket

    const createdGroup = await fetch("http://localhost:8080/rooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: groupName,
        isGroup: true,
        participants: members_id,
        createdBy: myData?._id,
      }),
      credentials: "include",
    });
    if (!createdGroup.ok) {
      throw new Error("Failed to create group");
    }
    const data = await createdGroup.json();
    console.log("Created group:", data);

    // Reset the form
    setGroupName("");
    setMembers([myData.username]);
    setMembers_id([myData._id]);
    setMemberName("");
  };

  return (
    <div className="bg-base-200 h-full space-y-4 rounded-lg">
      <div className="flex h-full flex-col justify-between">
        <div className="flex h-full flex-col gap-2">
          <h2 className="text-md bg-base-400 rounded-t-md p-2 font-bold transition-all duration-1000 dark:text-white">
            Create new group
          </h2>

          <div className="px-4 py-2">
            <label className="mb-1 block text-sm font-semibold">
              group name
            </label>
            <input
              type="text"
              className="focus:ring-base-500 w-full rounded-lg border-2 border-gray-300 bg-white p-2 text-sm focus:ring-2 focus:outline-none"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="ex. Raider group"
            />
          </div>

          <div className="flex items-center gap-2 px-4">
            <select
              className="focus:ring-base-500 w-full rounded-lg border-2 border-gray-300 bg-white p-2 text-sm focus:ring-2 focus:outline-none"
              value={memberName}
              onChange={(e) => {
                setMemberName(e.target.value);
                setMemberId(
                  e.target.options[e.target.selectedIndex].dataset.id || "",
                );
              }}
            >
              <option value="">select friend</option>
              {friends.map((friend) =>
                members_id.includes(friend.friend_id) ? null : (
                  <option
                    key={friend._id}
                    value={friend.friend_name}
                    data-id={friend.friend_id}
                  >
                    {friend.friend_name}
                  </option>
                ),
              )}
            </select>
            <button
              onClick={addMember}
              className="bg-base-400 hover:bg-base-600 dark:bg-base-500 rounded-lg px-4 py-2 text-white transition duration-1000"
            >
              Add
            </button>
          </div>

          <div className="mb-4 h-full p-4">
            <h3 className="mb-2 font-medium">members:</h3>
            <div className="rounded-md">
              {members.length === 1 ? (
                <p className="text-md h-full text-start text-gray-500">
                  no member selected
                </p>
              ) : (
                <ul className="list-decimal space-y-1">
                  {members.map(
                    (name, idx) =>
                      idx > 0 && (
                        <li
                          key={idx}
                          className="bg-base-100 dark:bg-base-300 flex items-center justify-between rounded-md px-2 py-1 transition-all duration-1000"
                        >
                          <p>
                            {idx}
                            {". "}
                            {name}
                          </p>

                          <button
                            onClick={() => removeMember(name, members_id[idx])}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            <IoTrashBin />
                          </button>
                        </li>
                      ),
                  )}
                </ul>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={createGroup}
          className="bg-base-400 hover:bg-base-600 dark:bg-base-500 m-4 rounded-lg py-2 text-white transition duration-1000"
        >
          Create group
        </button>
      </div>
    </div>
  );
}
