"use client";
import Image from "next/image";
import Link from "next/link";
import type { User } from "@auth0/nextjs-auth0/types";
import { useEffect, useState } from "react";

export default function NavClient({ user }: { user: User | undefined }) {
  const LinkStyle =
    "flex gap-2 text-white m-auto bg-(--primary) h-fit w-fit px-6 py-3 rounded-full";

  const [role, setRole] = useState();

  useEffect(() => {
    fetch("/api/login")
      .then((result) => result.json())
      .then((res) => {
        if (res.error) {
          console.error(res.error);
        }
        setRole(res.role);
      });
  }, []);
  return (
    <>
      {!user && (
        <Link className={LinkStyle} href="/auth/login">
          <Image
            className="h-5 w-auto"
            src="/Login.svg"
            alt=""
            width={18}
            height={18}
          />
          Login
        </Link>
      )}
      {user && (
        <>
          <Link className={LinkStyle} href="/Profile">
            <Image
              className="h-5 w-auto"
              src="/User.svg"
              alt=""
              width={18}
              height={18}
            />
            {user.given_name}
          </Link>
          <Link className={LinkStyle} href="/auth/logout">
            <Image
              className="h-5 w-auto"
              src="/Logout.svg"
              alt=""
              width={18}
              height={18}
            />
            Logout
          </Link>
        </>
      )}
    </>
  );
}
