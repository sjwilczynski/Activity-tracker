import { RouteErrorBoundary } from "../../components/states/RouteErrorBoundary";
import { Profile as ProfilePage } from "../../pages/Profile";

export { RouteErrorBoundary as ErrorBoundary };

export default function Profile() {
  return <ProfilePage />;
}
