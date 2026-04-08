import { auth0 } from "@/lib/auth0";
import Image from "next/image";
import Link from "next/link";

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
        <div className="w-fit flex gap-4">
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
        </div>
      </div>
    </nav>
  );
}
