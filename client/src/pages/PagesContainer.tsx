import { makeStyles } from "@material-ui/core";

type Props = {
  children: React.ReactNode;
};

const useStyles = makeStyles((theme) => {
  return {
    container: {
      overflow: "auto",
      padding: "2rem",
      flexDirection: "column",
      display: "flex",
      marginLeft: "17rem",
      [theme.breakpoints.down("sm")]: {
        marginLeft: "0",
      },
    },
  };
});

export const PagesContainer = ({ children }: Props) => {
  const styles = useStyles();
  return <div className={styles.container}>{children}</div>;
};
