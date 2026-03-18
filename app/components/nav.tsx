import Link from "next/link";
// TODO make this the nav bar

export default function NavBar() {
  return (
    <div className="w-full flex justify-start gap-3 p-3">
      <Link href={"/"}>Home</Link>
      <Link href={"/POS"}>POS</Link>
    </div>
  );
}
