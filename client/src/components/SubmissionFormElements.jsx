import React from "react";
import shortid from "shortid";
import PropTypes from "prop-types";
import { openSnackbar } from "../containers/Notifier";
import { Translate } from "react-localize-redux";

import {
  TextField,
  Select,
  Checkbox,
  OutlinedInput,
  InputLabel,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
  InputAdornment,
  LanguageIcon
} from "@mui/material";

import { camelCaseConverter, formatDate, formatDateTime } from "../utils";

import { forwardRef } from "react";
import {
  ArrowUpward,
  ChevronLeft,
  ChevronRight,
  Clear,
  DeleteForeverIcon,
  Edit,
  FilterList,
  FirstPage,
  LastPage,
  Remove,
  SaveAlt,
  Search,
  ViewColumn,
  CheckBoxOutlineBlankIcon,
  CheckBox
} from "@mui/icons-material";

export const tableIcons = {
  CheckBoxBlank: forwardRef((props, ref) => (
    <CheckBoxOutlineBlankIcon {...props} ref={ref} />
  )),
  CheckBoxChecked: forwardRef((props, ref) => (
    <CheckBoxIcon {...props} ref={ref} />
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
  ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <DeleteForeverIcon {...props} ref={ref} />)
};

export const handleError = err => {
  return openSnackbar(
    "error",
    err || "Sorry, something went wrong. Please try again."
  );
  // console.log(err);
};

export const removeFalsy = obj => {
  let newObj = {};
  Object.keys(obj).forEach(prop => {
    if (obj[prop]) {
      newObj[prop] = obj[prop];
    }
  });
  return newObj;
};

// hardcoded select options
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
  "Somali",
  "Spanish",
  "Vietnamese",
  "Amharic",
  "Arabic",
  "Farsi",
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
// set suggested donation amounts dynamically
// based on member's existing donation level
export const generateCAPEOptions = existingCAPE => {
  const optionSteps = [10, 13, 15, 18, 20, 23, 25, 28, 30, 33, 35, 38, 40, 50];
  const oneTimeSteps = [15, 20, 25, 30, 40, 50, 100];
  const monthlyOptions = [];
  const oneTimeOptions = [];
  if (existingCAPE) {
    // if the member has an existing monthly CAPE contribution,
    // start at the next highest amount and then
    // suggest two higher amounts as possible options
    const nextHighestOption = optionSteps.find(option => option > existingCAPE);
    const optionIndex = optionSteps.indexOf(nextHighestOption);
    monthlyOptions.push(
      optionSteps[optionIndex],
      optionSteps[optionIndex + 1],
      optionSteps[optionIndex + 2],
      "Other"
    );
    // console.log(monthlyOptions);
    const nextHighestOptionOneTime = oneTimeSteps.find(
      option => option > existingCAPE
    );
    const oneTimeIndex = oneTimeSteps.indexOf(nextHighestOptionOneTime);
    oneTimeOptions.push(
      oneTimeSteps[oneTimeIndex],
      oneTimeSteps[oneTimeIndex + 1],
      oneTimeSteps[oneTimeIndex + 2],
      "Other"
    );
    return {
      monthlyOptions,
      oneTimeOptions
    };
  } else {
    // if no existing contribution on file, then return the default amounts
    return {
      monthlyOptions: [10, 13, 15, "Other"],
      oneTimeOptions: [15, 20, 25, "Other"]
    };
  }
};

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
  "Community Members": "Community Member",
  "COMMUNITY MEMBERS": "Community Member",
  "SEIU LOCAL 503 OPEU": ""
  // "SEIU LOCAL 503 OPEU": "SEIU 503 Staff"
  // removing staff from picklist options
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

export const calcEthnicity = values => {
  const {
    africanOrAfricanAmerican,
    arabAmericanMiddleEasternOrNorthAfrican,
    asianOrAsianAmerican,
    hispanicOrLatinx,
    nativeAmericanOrIndigenous,
    nativeHawaiianOrOtherPacificIslander,
    white,
    other,
    declined
  } = values;
  if (declined) {
    return "declined";
  }
  let combinedEthnicities = "";
  const ethnicities = {
    africanOrAfricanAmerican,
    arabAmericanMiddleEasternOrNorthAfrican,
    asianOrAsianAmerican,
    hispanicOrLatinx,
    nativeAmericanOrIndigenous,
    nativeHawaiianOrOtherPacificIslander,
    white,
    other
  };
  const ethnicitiesArray = Object.entries(ethnicities);
  ethnicitiesArray.forEach(i => {
    if (i[1]) {
      if (combinedEthnicities === "") {
        combinedEthnicities = i[0];
      } else {
        combinedEthnicities += `, ${i[0]}`;
      }
    }
  });
  return combinedEthnicities;
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

// MUI styles objects
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
  formContainerEmbed: {
    padding: "80px 0 140px 0",
    margin: "auto",
    [theme.breakpoints.only("xs")]: {
      width: "100vw",
      position: "absolute",
      left: 0,
      top: 0,
      margin: "auto"
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
    justifyContent: "flex-end",
    marginTop: 20
  },
  buttonWrapTab3: {
    width: "100%",
    padding: "40px 20px 0 0",
    display: "flex",
    justifyContent: "flex-start"
  },
  buttonWrapCAPE: {
    width: "100%",
    padding: "0 20px 40px 0",
    display: "flex",
    justifyContent: "space-between"
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
  nextSmall: {
    textTransform: "none",
    fontSize: ".8rem",
    padding: "3px 10px",
    color: theme.palette.secondary.light,
    "&:hover": {
      backgroundColor: theme.palette.primary.light
    }
  },
  backSmall: {
    textTransform: "none",
    fontSize: ".8rem",
    padding: "3px 10px",
    color: theme.palette.secondary.light,
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
    flexDirection: "row",
    justifyContent: "center"
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
  formGroupTopMargin: {
    marginTop: 30
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
    margin: "-35px 0 0 0"
  },
  controlCheckboxMargin: {
    margin: "-35px 0 40px 0"
  },
  controlCheckboxMarginBold: {
    margin: "-35px 0 40px 0",
    fontWeight: 700
  },
  controlCheckboxMarginBoldSpacer: {
    margin: "0 0",
    fontWeight: 700
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
  horizRadioCenter: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    margin: "auto",
    textAlign: "center"
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
    paddingTop: 20,
    marginTop: 15,
    backgroundColor: "#FBE796"
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
  radioLabel: {
    textAlign: "center"
  },
  bodyCenter: {
    width: "100%",
    textAlign: "center"
  },
  capeRadioLabel: {
    fontSize: "1.2em",
    color: theme.palette.primary.light,
    fontWeight: 700,
    textAlign: "center"
  },
  checkboxLabelBold: {
    "& span": {
      fontWeight: "700 !important"
    }
  },
  checkboxLabelMini: {
    "& span": {
      fontWeight: "400 !important",
      fontSize: 14
    }
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
  input2Col: {
    width: "48%",
    [theme.breakpoints.down("xs")]: {
      width: "100%",
      display: "block"
    }
  }
});

// helper functions for localization package when translating labels
// this is required so that only the label is translated and the not value
// of select, checkbox, and text inputs
export const inputLabelTranslateHelper = (id, label, translate) => {
  if (translate(id).includes("Missing translationId:")) {
    return label;
  } else {
    return translate(id);
  }
};
export const optionsLabelTranslateHelper = (id, item, translate) => {
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

// custom MUI friendly TEXT input with translated label
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
  additionalOnChange,
  dataTestId,
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
          data-testid={dataTestId}
          inputProps={{ id: id }}
          onBlur={event => {
            input.onBlur();
            if (additionalOnChange) {
              additionalOnChange(event);
            }
          }}
        />
      )}
    </Translate>
  );
};

const selectStyle = align => (align === "right" ? { direction: "ltr" } : {});

export const languageMap = {
  English: "en",
  Español: "es",
  Русский: "ru",
  "Tiếng Việt": "vi",
  简体中文: "zh"
};

export const LanguagePicker = React.forwardRef((props, ref) => {
  return (
    <Translate>
      {({ translate }) => (
        <FormControl
          variant="outlined"
          className={props.classes.languagePicker}
        >
          <InputLabel
            htmlFor={props.name}
            className={props.classes.languagePickerLabel}
            classes={{
              shrink: props.classes.labelShrink,
              focused: props.classes.labelFocused
            }}
          >
            {inputLabelTranslateHelper(props.id, props.label, translate)}
          </InputLabel>
          <Select
            native
            autoWidth={true}
            onChange={props.onChange}
            startAdornment={
              <InputAdornment position="start">
                <LanguageIcon color="inherit" />
              </InputAdornment>
            }
            input={
              <OutlinedInput
                inputRef={ref}
                classes={{
                  notchedOutline: props.classes.notched,
                  adornedStart: props.classes.adornedStart
                }}
                className={props.classes.lpInput}
                // labelWidth={100}
                style={{ width: 100 }}
                size="small"
                notched={false}
                value={props.userSelectedLanguage}
                inputProps={{
                  id: props.id,
                  style: {
                    height: 30,
                    width: 100,
                    padding: "0px 15px",
                    borderColor: "white",
                    borderRadius: 4,
                    "&:before": {
                      borderColor: "white"
                    },
                    "&:after": {
                      borderColor: "white"
                    }
                  },
                  classes: {
                    icon: props.classes.icon
                  }
                }}
              />
            }
            className={props.classes.languagePickerSelect}
            // value={props.input.value}
            // onChange={props.input.onChange}
            data-testid="component-select"
          >
            {props.options.map(item => (
              <option key={shortid()} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </FormControl>
      )}
    </Translate>
  );
});

// custom MUI friendly SELECT input with translated label
export const renderSelect = ({
  input,
  name,
  id,
  label,
  classes,
  align,
  meta: { error, touched },
  // labelWidth,
  style,
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
            // <OutlinedInput labelWidth={labelWidth} inputProps={{ id: id }} />
            <OutlinedInput inputProps={{ id: id, style: { ...style } }} />
          }
          className={align === "right" ? classes.selectRight : classes.select}
          value={input.value ? input.value.toLowerCase() : ""}
          onChange={input.onChange}
          {...custom}
          data-testid="component-select"
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

// custom MUI friendly CHECKBOX input with translated label
export const renderCheckbox = ({
  input,
  label,
  id,
  validate,
  classes,
  meta: { touched, error },
  formControlName,
  localize,
  bold,
  mini,
  ...custom
}) => (
  <Translate>
    {({ translate }) => {
      const classStyle = bold
        ? classes.checkboxLabelBold
        : mini
        ? classes.checkboxLabelMini
        : "";
      return (
        <FormControl
          error={!!(touched && error)}
          className={classes[formControlName] || classes.formControl}
        >
          <FormControlLabel
            label={inputLabelTranslateHelper(id, label, translate)}
            className={classStyle}
            control={
              <Checkbox
                color="primary"
                checked={input.value ? true : false}
                {...custom}
                {...input}
                className={classes.checkbox}
                data-testid="component-checkbox"
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
      );
    }}
  </Translate>
);

// custom MUI friendly RADIO group with translated label
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
          data-testid="component-radio-group"
          aria-label={formControlName}
          name={formControlName}
          className={
            direction === "vert" ? classes.verticalGroup : classes.horizGroup
          }
          onChange={(event, value) => {
            console.log(value);
            console.log(event.target.value);
            input.onChange(value);
            if (additionalOnChange) {
              console.log("additionalOnChange");
              console.log(additionalOnChange);
              additionalOnChange(value);
            }
          }}
          id={id}
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
                    data-testid="component-radio"
                  />
                }
                label={inputLabelTranslateHelper(item, item, translate)}
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
          data-testid="component-cape-radio-group"
          aria-label={formControlName}
          name={formControlName}
          id={formControlName}
          className={classes.horizGroup}
          onChange={input.onChange}
        >
          {options.map(item => {
            let labelText = `$${item}`;
            if (item === "Other") {
              labelText = inputLabelTranslateHelper(item, item, translate);
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
                    data-testid="component-radio"
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

export const blankSig =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCABkAlIDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AKpgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//9k=";

export const submTableFieldList = [
  { title: "Submission Status", field: "submission_status", hidden: false },
  {
    title: "Submission Date",
    field: "submission_date",
    hidden: false,
    render: rowData => formatDateTime(rowData.submission_date),
    defaultSort: "desc"
  },
  { title: "Submission Errors", field: "submission_errors", hidden: false },
  { title: "First Name", field: "first_name", hidden: false },
  { title: "Last Name", field: "last_name", hidden: false },
  { title: "Home Email", field: "home_email", hidden: false },
  { title: "Employer", field: "employer_name", hidden: false },
  {
    title: "Online Campaign Source",
    field: "online_campaign_source",
    hidden: false
  },
  { title: "Contact ID", field: "salesforce_id", hidden: false },
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

export const renderImage = rowData => {
  if (rowData.content_type === "image") {
    const filename = rowData.content.split(".s3-us-west-2.amazonaws.com/")[1];
    return <img src={rowData.content} height="100" alt={filename} />;
  } else {
    return "";
  }
};

export const renderText = rowData => {
  if (rowData.content_type === "image") {
    return rowData.content.split(".s3-us-west-2.amazonaws.com/")[1];
  } else {
    return rowData.content;
  }
};

export const renderDate = rowData => formatDateTime(rowData.updated_at);

export const contentTableFieldList = [
  { title: "Id", field: "id", hidden: false },
  { title: "Content Type", field: "content_type", hidden: false },
  {
    title: "Image",
    field: "content",
    hidden: false,
    render: renderImage
  },
  {
    title: "Text",
    field: "content",
    hidden: false,
    render: renderText
  },
  {
    title: "Updated At",
    field: "updated_at",
    hidden: false,
    defaultSort: "desc",
    render: renderDate
  }
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
  helperText: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool,
    PropTypes.element
  ])
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
  style: PropTypes.object,
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
