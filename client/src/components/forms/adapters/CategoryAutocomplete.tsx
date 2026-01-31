import { Autocomplete, TextField, type TextFieldProps } from "@mui/material";
import type { CategoryOption } from "../../../data";
import { useAvailableCategories } from "../../../data";

type CategoryAutocompleteProps = {
  value: CategoryOption;
  onChange: (value: CategoryOption) => void;
  onBlur: () => void;
  error?: string;
  label: string;
  style?: TextFieldProps["sx"];
  size?: "small" | "medium";
};

export const CategoryAutocomplete = ({
  value,
  onChange,
  onBlur,
  error,
  label,
  style,
  size,
}: CategoryAutocompleteProps) => {
  const { availableCategories, isLoading } = useAvailableCategories();

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
          onChange(newValue);
        }
      }}
      onBlur={onBlur}
      onOpen={onBlur}
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
