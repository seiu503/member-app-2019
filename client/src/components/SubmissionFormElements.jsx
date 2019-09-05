import React from "react";
import shortid from "shortid";
import PropTypes from "prop-types";
import { openSnackbar } from "../containers/Notifier";

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
    fontWeight: 700
  },
  form: {
    maxWidth: 600,
    margin: "auto",
    background: "white",
    padding: "20px 20px 40px 20px",
    borderRadius: "0 0 4px 4px",
    [theme.breakpoints.only("xs")]: {
      padding: "10px 5px 40px 5px"
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
    fontWeight: 400
  },
  paymentCopy: {
    paddingBottom: "1.5em"
  },
  card: {
    display: "flex"
  },
  details: {
    display: "flex",
    flexDirection: "column"
  },
  content: {
    flex: "1 0 auto"
  },
  cover: {
    minWidth: 200
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

// custom MUI friendly TEXT input
export const renderTextField = ({
  input,
  name,
  label,
  meta: { touched, error },
  classes,
  twocol,
  short,
  mobile,
  ...custom
}) => {
  return (
    <TextField
      label={label}
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
    />
  );
};

const selectStyle = align => (align === "right" ? { direction: "ltr" } : {});

// custom MUI friendly SELECT input
export const renderSelect = ({
  input,
  name,
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
  <FormControl
    variant="outlined"
    className={classes[formControlName] || classes.formControl}
    error={!!(error && touched)}
    {...custom}
    required={touched && error === "Required"}
    style={short ? { width: 80 } : mobile ? { width: "100%" } : {}}
  >
    <InputLabel htmlFor={name}>{label}</InputLabel>
    <Select
      native
      input={<OutlinedInput labelWidth={labelWidth} />}
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
  formControlName,
  ...custom
}) => (
  <FormControl
    error={!!(touched && error)}
    className={classes[formControlName] || classes.formControl}
  >
    <FormControlLabel
      label={label}
      control={
        <Checkbox
          color="primary"
          checked={input.value ? true : false}
          {...custom}
          {...input}
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

// custom MUI friendly RADIO group
export const renderRadioGroup = ({
  input,
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
  <FormControl
    component="fieldset"
    error={!!(touched && error)}
    className={classes[formControlName] || classes.formControl}
  >
    <FormLabel component="legend" className={classes.radioLabel}>
      {label}
    </FormLabel>

    <RadioGroup
      aria-label={formControlName}
      name={formControlName}
      className={
        direction === "vert" ? classes.verticalGroup : classes.horizGroup
      }
      onChange={(event, value) => {
        input.onChange(value);
        if (additionalOnChange) {
          additionalOnChange(value);
        }
      }}
    >
      {options.map(item => (
        <FormControlLabel
          key={shortid()}
          value={item}
          className={legendClass}
          control={<Radio checked={item === input.value} />}
          label={item}
        />
      ))}
    </RadioGroup>
    {touched && error && (
      <FormHelperText className={classes.checkboxErrorText}>
        {error}
      </FormHelperText>
    )}
  </FormControl>
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
