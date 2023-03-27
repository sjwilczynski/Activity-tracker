import type {
  AutocompleteProps,
  AutocompleteRenderInputParams,
} from "@mui/material";
import { TextField } from "@mui/material";
import type { useFormik } from "formik";
import { Field } from "formik";
import { Autocomplete } from "formik-mui";
import type { CategoryOption } from "../../../../data";
import { useAvailableCategories } from "../../../../data";

type Props = {
  name: string;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  style?: AutocompleteProps<any, any, any, any>["sx"];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  size?: AutocompleteProps<any, any, any, any>["size"];
  handleBlur: ReturnType<typeof useFormik>["handleBlur"];
};

export const CategoriesAutocomplete = ({
  name,
  label,
  style,
  size,
  handleBlur,
}: Props) => {
  const { availableCategories, isLoading } = useAvailableCategories();
  return (
    <Field
      id="name-autocomplete"
      component={Autocomplete}
      size={size}
      name={name}
      options={availableCategories}
      getOptionLabel={(category: CategoryOption) => category.name}
      onOpen={handleBlur}
      onBlur={handleBlur}
      isOptionEqualToValue={(option: CategoryOption, value: CategoryOption) =>
        option.name === value.name
      }
      includeInputInList
      loading={isLoading}
      groupBy={(option: CategoryOption) => option.categoryName}
      renderInput={(params: AutocompleteRenderInputParams) => (
        <TextField
          {...params}
          label={label}
          placeholder="name of the activity"
          sx={style}
          variant="standard"
        />
      )}
    />
  );
};
