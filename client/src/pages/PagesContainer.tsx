import makeStyles from "@mui/styles/makeStyles";

type Props = {
  children: React.ReactNode;
};

const useStyles = makeStyles((theme) => ({
  container: {
    overflow: "auto",
    padding: "2rem",
    flexDirection: "column",
    display: "flex",
    marginLeft: "17rem",
    [theme.breakpoints.down("md")]: {
      marginLeft: "0",
    },
  },
}));

export const PagesContainer = ({ children }: Props) => {
  const styles = useStyles();
  return <div className={styles.container}>{children}</div>;
};
