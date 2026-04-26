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
        setRole(res.role);
      });
  }, []);

  return (
    <div className="w-fit flex gap-4">
      {role && role === "manager" ? (
        <Link className={LinkStyle} href="/Manager">
          <Image
            className="h-5 w-auto"
            src="/Suitcase.svg"
            alt=""
            width={20}
            height={18}
          />
          Manager
        </Link>
      ) : role === "cashier" ? (
        <Link className={LinkStyle} href="/CashierPOS">
          <Image
            className="h-5 w-auto"
            src="/Money.svg"
            alt=""
            width={12}
            height={22}
          />
          Cashier
        </Link>
      ) : (
        <Link className={LinkStyle} href="/Order">
          <Image
            className="h-5 w-auto"
            src="/Cart.svg"
            alt=""
            width={22}
            height={21}
          />
          Order
        </Link>
      )}
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
            {user.given_name ? user.given_name : "User"}
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
    </div>
  );
}
