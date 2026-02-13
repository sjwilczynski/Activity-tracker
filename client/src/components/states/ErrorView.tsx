import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "../ui/button";

export const ErrorView = (props: { error: Error }) => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col">
      <div className="flex items-center my-4">
        <AlertCircle className="mr-2 size-7 text-destructive" />
        An error has occurred:
        <span className="font-medium ml-2">{props.error.message}</span>
      </div>
      <Button variant="gradient" onClick={() => navigate("/welcome")}>
        Back to homepage
      </Button>
    </div>
  );
};
