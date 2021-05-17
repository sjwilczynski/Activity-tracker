import { useCallback } from "react";
import { Field, Formik, Form } from "formik";
import * as yup from "yup";
import {
  ActivityRecordServer,
  CategoryOption,
  useActivitiesMutation,
  useCategories,
} from "../../data";
import { KeyboardDatePicker } from "formik-material-ui-pickers";
import { TextField } from "formik-material-ui";
import { Button, makeStyles } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import { format } from "date-fns";
import { FeedbackAlertGroup } from "../states/FeedbackAlertGroup";

type FormValues = {
  date: Date;
  name: string;
  active: boolean;
};

const useStyles = makeStyles((theme) => ({
  form: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: `${theme.spacing(1)}px 0`,
  },
  field: {
    margin: `${theme.spacing(1)}px 0`,
  },
}));

export function AddActivityForm() {
  const { mutate: addActivities, isError, isSuccess } = useActivitiesMutation();
  const onSubmit = useCallback(
    (values: FormValues) => {
      const activityRecord: ActivityRecordServer = {
        date: format(values.date, "yyyy-MM-dd"),
        name: values.name,
        active: values.active,
      };
      addActivities([activityRecord]);
    },
    [addActivities]
  );

  const styles = useStyles();
  const availableCategories = useAvailableCategories();

  return (
    <>
      <Formik<FormValues>
        validationSchema={yup.object({
          date: yup.date().required(),
          name: yup.string().required(),
          active: yup.bool().required(),
        })}
        initialValues={{
          date: new Date(Date.now()),
          name: "",
          active: true,
        }}
        onSubmit={onSubmit}
      >
        {({ isValid, dirty, handleBlur, setFieldValue }) => (
          <Form className={styles.form}>
            <Field
              component={KeyboardDatePicker}
              name="date"
              label="Date"
              format="yyyy-MM-dd"
              className={styles.field}
              autoOk
            />
            <Autocomplete
              id="name-autocomplete"
              options={availableCategories}
              getOptionLabel={(category: CategoryOption) => category.name}
              onChange={(_, value) => {
                setFieldValue("name", value?.name);
                setFieldValue("active", value?.active);
              }}
              onOpen={handleBlur}
              includeInputInList
              renderInput={(params) => (
                <Field
                  {...params}
                  component={TextField}
                  name="name"
                  label="Activity name"
                  placeholder="name of the activity"
                  type="text"
                  className={styles.field}
                />
              )}
            />
            <Field name="active" type="checkbox" hidden />
            <Button
              disabled={!isValid || !dirty}
              variant="contained"
              color="primary"
              type="submit"
            >
              Add activity
            </Button>
          </Form>
        )}
      </Formik>
      <FeedbackAlertGroup
        isRequestError={isError}
        isRequestSuccess={isSuccess}
        successMessage="Successfully added the activity"
        errorMessage="Failed to add the activity"
      />
    </>
  );
}

const useAvailableCategories = () => {
  const { data: categories } = useCategories();
  return (categories ?? []).reduce<CategoryOption[]>((acc, category) => {
    if (category.subcategories?.length) {
      category.subcategories.forEach((subcategory) =>
        acc.push({
          name: subcategory.name,
          active: category.active,
        })
      );
    } else {
      acc.push({
        name: category.name,
        active: category.active,
      });
    }
    return acc;
  }, []);
};
