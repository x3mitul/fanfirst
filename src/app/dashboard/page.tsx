import { auth0 } from "@/lib/auth0";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  // Get Auth0 session on the server
  const session = await auth0.getSession();

  // Pass Auth0 user data to client component
  const auth0User = session?.user ? {
    name: session.user.name || "User",
    email: session.user.email || "",
    picture: session.user.image || null,
  } : null;

  return <DashboardClient auth0User={auth0User} />;
}
