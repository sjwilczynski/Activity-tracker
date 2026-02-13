import { useAuthContext } from "../auth";
import { Button } from "../components/ui/button";

export const Profile = () => {
  const { user, signOut } = useAuthContext();

  return (
    <div className="flex flex-col items-center gap-8">
      <h2 className="text-xl font-semibold">User name: {user?.displayName}</h2>
      <Button onClick={signOut}>Sign out</Button>
    </div>
  );
};
