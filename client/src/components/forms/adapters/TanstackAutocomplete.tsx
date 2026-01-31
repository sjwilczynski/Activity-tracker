import type { FieldApi } from "@tanstack/react-form";
import { Autocomplete, TextField, type TextFieldProps } from "@mui/material";
import type { CategoryOption } from "../../../data";
import { useAvailableCategories } from "../../../data";

type TanstackAutocompleteProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: FieldApi<any, any, CategoryOption, any>;
  label: string;
  style?: TextFieldProps["sx"];
  size?: "small" | "medium";
};

export const TanstackAutocomplete = ({
  field,
  label,
  style,
  size,
}: TanstackAutocompleteProps) => {
  const { availableCategories, isLoading } = useAvailableCategories();
  const error = field.state.meta.errors?.[0];
  const value = field.state.value;

  return (
    <Autocomplete
      id="name-autocomplete"
      size={size}
      options={availableCategories}
      value={value.name ? value : null}
      getOptionLabel={(category: CategoryOption) => category.name}
      isOptionEqualToValue={(option: CategoryOption, val: CategoryOption) =>
        option.name === val.name
      }
      includeInputInList
      loading={isLoading}
      groupBy={(option: CategoryOption) => option.categoryName}
      onChange={(_, newValue) => {
        if (newValue) {
          field.handleChange(newValue);
        }
      }}
      onBlur={field.handleBlur}
      onOpen={field.handleBlur}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder="name of the activity"
          sx={style}
          variant="standard"
          error={!!error}
          helperText={error}
        />
      )}
    />
  );
};
