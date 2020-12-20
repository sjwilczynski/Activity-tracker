import {
  Button,
  makeStyles,
  FormHelperText,
  Typography,
} from "@material-ui/core";
import { FieldProps } from "formik";
import { ChangeEvent, useCallback } from "react";

const useStyles = makeStyles((theme) => {
  return {
    selectButton: {
      margin: `${theme.spacing(1)}px 0`,
    },
  };
});

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
      <label htmlFor="contained-button-file">
        <Button
          variant="contained"
          color="primary"
          component="div"
          className={styles.selectButton}
        >
          Select file
        </Button>
      </label>
      {fileName && (
        <FormHelperText>
          <Typography variant="subtitle1">{fileName}</Typography>
        </FormHelperText>
      )}
      {error && (
        <FormHelperText error>
          <Typography variant="subtitle1">{error}</Typography>
        </FormHelperText>
      )}
    </>
  );
};
