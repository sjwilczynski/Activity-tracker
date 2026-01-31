import type { Theme } from "@mui/material";
import {
  Button,
  FormHelperText,
  Tooltip,
  Typography,
  IconButton,
  styled,
} from "@mui/material";
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

type FileInputProps = {
  value: File | null;
  onChange: (value: File | null) => void;
  onBlur: () => void;
  error?: string;
};

export const FileInput = ({
  value,
  onChange,
  onBlur,
  error,
}: FileInputProps) => {
  const onFileInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const files = event.currentTarget.files;
      if (files && files[0]) {
        onChange(files[0]);
      }
    },
    [onChange]
  );

  const fileName = value?.name;

  return (
    <>
      <input
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
