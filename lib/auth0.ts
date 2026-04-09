import { Auth0Client } from "@auth0/nextjs-auth0/server";

export const auth0 = new Auth0Client({
  authorizationParameters: {
    scope: "openid profile email offline_access",
  },
  session: {
    // Tell the SDK to keep your custom claim
    rolling: true,
  },
  async beforeSessionSaved(session) {
    return {
      ...session,
      user: {
        ...session.user,
        roles: session.user['http://localhost:3000/roles'] ?? [],
      },
    };
  },
});