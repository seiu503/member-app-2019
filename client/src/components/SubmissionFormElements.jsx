import React from "react";
import shortid from "shortid";
import PropTypes from "prop-types";
import { openSnackbar } from "../containers/Notifier";
import { Translate } from "react-localize-redux";

import TextField from "@material-ui/core/TextField";
import Select from "@material-ui/core/Select";
import Checkbox from "@material-ui/core/Checkbox";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormLabel from "@material-ui/core/FormLabel";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";

import { camelCaseConverter, formatDate, formatDateTime } from "../utils";

import { forwardRef } from "react";
import AddBox from "@material-ui/icons/AddBox";
import ArrowUpward from "@material-ui/icons/ArrowUpward";
import Check from "@material-ui/icons/Check";
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import ChevronRight from "@material-ui/icons/ChevronRight";
import Clear from "@material-ui/icons/Clear";
import DeleteOutline from "@material-ui/icons/DeleteOutline";
import Edit from "@material-ui/icons/Edit";
import FilterList from "@material-ui/icons/FilterList";
import FirstPage from "@material-ui/icons/FirstPage";
import LastPage from "@material-ui/icons/LastPage";
import Remove from "@material-ui/icons/Remove";
import SaveAlt from "@material-ui/icons/SaveAlt";
import Search from "@material-ui/icons/Search";
import ViewColumn from "@material-ui/icons/ViewColumn";

export const tableIcons = {
  Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
  DetailPanel: forwardRef((props, ref) => (
    <ChevronRight {...props} ref={ref} />
  )),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
  Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef((props, ref) => (
    <ChevronLeft {...props} ref={ref} />
  )),
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <ArrowUpward {...props} ref={ref} />),
  ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
  ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />)
};

export const handleError = err => {
  return openSnackbar(
    "error",
    err || "Sorry, something went wrong. Please try again."
  );
};

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
export const languageOptions = [
  "",
  "English",
  "ASL (Sign Language)",
  "Cantonese",
  "Cantonese AND Mandarin",
  "Mandarin",
  "Russian",
  "Spanish",
  "Vietnamese",
  "Amharic",
  "Arabic",
  "Haitian Creole"
];
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

export const paymentTypes = ["Check", "Card"];

// user-friendly names for employer type codes
export const employerTypeMap = {
  PNP: "Non-Profit",
  Retirees: "Retired",
  State: "State Agency",
  "Nursing Homes": "Nursing Home",
  "State Homecare": "State Homecare or Personal Support",
  "Higher Ed": "Higher Education",
  "Local Gov": "Local Government (City, County, School District)",
  AFH: "Adult Foster Home",
  "Child Care": "Child Care",
  "Private Homecare": "Private Homecare Agency",
  "Community Members": "Community Member"
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

// convert MM DD YYYY to SF-formatted birthdate
export const formatBirthdate = formValues => {
  const dobRaw = `${formValues.mm}/${formValues.dd}/${formValues.yyyy}`;
  return formatSFDate(dobRaw);
};

// find matching employer object from redux store
export const findEmployerObject = (employerObjects, employerName) =>
  employerObjects
    ? employerObjects.filter(obj => {
        if (employerName.toLowerCase() === "community member") {
          return obj.Name.toLowerCase() === "community members";
        }
        return obj.Name.toLowerCase() === employerName.toLowerCase();
      })[0]
    : { Name: "" };

// MUI styles object
export const stylesPage1 = theme => ({
  formContainer: {
    padding: "80px 0 140px 0",
    margin: "auto 0 auto 50%",
    [theme.breakpoints.down("xl")]: {
      margin: "44px 0 auto 50%"
    },
    [theme.breakpoints.down("lg")]: {
      padding: "20px 0"
    },
    [theme.breakpoints.down("md")]: {
      margin: "44px auto"
    },
    [theme.breakpoints.only("xs")]: {
      width: "100vw",
      position: "absolute",
      left: 0,
      top: 0,
      margin: "36px auto"
    }
  },
  sectionContainer: {},
  head: {
    color: theme.palette.primary.light,
    fontSize: "2em",
    fontWeight: 700,
    lineHeight: 1.1,
    marginBottom: 15
  },
  form: {
    maxWidth: 600,
    margin: "auto",
    background: "white",
    padding: "20px 20px 40px 20px",
    borderRadius: "0 0 4px 4px",
    [theme.breakpoints.only("xs")]: {
      padding: "15px 15px 40px 15px"
    }
  },
  buttonWrap: {
    width: "100%",
    padding: "0 20px 40px 0",
    display: "flex",
    justifyContent: "flex-end"
  },
  buttonWrapTab3: {
    width: "100%",
    padding: "40px 20px 0 0",
    display: "flex",
    justifyContent: "flex-start"
  },
  next: {
    textTransform: "none",
    fontSize: "1.3rem",
    padding: "6px 20px",
    color: theme.palette.secondary.main,
    "&:hover": {
      backgroundColor: theme.palette.primary.light
    }
  },
  verticalGroup: {
    width: "100%",
    display: "flex",
    flexDirection: "column"
  },
  horizGroup: {
    width: "100%",
    display: "flex",
    flexDirection: "row"
  },
  back: {
    textTransform: "none",
    fontSize: "1.3rem",
    padding: "6px 20px",
    color: theme.palette.secondary.main,
    "&:hover": {
      backgroundColor: theme.palette.primary.light
    },
    marginRight: 40
  },
  formSection: {
    paddingTop: 20
  },
  group: {
    display: "flex",
    width: "100%",
    flexDirection: "row",
    justifyContent: "center"
  },
  groupLeft: {
    display: "flex",
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-start"
  },
  select: {
    width: "100%",
    margin: "0 0 30px 0"
  },
  selectRight: {
    textAlign: "right",
    width: "100%",
    margin: "0 0 30px 0",
    direction: "rtl"
  },
  failedText: {
    color: "red"
  },
  formButton: {
    width: "100%",
    padding: 20,
    margin: "25px 0 40px"
  },
  clearButton: {
    width: "100%",
    padding: 10,
    margin: "0"
  },
  formControl: {
    width: "100%"
  },
  formControlLabel: {
    width: "100%"
  },
  formControlDate: {
    width: "15%",
    minWidth: 80
  },
  formLabel: {
    margin: "10px 0"
  },
  formHelperText: {
    margin: "-25px 0 30px 0"
  },
  checkboxErrorText: {
    margin: "-10px 0 10px 0"
  },
  formGroup: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start"
  },
  formGroup2Col: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "space-between",
    [theme.breakpoints.down("xs")]: {
      flexWrap: "wrap"
    }
  },
  formGroup2ColShort: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "space-between",
    width: 280
  },
  input: {
    width: "100%",
    margin: "0 0 30px 0"
  },
  input2Col: {
    width: "48%",
    [theme.breakpoints.down("xs")]: {
      width: "100%",
      display: "block"
    }
  },
  controlCheckbox: {
    margin: "-35px 0 40px 0"
  },
  formHelperTextLegal: {
    margin: "-50px 0 50px 0",
    fontSize: "14px",
    lineHeight: "1.2em"
  },
  sigBox: {
    border: "1px solid lightgrey",
    "border-radius": "5px",
    margin: "0 0 32px",
    width: "100%"
  },
  buttonLink: {
    background: "none",
    border: "none",
    padding: "0",
    font: " inherit",
    "border-bottom": "1px solid blue",
    cursor: " pointer",
    color: "blue"
  },
  horizRadio: {
    display: "flex",
    flexDirection: "row"
  },
  horizRadioBold: {
    fontWeight: 700
  },
  subhead: {
    color: theme.palette.primary.light,
    fontSize: "1.5em",
    fontWeight: 400,
    paddingBottom: 20
  },
  paymentCopy: {
    paddingBottom: "1.5em"
  },
  card: {
    display: "flex",
    [theme.breakpoints.down("xs")]: {
      flexDirection: "column"
    }
  },
  details: {
    display: "flex",
    flexDirection: "column"
  },
  content: {
    flex: "1 0 auto"
  },
  cover: {
    minWidth: 200,
    minHeight: 200
  },
  cardHead: {
    color: theme.palette.primary.light,
    fontWeight: 400,
    paddingBottom: 10
  },
  quoteAttr: {
    color: theme.palette.primary.light,
    fontStyle: "italic",
    paddingTop: 10
  },
  pullQuote: {
    textIndent: 20
  },
  suggestedAmounts: {
    display: "block",
    flexWrap: "wrap",
    margin: "0 -1.666666666666667% 13px",
    paddingTop: 35
  },
  suggestedAmountBoxes: {
    flexDirection: "row",
    flexWrap: "nowrap"
  },
  suggestedAmountBox: {
    width: "21%",
    height: 60,
    margin: "13px 1.666666666666667% 0",
    display: "inline-block"
  },
  boxLabel: {
    height: "100%",
    fontSize: 20,
    lineHeight: "60px",
    fontWeight: 300,
    color: "#4C4C4C",
    textAlign: "center",
    border: "1px solid #C4C3C3",
    borderRadius: 3,
    display: "block",
    transition:
      "color 0.1s, background-color 0.1s, border-color 0.1s, font-weight 0.1s",
    position: "relative",
    cursor: "pointer",
    margin: 0
  },
  boxInput: {
    float: "left",
    opacity: 0,
    width: 0,
    height: 0,
    position: "absolute",
    padding: 0,
    margin: 0,
    border: 0,
    "&:focus + label": {
      outline: "rgba(83,16,120, 0.5) auto 3px"
    },
    "&:checked + label": {
      borderColor: "#531078",
      color: "#531078",
      borderWidth: 2,
      fontWeight: 700
    },
    "&:checked + $boxLabel": {
      borderColor: "#531078",
      color: "#531078",
      borderWidth: 2,
      fontWeight: 700
    }
  },
  capeAmount: {
    display: "flex",
    flexDirection: "row",
    width: "100%"
  },
  boxCurrency: {
    fontSize: 14,
    lineHeight: "14px",
    fontWeight: 400,
    verticalAlign: "text-top",
    position: "absolute",
    top: 22,
    left: -22,
    whiteSpace: "nowrap"
  },
  boxItem: {
    position: "absolute",
    height: "100%"
  },
  boxAmount: {
    position: "relative",
    left: -10
  },
  capeRadioLabel: {
    fontSize: "1.2em",
    color: theme.palette.primary.light,
    fontWeight: 700,
    textAlign: "center"
  }
});
export const stylesPage2 = theme => ({
  root: {
    margin: "80px 0"
  },
  formContainer: {
    padding: "80px 0 140px 0",
    margin: "44px 0 auto 50%",
    [theme.breakpoints.down("lg")]: {
      padding: "20px 0",
      margin: "44px auto"
    }
  },
  container: {
    padding: "40px 0 140px 0",
    margin: "44px auto"
  },
  head: {
    color: theme.palette.primary.light,
    fontSize: "2em",
    fontWeight: 700
  },
  checkIcon: {
    [theme.breakpoints.down("xs")]: {
      width: "100%",
      display: "flex",
      justifyContent: "center"
    }
  },
  successWrap: {
    display: "flex",
    [theme.breakpoints.down("xs")]: {
      flexWrap: "wrap"
    }
  },
  page2IntroText: {
    fontSize: "1.2rem",
    lineHeight: "1.4em",
    padding: "0 0 .5em .5em",
    [theme.breakpoints.down("xs")]: {
      padding: "0 0 .5em 0"
    }
  },
  form: {
    maxWidth: 600,
    margin: "auto",
    padding: "20px",
    background: "white"
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

// helper functions for localization package when translating labels
const inputLabelTranslateHelper = (id, label, translate) => {
  if (translate(id).includes("Missing translationId:")) {
    return label;
  } else {
    return translate(id);
  }
};
const optionsLabelTranslateHelper = (id, item, translate) => {
  let translatedLabel;
  if (id.includes("State")) {
    return item;
  }
  if (parseInt(item, 10)) {
    return item;
  }
  if (id.includes("employer")) {
    translatedLabel = translate(camelCaseConverter(item));
  } else {
    translatedLabel = translate(item.toLowerCase());
  }
  if (translatedLabel.includes("Missing translationId:")) {
    return item;
  } else {
    return translatedLabel;
  }
};

// custom MUI friendly TEXT input
export const renderTextField = ({
  input,
  id,
  name,
  label,
  meta: { touched, error },
  classes,
  twocol,
  short,
  mobile,
  translate,
  ...custom
}) => {
  return (
    <Translate>
      {({ translate }) => (
        <TextField
          label={inputLabelTranslateHelper(id, label, translate)}
          error={!!(touched && error)}
          variant="outlined"
          className={classes.input}
          style={
            twocol && !mobile
              ? { width: "48%" }
              : short
              ? { width: 150 }
              : { width: "100%", marginBottom: 30 }
          }
          helperText={touched && error}
          required={!!(touched && error)}
          {...input}
          {...custom}
          data-test="component-text-field"
          inputProps={{ id: id }}
        />
      )}
    </Translate>
  );
};

const selectStyle = align => (align === "right" ? { direction: "ltr" } : {});

// custom MUI friendly SELECT input
export const renderSelect = ({
  input,
  name,
  id,
  label,
  classes,
  align,
  meta: { error, touched },
  labelWidth,
  options,
  short,
  mobile,
  formControlName,
  ...custom
}) => (
  <Translate>
    {({ translate }) => (
      <FormControl
        variant="outlined"
        className={classes[formControlName] || classes.formControl}
        error={!!(error && touched)}
        {...custom}
        required={touched && error === "Required"}
        style={short ? { width: 80 } : mobile ? { width: "100%" } : {}}
      >
        <InputLabel htmlFor={name}>
          {inputLabelTranslateHelper(id, label, translate)}
        </InputLabel>
        <Select
          native
          input={
            <OutlinedInput labelWidth={labelWidth} inputProps={{ id: id }} />
          }
          className={align === "right" ? classes.selectRight : classes.select}
          value={input.value ? input.value.toLowerCase() : ""}
          onChange={input.onChange}
          {...custom}
          data-test="component-select"
        >
          {options.map(item => (
            <option
              key={shortid()}
              value={item ? item.toLowerCase() : ""}
              style={selectStyle(align)}
            >
              {optionsLabelTranslateHelper(id, item, translate)}
            </option>
          ))}
        </Select>
      </FormControl>
    )}
  </Translate>
);

// custom MUI friendly CHECKBOX input
export const renderCheckbox = ({
  input,
  label,
  id,
  validate,
  classes,
  meta: { touched, error },
  formControlName,
  localize,
  ...custom
}) => (
  <Translate>
    {({ translate }) => (
      <FormControl
        error={!!(touched && error)}
        className={classes[formControlName] || classes.formControl}
      >
        <FormControlLabel
          label={inputLabelTranslateHelper(id, label, translate)}
          control={
            <Checkbox
              color="primary"
              checked={input.value ? true : false}
              {...custom}
              {...input}
              className={classes.checkbox}
              data-test="component-checkbox"
              name="checkbox"
              inputProps={{ id: id }}
            />
          }
        />
        {touched && error && (
          <FormHelperText className={classes.checkboxErrorText}>
            {error}
          </FormHelperText>
        )}
      </FormControl>
    )}
  </Translate>
);

// const translateLabel = (label, localize, id) => {
//   const langArr = localize.languages;
//   for (let i = 0; i < langArr.length; i++) {
//     if (langArr[i].active) {
//       console.log("translations = ", localize.translations);
//       console.log(
//         "i =",
//         i,
//         "active language =",
//         langArr[i].code,
//         "label = ",
//         label,
//         "id = ",
//         id
//       );
//       return localize.translations.id[i];
//     } else return label;
//   }
// };

// custom MUI friendly RADIO group
export const renderRadioGroup = ({
  input,
  id,
  label,
  options,
  validate,
  classes,
  direction,
  meta: { touched, error },
  formControlName,
  legendClass,
  additionalOnChange,
  ...custom
}) => (
  <Translate>
    {({ translate }) => (
      <FormControl
        component="fieldset"
        error={!!(touched && error)}
        className={classes[formControlName] || classes.formControl}
      >
        <FormLabel component="legend" className={classes.radioLabel}>
          {translate(id)}
        </FormLabel>

        <RadioGroup
          data-test="component-radio-group"
          aria-label={formControlName}
          name={formControlName}
          className={
            direction === "vert" ? classes.verticalGroup : classes.horizGroup
          }
          onChange={(event, value) => {
            input.onChange(value);
            if (additionalOnChange) {
              additionalOnChange(event);
            }
          }}
        >
          {options.map(item => {
            return (
              <FormControlLabel
                key={shortid()}
                value={item}
                className={legendClass}
                control={
                  <Radio
                    checked={item.toString() === input.value.toString()}
                    color="primary"
                    inputProps={{ id: id }}
                    data-test="component-radio"
                  />
                }
                label={item}
              />
            );
          })}
        </RadioGroup>
        {touched && error && (
          <FormHelperText className={classes.checkboxErrorText}>
            {error}
          </FormHelperText>
        )}
      </FormControl>
    )}
  </Translate>
);

export const renderCAPERadioGroup = ({
  input,
  label,
  id,
  options,
  validate,
  classes,
  direction,
  meta: { touched, error },
  formControlName,
  legendClass,
  additionalOnChange,
  ...custom
}) => (
  <Translate>
    {({ translate }) => (
      <FormControl
        component="fieldset"
        error={!!(touched && error)}
        className={classes[formControlName] || classes.formControl}
      >
        <FormLabel component="legend" className={classes.capeRadioLabel}>
          {translate(id)}
        </FormLabel>

        <RadioGroup
          data-test="component-cape-radio-group"
          aria-label={formControlName}
          name={formControlName}
          id={formControlName}
          className={classes.horizGroup}
          onChange={(event, value) => {
            input.onChange(value);
            if (additionalOnChange) {
              additionalOnChange(event);
            }
          }}
        >
          {options.map(item => {
            let labelText = `$${item}`;
            if (item === "Other") {
              labelText = item;
            }
            return (
              <FormControlLabel
                key={shortid()}
                value={item}
                className={classes.suggestedAmountBox}
                label={labelText}
                labelPlacement="bottom"
                control={
                  <Radio
                    checked={item.toString() === input.value.toString()}
                    color="primary"
                    inputProps={{ id: id }}
                    data-test="component-radio"
                  />
                }
              />
            );
          })}
        </RadioGroup>
        {touched && error && (
          <FormHelperText className={classes.checkboxErrorText}>
            {error}
          </FormHelperText>
        )}
      </FormControl>
    )}
  </Translate>
);

export const hcwDirectDepositAuthText = (
  <React.Fragment>
    <p>
      Your full name, the network address you are accessing this page from, and
      the timestamp of submission will serve as signature indicating:
    </p>
    <p>
      I authorize the State of Oregon, or its fiscal agents, to provide SEIU
      Local 503’s Designated Secure Payment Processor (DSPP), my HCW/PSW UID,
      and the information for the bank account (bank account number, account
      holder’s name and routing number) on file with my employer (“Account”)
      that I have designated to receive the proceeds of my paycheck via direct
      deposit, and for my dues and/or other contributions to be deducted from
      this account one (1) business day after each pay processing date
      designated by my employer. If my employer makes direct deposit of my
      paycheck to a checking account and a savings account, I hereby authorize
      my employer to provide to Local 503’s DSPP the information for the
      checking account and for my dues and/or other contributions to be deducted
      from this account one (1) business day after each pay processing date
      designated by my employer.
    </p>
    <p>
      I understand that after the DSPP receives my Account information, SEIU or
      its designee will make reasonable efforts to contact me to confirm the
      accuracy of the Account information provided by my employer at least 10
      days in advance of making the first electronic funds transfer from my
      Account.
    </p>
    <p>
      I understand it is my responsibility to notify the Union of any changes to
      my Account information.
    </p>
  </React.Fragment>
);

export const hcwDPAText = (
  <React.Fragment>
    <p>
      Your full name, the network address you are accessing this page from, and
      the timestamp of submission will serve as signature indicating:
    </p>
    <p>
      In the event payroll deduction from my employer is not available or is not
      deemed practical by the Union, I authorize SEIU Local 503 to make
      withdrawals from my checking or savings account, in accordance with the
      authorization provided below or to another account I provide and authorize
      separately. I am authorized to make decisions about the account provided
      to the Union. SEIU will notify me of the transition to direct pay at the
      current mailing address on file with SEIU prior to initiating the first
      payment via debit card, credit card, checking, or savings account, as
      authorized below.
    </p>
    <p>
      I hereby authorize SEIU to initiate a recurring, automatic electronic
      funds transfer with my financial institution beginning on the date listed
      in the transition notice provided to me in order to deduct from the
      account listed below (or separately provided) amount of 1.7% of my gross
      earnings, and issue fund payments at a prorated amount up to $2.75 per
      month, except that the total minimum deduction shall be no less than $2.30
      per pay period and the maximum deduction shall be no more than $150 per
      pay period. Because the dues deduction is based on a percentage of gross
      earnings, the dollar amount deducted may change each month based on
      payroll dates and if my hours of work or rate of pay changes, and I agree
      to not receive any advance notice before the dues payment is deducted as
      long as the amount is between $2.30 and $150 per pay period. My authorized
      deductions shall be made based on the gross pay amount in the paycheck
      immediately preceding the pay processing date of the current transaction
      and shall be made one (1) business day after each pay processing date
      designated by my employer.
    </p>
    <p>
      The dues amount may change if authorized according to the requirements of
      the SEIU Local 503 Union Bylaws or the Service Employees International
      Union Constitution and Bylaws. If this happens, I authorize SEIU to
      initiate a recurring, automatic electronic funds transfer in the amount of
      the new dues amount when notified by SEIU in writing of the new amount and
      with at least ten (10) days’ notice before the next funds transfer date.
      In the case of checking and savings accounts, adjusting entries to correct
      errors are also authorized. I agree that these withdrawals and adjustments
      may be made electronically and under the Rules of the National Automated
      Clearing House Association. This authorization shall remain in effect
      until I revoke my authorization in writing or with another permitted
      method.
    </p>
    <p>
      I acknowledge that failure to pay my dues on a timely basis may affect my
      membership standing in the Union, as set forth in the SEIU Local 503
      Bylaws. Contributions to SEIU are not tax deductible as charitable
      contributions. However, they may be tax deductible as ordinary and
      necessary business expenses.
    </p>
  </React.Fragment>
);

export const afhDPAText = (
  <React.Fragment>
    <p>
      Your full name, the network address you are accessing this page from, and
      the timestamp of submission will serve as signature indicating:
    </p>
    <p>
      I authorize SEIU Local 503 or its Designated Secure Payment Processor
      (DSPP) to make withdrawals from my checking or savings account, in
      accordance with the authorization provided below or to another account I
      provide and authorize separately. I am authorized to make decisions about
      the account provided to the Union.
    </p>
    <p>
      I hereby authorize SEIU to initiate a recurring, automatic electronic
      funds transfer with my financial institution or a recurring, automatic
      credit card payment in the amount of 1.7% of Medicaid DD Base Rate, per
      Medicaid client for my membership dues, and issue fund payments of $2.75
      per month, except that the total minimum deduction shall be no less than
      $5.00 a month and the maximum deduction shall be no more than $300 a
      month. Because the dues amount is based on a percentage of the base
      Medicaid DD Base Rate, per Medicaid client, the dollar amount charged may
      change each month based on the base rate or the number of clients and I
      agree to not receive any advance notice before the dues payment is
      deducted as long as the amount is between $5.00 and $300 a month.
    </p>
    <p>
      The dues amount may change if authorized according to the requirements of
      the SEIU Local 503 Union Bylaws or the Service Employees International
      Union Constitution and Bylaws. If this happens, I authorize SEIU to
      initiate a recurring, automatic electronic funds transfer or a recurring,
      automatic credit card payment in the amount of the new dues amount when
      notified by SEIU in writing of the new amount and with at least ten (10)
      days’ notice before the next funds transfer date. In the case of checking
      and savings accounts, adjusting entries to correct errors are also
      authorized. I agree that these withdrawals and adjustments may be made
      electronically and under the Rules of the National Automated Clearing
      House Association. This authorization shall remain in effect until I
      revoke my authorization in writing or with another permitted method.
    </p>
    <p>
      I understand it is my responsibility to notify the Union of any changes to
      my Account information, any changes to the number of Medicaid clients and
      any changes to my bargaining unit status.
    </p>
    <p>
      I acknowledge that failure to pay my dues on a timely basis may affect my
      membership standing in the Union, as set forth in the SEIU Local 503
      Bylaws.
    </p>
    <p>
      Contributions to SEIU are not tax deductible as charitable contributions.
      However, they may be tax deductible as ordinary and necessary business
      expenses.
    </p>
  </React.Fragment>
);

export const retireeDPAText = freq => (
  <React.Fragment>
    <p>
      Your full name, the network address you are accessing this page from, and
      the timestamp of submission will serve as signature indicating:
    </p>
    <p>
      I hereby authorize SEIU Local 503 or its Designated Secure Payment
      Processor (DSPP to initiate a recurring, automatic electronic funds
      transfer from my checking or savings account or recurring, automatic
      credit card payment in the amount of{" "}
      {freq === "m" ? "$5 per month." : "$60 per year."}
    </p>
    <p>
      The dues amount may change if authorized according to the requirements of
      the SEIU Local 503 Union Bylaws or the Service Employees International
      Union Constitution and Bylaws. If this happens, I authorize SEIU to
      initiate a recurring, automatic electronic funds transfer or a recurring,
      automatic credit card payment in the amount of the new dues amount when
      notified by SEIU in writing of the new amount and with at least ten (10)
      days’ notice before the next funds transfer date. In the case of checking
      and savings accounts, adjusting entries to correct errors are also
      authorized. I agree that these withdrawals and adjustments may be made
      electronically and under the Rules of the National Automated Clearing
      House Association. This authorization shall remain in effect until I
      revoke my authorization in writing or with another permitted method.
    </p>
    <p>
      I understand it is my responsibility to notify the Union of any changes to
      my Account information.
    </p>
    <p>
      I acknowledge that failure to pay my dues on a timely basis may affect my
      membership standing in the Union, as set forth in the SEIU Local 503
      Bylaws.
    </p>
    <p>
      Contributions to SEIU are not tax deductible as charitable contributions.
      However, they may be tax deductible as ordinary and necessary business
      expenses.
    </p>
  </React.Fragment>
);

export const communityDPAText = (
  <React.Fragment>
    <p>
      Your full name, the network address you are accessing this page from, and
      the timestamp of submission will serve as signature indicating:
    </p>
    <p>
      I hereby authorize SEIU Local 503 or its Designated Secure Payment
      Processor (DSPP to initiate a recurring, automatic electronic funds
      transfer from my checking or savings account or recurring, automatic
      credit card payment in the amount of $10 per month.
    </p>
    <p>
      The dues amount may change if authorized according to the requirements of
      the SEIU Local 503 Union Bylaws or the Service Employees International
      Union Constitution and Bylaws. If this happens, I authorize SEIU to
      initiate a recurring, automatic electronic funds transfer or a recurring,
      automatic credit card payment in the amount of the new dues amount when
      notified by SEIU in writing of the new amount and with at least ten (10)
      days’ notice before the next funds transfer date. In the case of checking
      and savings accounts, adjusting entries to correct errors are also
      authorized. I agree that these withdrawals and adjustments may be made
      electronically and under the Rules of the National Automated Clearing
      House Association. This authorization shall remain in effect until I
      revoke my authorization in writing or with another permitted method.
    </p>
    <p>
      I understand it is my responsibility to notify the Union of any changes to
      my Account information.
    </p>
    <p>
      I acknowledge that failure to pay my dues on a timely basis may affect my
      membership standing in the Union, as set forth in the SEIU Local 503
      Bylaws.
    </p>
    <p>
      Contributions to SEIU are not tax deductible as charitable contributions.
      However, they may be tax deductible as ordinary and necessary business
      expenses.
    </p>
  </React.Fragment>
);

export const membershipTerms = (
  <React.Fragment>
    <p>
      Your full name, the network address you are accessing this page from, and
      the timestamp of submission will serve as signature indicating:
    </p>
    <p>
      I hereby designate SEIU Local 503, OPEU (or any successor Union entity) as
      my desired collective bargaining agent. I also hereby authorize my
      employer to deduct from my wages, commencing with the next payroll period,
      all Union dues and other fees or assessments as shall be certified by SEIU
      Local 503, OPEU (or any successor Union entity) and to remit those amounts
      to such Union. This authorization/delegation is unconditional, made in
      consideration for the cost of representation and other actions in my
      behalf by the Union and is made irrespective of my membership in the
      Union.
    </p>
    <p>
      This authorization is irrevocable for a period of one year from the date
      of execution and from year to year thereafter unless not less than thirty
      (30) and not more than forty-five (45) days prior to the end of any annual
      period or the termination of the contract between my employer and the
      Union, whichever occurs first, I notify the Union and my employer in
      writing, with my valid signature, of my desire to revoke this
      authorization.
    </p>
  </React.Fragment>
);

export const capeLegalCheckoff = (
  <React.Fragment>
    <p>
      By submitting this form, I hereby authorize my Employer to deduct the
      designated amount from my monthly earnings as a contribution to SEIU Local
      503, OPEU CAPE.
    </p>
    <p>
      My contribution will be used to support member-endorsed candidates and for
      expenditures in connection with elections for Local, Legislative,
      Statewide, and Federal offices. These elected officials make critical
      decisions on salaries, health care, retirement, and other benefits and
      laws affecting SEIU Local 503, OPEU members.{" "}
    </p>
    <p>
      A portion of this contribution (as much as 48% for the average
      contributor) may be used by SEIU for federal elections.
    </p>
    <p>
      The contribution amounts indicated above are only suggestions and I may
      choose not to contribute or to vary my contribution amount without
      reprisal from my Union or my Employer.{" "}
    </p>
    <p>
      As per federal law, only union members and union executive/administrative
      staff who are U.S. citizens or lawful permanent residents are eligible to
      contribute to SEIU COPE (the Federal Committee on Political Education).
      This authorization is made voluntarily and is not a condition of my
      employment or membership in the union.{" "}
    </p>
    <p>
      This authorization shall remain in effect until revoked in writing by me.
      This contribution is in addition to union dues. This contribution is not
      deductible for federal income tax purposes.
    </p>
  </React.Fragment>
);

export const capeLegalStripe = (
  <React.Fragment>
    <p>By submitting this form I am agreeing with the terms stated here:</p>
    <p>
      This authorization is made voluntarily and is not a condition of my
      employment or membership in the union.
    </p>
    <p>
      The contribution amounts indicated above are only suggestions and I may
      choose not to contribute or to vary my contribution amount without
      reprisal from my Union or my Employer.
    </p>
    <p>
      Federal law states that only represented workers and
      executive/administrative staff who are U.S. citizens or lawful permanent
      residents are eligible to contribute to CAPE.
    </p>
    <p>
      My contribution will be used to support member-endorsed candidates and for
      expenditures in connection with elections for Local, Legislative,
      Statewide and Federal offices. These elected officials make critical
      decisions on salaries, health care, retirement and other benefits and laws
      affecting SEIU Local 503 members. A portion of this contribution (as much
      as 48% for the average contributor) may be used by SEIU for federal
      elections.
    </p>
    <p>
      This contribution is in addition to dues and existing contributions
      through payroll deduction/ACH transfer.
    </p>
  </React.Fragment>
);

export const blankSig =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCABkAlIDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AKpgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//9k=";

export const retireeDuesCopy =
  "Monthly dues are $5 and will be deducted on the 10th day of each month from the payment method you provide below. Dues are set by the SEIU Local 503 bylaws.";

export const afhDuesCopy = afhDuesRate =>
  `Monthly dues are $${afhDuesRate.toFixed(
    2
  )}, calculated at $14.84 per Medicaid resident in your home(s), plus $2.75 per month. Dues will be deducted on the 10th day of each month from the payment method you provide below.`;

export const commDuesCopy =
  "Monthly dues are $10 and will be deducted on the 10th day of each month from the payment method you provide below. Dues are set by the SEIU Local 503 bylaws.";

export const submTableFieldList = [
  { title: "Submission Status", field: "submission_status", hidden: false },
  {
    title: "Submission Date",
    field: "submission_date",
    hidden: false,
    render: rowData => formatDateTime(rowData.submission_date),
    defaultSort: "desc"
  },
  { title: "First Name", field: "first_name", hidden: false },
  { title: "Last Name", field: "last_name", hidden: false },
  { title: "Home Email", field: "home_email", hidden: false },
  { title: "Employer", field: "employer_name", hidden: false },
  {
    title: "Online Campaign Source",
    field: "online_campaign_source",
    hidden: false
  },
  { title: "Contact ID", field: "contact_id", hidden: false },
  { title: "IP Address", field: "ip_address", hidden: false },
  { title: "Agency Number", field: "agency_number", hidden: false },
  { title: "Subdivision", field: "account_subdivision", hidden: false },
  { title: "Birthdate", field: "birthdate", hidden: true },
  { title: "Cell Phone", field: "cell_phone", hidden: true },
  { title: "Home Street", field: "home_street", hidden: true },
  { title: "Home City", field: "home_city", hidden: true },
  { title: "Home State", field: "home_state", hidden: true },
  { title: "Home Zip", field: "home_zip", hidden: true },
  { title: "Preferred Language", field: "preferred_language", hidden: true },
  { title: "termsagree", field: "terms_agree", hidden: true },
  { title: "Signature", field: "signature", hidden: true },
  {
    title: "Text Authorization Opt Out",
    field: "text_auth_opt_out",
    hidden: true
  },
  { title: "Legal Language", field: "legal_language", hidden: true },
  {
    title: "Maintenance of Effort",
    field: "maintenance_of_effort",
    hidden: true
  },
  {
    title: "503 CBA App Date",
    field: "seiu503_cba_app_date",
    type: "date",
    render: rowData => formatDateTime(rowData.seiu503_cba_app_date),
    hidden: true
  },
  {
    title: "Direct Pay Authorization",
    field: "direct_pay_auth",
    type: "date",
    render: rowData => formatDateTime(rowData.direct_pay_auth),
    hidden: true
  },
  {
    title: "Direct Deposit Authorization",
    field: "direct_deposit_auth",
    type: "date",
    render: rowData => formatDateTime(rowData.direct_deposit_auth),
    hidden: true
  },
  {
    title: "Immediate Past Member Status",
    field: "immediate_past_member_status",
    hidden: true
  },
  { title: "Submission Errors", field: "submission_errors", hidden: true },
  { title: "Dues Day", field: "deduction_day_of_month", hidden: true },
  {
    title: "Active Account Last 4",
    field: "active_method_last_four",
    hidden: true
  },
  { title: "Unioni.se MemberID", field: "member_short_id", hidden: true },
  { title: "Payment Method", field: "payment_method", hidden: true },
  {
    title: "AFH Number of Residents",
    field: "medicaid_residents",
    hidden: true
  },
  { title: "Job Class/Title", field: "job_title", hidden: true },
  { title: "Legal Language", field: "cape_legal", hidden: true },
  { title: "CAPE Amount", field: "cape_amount", hidden: true },
  { title: "Employer Type", field: "employer_type", hidden: true },
  { title: "Mail-To City", field: "mail_to_city", hidden: true },
  { title: "Mail-To State/Province", field: "mail_to_state", hidden: true },
  { title: "Mail-To Street", field: "mail_to_street", hidden: true },
  {
    title: "Mail-To Zip/Postal Code",
    field: "mail_to_postal_code",
    hidden: true
  },
  { title: "Ethnicity", field: "ethnicity", hidden: true },
  { title: "LGBTQIA+ ID", field: "lgbtq_id", hidden: true },
  { title: "Trans ID", field: "trans_id", hidden: true },
  { title: "Disability ID", field: "disability_id", hidden: true },
  {
    title: "Deaf or hard-of-hearing",
    field: "deaf_or_hard_of_hearing",
    hidden: true
  },
  {
    title: "Blind or visually impaired",
    field: "blind_or_visually_impaired",
    hidden: true
  },
  { title: "Gender", field: "gender", hidden: true },
  {
    title: "Gender Other - Description",
    field: "gender_other_description",
    hidden: true
  },
  { title: "Pronouns", field: "gender_pronoun", hidden: true },
  {
    title: "Hire date",
    field: "hire_date",
    hidden: true,
    type: "date",
    render: rowData => formatDate(rowData.hire_date)
  },
  { title: "Worksite", field: "worksite", hidden: true },
  { title: "Work Phone", field: "work_phone", hidden: true },
  { title: "Work email", field: "work_email", hidden: true }
];

TextField.propTypes = {
  input: PropTypes.shape({
    onBlur: PropTypes.func,
    onChange: PropTypes.func,
    onDragStart: PropTypes.func,
    onDrop: PropTypes.func,
    onFocus: PropTypes.func,
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
    onBlur: PropTypes.func,
    onChange: PropTypes.func,
    onDragStart: PropTypes.func,
    onDrop: PropTypes.func,
    onFocus: PropTypes.func,
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
    onBlur: PropTypes.func,
    onChange: PropTypes.func,
    onDragStart: PropTypes.func,
    onDrop: PropTypes.func,
    onFocus: PropTypes.func,
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
