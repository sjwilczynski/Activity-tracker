import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import type { Theme } from "@mui/material";
import {
  Button,
  FormHelperText,
  IconButton,
  styled,
  Tooltip,
  Typography,
} from "@mui/material";
import type { SxProps } from "@mui/system";
import type { ChangeEvent } from "react";
import { useCallback } from "react";

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

type FileInputProps = {
  value: File | null;
  onChange: (value: File | null) => void;
  onBlur: () => void;
  error?: string;
};

/**
 * Makes File object properties enumerable so TanStack Form's deep equality check
 * can detect changes between different files.
 * Workaround for: https://github.com/TanStack/form/issues/1932
 */
function makeFileEnumerable(file: File): File {
  Object.defineProperties(file, {
    name: { value: file.name, enumerable: true },
    size: { value: file.size, enumerable: true },
    type: { value: file.type, enumerable: true },
  });
  return file;
}

export const FileInput = ({
  value,
  onChange,
  onBlur,
  error,
}: FileInputProps) => {
  const onFileInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const input = event.target;
      const files = input.files;
      if (files && files[0]) {
        onChange(makeFileEnumerable(files[0]));
        // Reset the input value to allow selecting the same file again
        input.value = "";
      }
    },
    [onChange]
  );

  const fileName = value?.name;

  return (
    <>
      <input
        key={fileName ?? "empty"}
        style={{ display: "none" }}
        id="contained-button-file"
        type="file"
        onChange={onFileInputChange}
        onBlur={onBlur}
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
