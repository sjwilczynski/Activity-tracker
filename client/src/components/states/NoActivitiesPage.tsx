import makeStyles from "@mui/styles/makeStyles";
import { Link } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  link: {
    color: theme.palette.primary.main,
    textDecoration: "none",
    fontWeight: 500,
  },
  textContainer: {
    fontSize: 16,
    lineHeight: "32px",
  },
  highlight: {
    fontWeight: 600,
  },
}));

export const NoActivitiesPage = () => {
  const styles = useStyles();
  return (
    <div className={styles.textContainer}>
      <div>
        You haven't added any activities yet, so there is no data to display 😟
      </div>
      <div>
        To start your journey go to{" "}
        <Link className={styles.link} to="/welcome">
          homepage
        </Link>{" "}
        add use <span className={styles.highlight}>Quick add</span> button 😎
      </div>
      <div>
        You can also go to{" "}
        <Link className={styles.link} to="/profile">
          profile page
        </Link>{" "}
        and use <span className={styles.highlight}>Upload activities</span>{" "}
        button and add them by selecting a file in a proper format 😲
      </div>
    </div>
  );
};
