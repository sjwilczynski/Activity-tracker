import {
  Button,
  FormHelperText,
  Tooltip,
  Typography,
  IconButton,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { FieldProps } from "formik";
import { ChangeEvent, useCallback } from "react";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const useStyles = makeStyles((theme) => ({
  selectButton: {
    margin: `${theme.spacing(1)} 0`,
    flex: "1 1 auto",
  },
  selectButtonContainer: {
    display: "flex",
    alignItems: "center",
  },
  label: {
    display: "flex",
    flex: "1 1 auto",
  },
  text: {
    textAlign: "center",
  },
}));

export const FileInput = <T extends { file: File | null }>(
  props: FieldProps<File | null, T>
) => {
  const { field, form } = props;
  const { setFieldValue, errors } = form;
  const { name } = field;
  const onFileInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const files = event.currentTarget.files;
      if (files) {
        setFieldValue(name, files[0]);
      }
    },
    [setFieldValue, name]
  );
  const styles = useStyles();
  const fileName = field.value?.name;
  const error = errors.file;
  return (
    <>
      <input
        style={{ display: "none" }}
        id="contained-button-file"
        type="file"
        onChange={onFileInputChange}
      />
      <div className={styles.selectButtonContainer}>
        <label htmlFor="contained-button-file" className={styles.label}>
          <Button
            variant="contained"
            color="primary"
            component="div"
            className={styles.selectButton}
          >
            Select file
          </Button>
        </label>
        <Tooltip title="Click to view a file in a format required for upload">
          <IconButton
            href="https://github.com/sjwilczynski/Activity-tracker/blob/master/example-activities-file.json"
            color="inherit"
            size="large"
          >
            <InfoOutlinedIcon />
          </IconButton>
        </Tooltip>
      </div>
      {fileName && (
        <FormHelperText className={styles.text}>
          <Typography variant="subtitle1">{fileName}</Typography>
        </FormHelperText>
      )}
      {error && (
        <FormHelperText error className={styles.text}>
          <Typography variant="subtitle1">{error}</Typography>
        </FormHelperText>
      )}
    </>
  );
};
