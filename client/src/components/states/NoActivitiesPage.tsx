import { Link } from "react-router";

export const NoActivitiesPage = () => {
  return (
    <div className="text-base leading-8">
      <div>
        You haven&apos;t added any activities yet, so there is no data to display 😟
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
        <Link
          to="/activity-list"
          className="font-medium text-primary no-underline"
        >
          activity list
        </Link>{" "}
        and use the <span className="font-semibold">Upload</span> button to
        import activities from a JSON file 😲
      </div>
    </div>
  );
};
