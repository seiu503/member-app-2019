import React from "react";
import { Field, reduxForm } from "redux-form";
import localIpUrl from "local-ip-url";
import uuid from "uuid";
import PropTypes from "prop-types";

import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Select from "@material-ui/core/Select";
import Checkbox from "@material-ui/core/Checkbox";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";

import * as apiSubmissionActions from "../store/actions/apiSubmissionActions";
import { openSnackbar } from "../containers/Notifier";
import ButtonWithSpinner from "./ButtonWithSpinner";
// import * as validate from "../utils/validators";

const styles = theme => ({
  root: {},
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
  formButton: {
    width: "100%",
    padding: 20
  },
  formControl: {
    width: "100%"
  },
  formControlLabel: {
    width: "100%"
  }
});

let SubmissionForm = props => {
  const { classes } = props;
  const stateList = [
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

  const renderTextField = ({
    input,
    label,
    meta: { touched, error },
    ...custom
  }) => (
    <TextField
      label={label}
      errorText={touched && error}
      variant="outlined"
      {...input}
      {...custom}
      className={classes.input}
    />
  );

  const renderCheckbox = ({ input, label, meta: { error } }) => (
    <FormControlLabel
      control={
        <Checkbox
          color="primary"
          checked={input.value ? true : false}
          onCheck={input.onChange}
          errorText={error}
          className={classes.checkbox}
        />
      }
      label={label}
    />
  );

  const renderSelect = ({ input, label, meta: { error }, labelWidth }) => (
    <FormControl variant="outlined" className={classes.formControl}>
      <InputLabel htmlFor="mm">{label}</InputLabel>
      <Select
        native
        onChange={input.onChange}
        errorText={error}
        className={classes.select}
        input={<OutlinedInput labelWidth={labelWidth} />}
      />
    </FormControl>
  );

  const getMaxDay = month => {
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

  const dateptions = mm => {
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

  const yearoptions = () => {
    let years = [];
    for (
      let i = new Date().getFullYear() - 110;
      i <= new Date().getFullYear();
      i++
    ) {
      years.unshift(i.toString());
    }
    years.unshift("");
    return years;
  };

  const onSubmit = values => {
    const {
      firstName,
      lastName,
      dd,
      mm,
      yyyy,
      preferredLanguage,
      homeStreet,
      homePostalCode,
      homeState,
      homeCity,
      homeEmail,
      mobilePhone,
      employerName,
      agencyNumber,
      textAuthOptOut,
      termsAgree,
      signature,
      onlineCampaignSource
      // signedApplication
    } = values;
    const birthdate = mm + "/" + dd + "/" + yyyy;

    const body = {
      ip_address: localIpUrl(),
      submission_date: new Date(),
      agency_number: agencyNumber,
      birthdate,
      cell_phone: mobilePhone,
      employer_name: employerName,
      first_name: firstName,
      last_name: lastName,
      home_street: homeStreet,
      home_city: homeCity,
      home_state: homeState,
      home_zip: homePostalCode,
      home_email: homeEmail,
      preferred_language: preferredLanguage,
      terms_agree: termsAgree,
      signature: signature,
      text_auth_opt_out: textAuthOptOut,
      online_campaign_source: onlineCampaignSource,
      contact_id: uuid.v4(),
      legal_language: "lorem ipsum",
      maintenance_of_effort: new Date(),
      seiu503_cba_app_date: new Date(),
      direct_pay_auth: null,
      direct_deposit_auth: null,
      immediate_past_member_status: null
    };

    return props.apiSubmission
      .addSubmission(body)
      .then(result => {
        if (result.type === "ADD_CONTENT_FAILURE" || props.submission.error) {
          openSnackbar(
            "error",
            props.submission.error ||
              "An error occurred while trying to submit your information."
          );
        } else {
          openSnackbar("success", "Your Submission was Successful!");
          props.apiSubmission.clearForm();
          // this.props.history.push("/library");
        }
      })
      .catch(err => openSnackbar("error", err));
  };
  const { handleSubmit } = props;
  return (
    <div className={classes.container}>
      <form
        id="submissionForm"
        onSubmit={handleSubmit(values => onSubmit(values))}
        className={classes.form}
      >
        <Field
          name="firstName"
          id="firstName"
          label="firstName"
          type="text"
          component={renderTextField}
        />

        <Field
          name="lastName"
          id="lastName"
          label="lastName"
          type="text"
          component={renderTextField}
        />

        <Field
          label="mm"
          name="mm"
          id="mm"
          type="select"
          component={renderSelect}
          labelWidth={28}
        >
          <option value="" />
          <option value="01">January</option>
          <option value="02">February</option>
          <option value="03">March</option>
          <option value="04">April</option>
          <option value="05">May</option>
          <option value="06">June</option>
          <option value="07">July</option>
          <option value="08">August</option>
          <option value="09">September</option>
          <option value="10">October</option>
          <option value="11">November</option>
          <option value="12">December</option>
        </Field>

        {/*
      <Field
        name="dd"
        id="dd"
        type="select"
        component={renderSelect}
        labelWidth={20}
      >
        {dateoptions(this.props.submission.mm).map(item => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
        </Field>*/}

        <Field
          label="yyyy"
          name="yyyy"
          id="yyyy"
          type="select"
          component={renderSelect}
          labelWidth={30}
        >
          {yearoptions().map(item => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Field>

        <Field
          label="preferredLanguage"
          name="preferredLanguage"
          id="preferredLanguage"
          type="select"
          component={renderSelect}
          labelWidth={130}
        >
          <option value="" />
          <option value={"english"}>English</option>
          <option value={"russian"}>Russian</option>
          <option value={"spanish"}>Spanish</option>
        </Field>

        <Field
          label="homeStreet"
          name="homeStreet"
          id="homeStreet"
          type="text"
          component={renderTextField}
        />

        <Field
          label="homeCity"
          name="homeCity"
          id="homeCity"
          type="text"
          component={renderTextField}
        />

        <Field
          label="homeState"
          name="homeState"
          id="homeState"
          type="select"
          component={renderSelect}
          labelWidth={80}
        >
          {stateList.map(item => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Field>

        <Field
          label="homePostalCode"
          name="homePostalCode"
          id="homePostalCode"
          type="text"
          component={renderTextField}
        />

        <Field
          label="homeEmail"
          name="homeEmail"
          id="homeEmail"
          type="email"
          component={renderTextField}
        />

        <Field
          label="mobilePhone"
          name="mobilePhone"
          id="mobilePhone"
          type="tel"
          component={renderTextField}
        />

        <Field
          label="employerName"
          name="employerName"
          id="employerName"
          type="text"
          component={renderTextField}
        />

        <Field
          label="agencyNumber"
          name="agencyNumber"
          id="agencyNumber"
          type="text"
          component={renderTextField}
        />

        <Field
          label="textAuthOptOut"
          name="textAuthOptOut"
          id="textAuthOptOut"
          type="checkbox"
          component={renderCheckbox}
        />

        <Field
          label="termsAgree"
          name="termsAgree"
          id="termsAgree"
          type="checkbox"
          component={renderCheckbox}
        />

        <Field
          label="signature"
          name="signature"
          id="signature"
          type="text"
          component={renderTextField}
        />

        <Field
          label="signedApplication"
          name="signedApplication"
          id="signedApplication"
          type="checkbox"
          component={renderCheckbox}
        />

        <Field
          label="onlineCampaignSource"
          name="onlineCampaignSource"
          id="onlineCampaignSource"
          type="text"
          component={renderTextField}
        />

        <ButtonWithSpinner
          type="submit"
          color="secondary"
          className={classes.formButton}
          variant="contained"
          // loading={props.submission.loading}
        >
          Submit
        </ButtonWithSpinner>
      </form>
    </div>
  );
};

SubmissionForm.propTypes = {
  type: PropTypes.string,
  appState: PropTypes.shape({
    authToken: PropTypes.string
  }),
  submission: PropTypes.shape({
    form: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      dd: PropTypes.string,
      mm: PropTypes.string,
      yyyy: PropTypes.string,
      preferredLanguage: PropTypes.string,
      homeStreet: PropTypes.string,
      homeCity: PropTypes.string,
      homePostalCode: PropTypes.string,
      homeState: PropTypes.string,
      homeEmail: PropTypes.string,
      mobilePhone: PropTypes.string,
      employerName: PropTypes.string,
      agencyNumber: PropTypes.string,
      textAuthOptOut: PropTypes.bool,
      termsAgree: PropTypes.bool,
      signature: PropTypes.string,
      signedApplication: PropTypes.bool,
      onlineCampaignSource: PropTypes.string
    }),
    loading: PropTypes.bool
  }).isRequired,
  classes: PropTypes.object
};

SubmissionForm = reduxForm({
  form: "submission"
})(SubmissionForm);

export default withStyles(styles)(SubmissionForm);
