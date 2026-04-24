"use client";
import { User } from "@auth0/nextjs-auth0/types";
import { useEffect, useState } from "react";

interface UserData {
  name: string;
  role: string;
  points: number;
}

export default function ProfileClient({
  authUser,
}: {
  authUser: User | undefined;
}) {
  const [user, setUser] = useState<UserData>();
  useEffect(() => {
    fetch("/api/login")
      .then((res) => res.json())
      .then((result) => {
        setUser(result);
      });
  }, []);
  return (
    <main className="flex flex-col gap-3 p-6">
      <h1 className="text-2xl ">Name: {user?.name}</h1>
      <h1 className="text-2xl ">Role: {user?.role}</h1>
      <h1 className="text-2xl ">Points: {user?.points}</h1>
      <h1 className="text-2xl ">Email: {authUser?.email}</h1>
      <small className="text-black">
        * These cannot be altered by the user
      </small>
    </main>
  );
}
