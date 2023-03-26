import type { Theme } from "@mui/material";
import {
  Button,
  FormHelperText,
  Tooltip,
  Typography,
  IconButton,
  styled,
} from "@mui/material";
import type { FieldProps } from "formik";
import type { ChangeEvent } from "react";
import { useCallback } from "react";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import type { SxProps } from "@mui/system";

const SelectButtonContainer = styled("div")({
  display: "flex",
  alignItems: "center",
});

const StyledLabel = styled("label")({
  display: "flex",
  flex: "1 1 auto",
});

const StyledFormHelperText = styled(FormHelperText)({
  textAlign: "center",
});

const submitButtonStyles: SxProps<Theme> = {
  my: 1,
  mx: 0,
  flex: "1 1 auto",
};

export const FileInput = (
  props: FieldProps<File | null, { file: File | null }>
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
      <SelectButtonContainer>
        <StyledLabel htmlFor="contained-button-file">
          <Button
            variant="contained"
            color="primary"
            component="div"
            sx={submitButtonStyles}
          >
            Select file
          </Button>
        </StyledLabel>
        <Tooltip title="Click to view a file in a format required for upload">
          <IconButton
            href="https://github.com/sjwilczynski/Activity-tracker/blob/master/example-activities-file.json"
            color="inherit"
            size="large"
          >
            <InfoOutlinedIcon />
          </IconButton>
        </Tooltip>
      </SelectButtonContainer>
      {fileName && (
        <StyledFormHelperText>
          <Typography variant="subtitle1">{fileName}</Typography>
        </StyledFormHelperText>
      )}
      {error && (
        <StyledFormHelperText error>
          <Typography variant="subtitle1">{error}</Typography>
        </StyledFormHelperText>
      )}
    </>
  );
};
