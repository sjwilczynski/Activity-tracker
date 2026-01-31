import type { FieldApi } from "@tanstack/react-form";
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

type TanstackFileInputProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: FieldApi<any, any, File | null, any>;
};

export const TanstackFileInput = ({ field }: TanstackFileInputProps) => {
  const onFileInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const files = event.currentTarget.files;
      if (files && files[0]) {
        field.handleChange(files[0]);
      }
    },
    [field]
  );

  const fileName = field.state.value?.name;
  const error = field.state.meta.errors?.[0];

  return (
    <>
      <input
        style={{ display: "none" }}
        id="contained-button-file"
        type="file"
        onChange={onFileInputChange}
        onBlur={field.handleBlur}
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
