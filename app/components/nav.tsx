import { auth0 } from "@/lib/auth0";
import Image from "next/image";
import Link from "next/link";
import NavClient from "./navClient";
import WeatherCard from "@components/Weather";

export default async function NavBar() {
  const session = await auth0.getSession();
  const user = session?.user;

  return (
    <nav className="top-0 left-0 z-50 w-[calc(100%-9rem)] p-3 bg-transparent">
      <div className="w-full max-w-250 mx-auto bg-white flex justify-between gap-3 p-3 rounded-full">
        <div className="flex gap-4">
          <Link
            href="/"
            className="my-auto ml-3 h-fit w-fit hover:scale-105 active:scale-95"
          >
            <Image
              className="h-12 w-auto"
              src="/Logo.svg"
              alt="Home page"
              width={70}
              height={105}
            />
          </Link>
          <Link
            href="/Portal"
            className="flex text-white gap-2 text-center p-3 h-full w-fit z-10 bg-(--primary) rounded-full hover:scale-105 active:scale-95 transition-transform duration-300"
          >
            <Image
              src="/Portal.svg"
              alt="Portal Page"
              width={20}
              height={20}
              className="w-full h-auto"
            />
            Portal
          </Link>

          <WeatherCard />
        </div>
        <NavClient user={user} />
      </div>
    </nav>
  );
}
