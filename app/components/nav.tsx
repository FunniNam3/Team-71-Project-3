import { auth0 } from "@/lib/auth0";
import Image from "next/image";
import Link from "next/link";
import NavClient from "./navClient";

export default async function NavBar() {
  const LinkStyle =
    "flex gap-2 text-white m-auto bg-(--primary) h-fit w-fit px-6 py-3 rounded-full";

  const session = await auth0.getSession();
  const user = session?.user;

  return (
    <nav className="w-full p-3 bg-transparent">
      <div className="w-full max-w-250 mx-auto bg-white flex justify-between gap-3 p-3 rounded-full">
        <Link
          href="/"
          className="my-auto ml-3 h-fit w-fit hover:scale-105 active:scale-95"
        >
          <Image
            className="h-12 w-auto"
            src="/Logo.svg"
            alt=""
            width={70}
            height={105}
          />
        </Link>

        <NavClient user={user} session={session} />
      </div>
    </nav>
  );
}
