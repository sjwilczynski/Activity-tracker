import type { AutocompleteProps } from "@mui/material";
import { Autocomplete } from "@mui/material";
import type { useFormik } from "formik";
import { Field } from "formik";
import { TextField } from "formik-mui";
import type { CategoryOption } from "../../../../data";
import { useCategories } from "../../../../data";

type Props = {
  name: string;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  style?: AutocompleteProps<any, any, any, any>["sx"];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setFieldValue: (name: string, value: any) => void;
  handleBlur: ReturnType<typeof useFormik>["handleBlur"];
};

export const CategoriesAutocomplete = ({
  name,
  label,
  style,
  setFieldValue,
  handleBlur,
}: Props) => {
  const { availableCategories, isLoading } = useAvailableCategories();
  return (
    <Autocomplete
      id="name-autocomplete"
      options={availableCategories}
      getOptionLabel={(category: CategoryOption) => category.name}
      onChange={(_, value) => {
        setFieldValue("name", value?.name);
        setFieldValue("active", value?.active);
      }}
      onOpen={handleBlur}
      isOptionEqualToValue={(option, value) => option.name === value.name}
      includeInputInList
      loading={isLoading}
      groupBy={(option) => option.categoryName}
      renderInput={(params) => (
        <Field
          {...params}
          component={TextField}
          name={name}
          label={label}
          placeholder="name of the activity"
          type="text"
          sx={style}
          variant="standard"
        />
      )}
    />
  );
};

const useAvailableCategories = () => {
  const { data: categories, isLoading } = useCategories();
  const availableCategories = (categories ?? []).reduce<CategoryOption[]>(
    (acc, category) => {
      if (category.subcategories?.length) {
        category.subcategories.forEach((subcategory) =>
          acc.push({
            name: subcategory.name,
            categoryName: category.name,
            active: category.active,
          })
        );
      } else {
        acc.push({
          name: category.name,
          categoryName: category.name,
          active: category.active,
        });
      }
      return acc;
    },
    []
  );
  return { availableCategories, isLoading };
};
