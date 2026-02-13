import { Link } from "react-router";

export const NoActivitiesPage = () => {
  return (
    <div className="text-base leading-8">
      <div>
        You haven't added any activities yet, so there is no data to display 😟
      </div>
      <div>
        To start your journey go to{" "}
        <Link to="/welcome" className="font-medium text-primary no-underline">
          homepage
        </Link>{" "}
        and use the <span className="font-semibold">Quick add</span> button 😎
      </div>
      <div>
        You can also go to{" "}
        <Link to="/profile" className="font-medium text-primary no-underline">
          profile page
        </Link>{" "}
        and use <span className="font-semibold">Upload activities</span> button
        and add them by selecting a file in a proper format 😲
      </div>
    </div>
  );
};
