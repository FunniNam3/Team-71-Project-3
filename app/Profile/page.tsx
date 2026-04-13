import { auth0 } from "@/lib/auth0";
import ProfileClient from "./profileClient";

export default async function Profile() {
  const session = await auth0.getSession();
  const authUser = session?.user;
  return <ProfileClient authUser={authUser} />;
}
