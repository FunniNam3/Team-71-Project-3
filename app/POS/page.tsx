import Link from "next/link";

// TODO Make this the main POS page
export default function POS() {
  return (
    <div>
      <h1>POS Page</h1>
      <div className="w-[30vw] flex justify-between">
        <Link href={"POS/Foods"}>Foods</Link>
        <Link href={"POS/Drinks"}>Drinks</Link>
      </div>
    </div>
  );
}
