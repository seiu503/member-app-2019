import React from "react";
import uuid from "uuid";
import PropTypes from "prop-types";

import TextField from "@material-ui/core/TextField";
import Select from "@material-ui/core/Select";
import Checkbox from "@material-ui/core/Checkbox";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormHelperText from "@material-ui/core/FormHelperText";

// hardcoded. THESE MAY NEED TO BE UPDATED WITH LOCALIZATION PACKAGE
export const stateList = [
  "",
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY"
];
export const monthList = [
  "",
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12"
];
export const languageOptions = ["", "English", "Russian", "Spanish"];
export const genderOptions = ["", "Female", "Male", "Non-Binary", "Other"];
export const genderPronounOptions = [
  "",
  "She/Her/Hers",
  "He/Him/His",
  "They/Them/Their(s)",
  "Other"
];

// switch helper for dateOptions
export const getMaxDay = month => {
  switch (month) {
    case "02":
      return 29;
    case "04":
    case "06":
    case "09":
    case "11":
      return 30;
    default:
      return 31;
  }
};
// function to adjust date select based on mm value
export const dateOptions = props => {
  const mm = props.formValues.mm || props.formValues.hiremm;
  const max = getMaxDay(mm);
  let dates = [];
  for (let i = 1; i <= max; i++) {
    if (i < 10) {
      dates.push("0" + i);
    } else {
      dates.push(i.toString());
    }
  }
  dates.unshift("");
  return dates;
};
// dynamically fills yyyy select with last 110 years
export const yearOptions = () => {
  let years = [];
  for (
    let i = new Date().getFullYear() - 109;
    i <= new Date().getFullYear();
    i++
  ) {
    years.unshift(i.toString());
  }
  years.unshift("");
  return years;
};

// user-friendly names for employer type codes
export const employerTypeMap = {
  PNP: "Non-Profit",
  Retirees: "Retired",
  State: "State Agency",
  "Nursing Homes": "Nursing Home",
  "State Homecare": "State Homecare or Personal Support",
  "Higher Ed": "Higher Education",
  "Local Gov": "Local Government",
  AFH: "Adult Foster Home",
  "Child Care": "Child Care",
  "Private Homecare": "Private Homecare Agency"
};

// helper function for reverse lookup from above object
export const getKeyByValue = (object, value) => {
  return Object.keys(object).find(
    key => object[key].toLowerCase() === value.toLowerCase()
  );
};

// date formatter for submitting to Salesforce
export const formatSFDate = date => {
  let d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
};

// MUI styles object
export const stylesPage1 = theme => ({
  root: {
    margin: "40px 0"
  },
  container: {
    padding: "80px 0 140px 0"
  },
  head: {
    color: theme.palette.primary.light
  },
  form: {
    maxWidth: 600,
    margin: "auto"
  },
  group: {
    display: "flex",
    width: "100%",
    flexDirection: "row",
    justifyContent: "center"
  },
  input: {
    width: "100%",
    margin: "0 0 20px 0"
  },
  select: {
    width: "100%",
    margin: "0 0 20px 0"
  },
  failedText: {
    color: "red"
  },
  formButton: {
    width: "100%",
    padding: 20,
    margin: "0 0 40px"
  },
  formControl: {
    width: "100%"
  },
  formControlLabel: {
    width: "100%"
  },
  formControlDate: {
    width: "15%",
    minWidth: 80,
    margin: "0 15px"
  },
  formLabel: {
    margin: "10px 0"
  },
  formHelperText: {
    margin: "-10px 0 20px 0"
  },
  checkboxErrorText: {
    margin: "-10px 0 10px 0"
  },
  formGroup: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    margin: "0 0 20px"
  }
});
export const stylesPage2 = theme => ({
  root: {
    margin: "80px 0"
  },
  container: {
    padding: "80px 0 140px 0"
  },
  head: {
    color: theme.palette.primary.light
  },
  form: {
    maxWidth: 600,
    margin: "auto"
  },
  group: {
    display: "flex",
    width: "100%",
    flexDirection: "row",
    justifyContent: "center"
  },
  input: {
    width: "100%",
    margin: "0 0 20px 0"
  },
  select: {
    width: "100%",
    margin: "0 0 20px 0"
  },
  failedText: {
    color: "red"
  },
  formButton: {
    width: "100%",
    padding: 20,
    margin: "0 0 40px"
  },
  formLabel: {
    margin: "10px 0 10px",
    fontSize: "20px",
    color: "black"
  },
  checkboxErrorText: {
    margin: "-10px 0 10px 0"
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    margin: "0 0 20px"
  },
  formHelperText: {
    margin: "0 0 10px",
    fontSize: "15px"
  }
});

// custom MUI friendly TEXT input
export const renderTextField = ({
  input,
  name,
  label,
  meta: { touched, error },
  classes,
  ...custom
}) => (
  <TextField
    label={label}
    error={touched && error}
    variant="outlined"
    className={classes.input}
    helperText={touched && error}
    {...input}
    {...custom}
    data-test="component-text-field"
  />
);

// custom MUI friendly SELECT input
export const renderSelect = ({
  input,
  name,
  label,
  classes,
  meta: { error, touched },
  labelWidth,
  options,
  formControlName,
  ...custom
}) => (
  <FormControl
    variant="outlined"
    className={classes[formControlName] || classes.formControl}
    error={error && touched}
    {...custom}
  >
    <InputLabel htmlFor={name}>{label}</InputLabel>
    <Select
      native
      onChange={input.onChange}
      className={classes.select}
      value={input.value.toLowerCase()}
      input={{ input: <OutlinedInput labelWidth={labelWidth} />, ...input }}
      inputProps={{ ...input }}
      data-test="component-select"
    >
      {options.map(item => (
        <option key={uuid.v4()} value={item.toLowerCase()}>
          {item}
        </option>
      ))}
    </Select>
  </FormControl>
);

// custom MUI friendly CHECKBOX input
export const renderCheckbox = ({
  input,
  label,
  validate,
  classes,
  meta: { touched, error },
  ...custom
}) => (
  <FormControl error={touched && error}>
    <FormControlLabel
      label={label}
      control={
        <Checkbox
          color="primary"
          checked={input.value ? true : false}
          onChange={input.onChange}
          {...custom}
          className={classes.checkbox}
          data-test="component-checkbox"
          name="checkbox"
        />
      }
    />
    {touched && error && (
      <FormHelperText className={classes.checkboxErrorText}>
        {error}
      </FormHelperText>
    )}
  </FormControl>
);

TextField.propTypes = {
  input: PropTypes.shape({
    onBlur: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    onDragStart: PropTypes.func.isRequired,
    onDrop: PropTypes.func.isRequired,
    onFocus: PropTypes.func.isRequired,
    value: PropTypes.string
  }),
  name: PropTypes.string,
  label: PropTypes.string,
  touched: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  helperText: PropTypes.oneOfType([PropTypes.string, PropTypes.bool])
};
Select.propTypes = {
  input: PropTypes.shape({
    onBlur: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    onDragStart: PropTypes.func.isRequired,
    onDrop: PropTypes.func.isRequired,
    onFocus: PropTypes.func.isRequired,
    value: PropTypes.string
  }),
  name: PropTypes.string,
  label: PropTypes.string,
  labelWidth: PropTypes.string,
  formControlName: PropTypes.string,
  options: PropTypes.array,
  touched: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool])
};
Checkbox.propTypes = {
  input: PropTypes.shape({
    onBlur: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    onDragStart: PropTypes.func.isRequired,
    onDrop: PropTypes.func.isRequired,
    onFocus: PropTypes.func.isRequired,
    value: PropTypes.string
  }),
  name: PropTypes.string,
  label: PropTypes.string,
  touched: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  checked: PropTypes.bool
};
FormControl.propTypes = {
  touched: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool])
};
