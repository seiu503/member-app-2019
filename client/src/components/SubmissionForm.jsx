import React from "react";
import { Field, reduxForm, Form } from "redux-form";
import { connect } from "react-redux";
import localIpUrl from "local-ip-url";
import uuid from "uuid";

import { withStyles } from "@material-ui/core/styles";
import MenuItem from "@material-ui/core/MenuItem";

// import * as apiSubmissionActions from "../store/actions/apiSubmissionActions";
import { openSnackbar } from "../containers/Notifier";
import ButtonWithSpinner from "./ButtonWithSpinner";
import * as formElements from "../utils/formElements";
import * as validate from "../utils/validators";

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

class SubmissionForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  getMaxDay = month => {
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

  dateMenuItems = mm => {
    const max = this.getMaxDay(mm);
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

  yearMenuItems = () => {
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

  onSubmit = () => {
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
    } = this.props.form.submission;
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

    return this.props.apiSubmission
      .addSubmission(body)
      .then(result => {
        if (
          result.type === "ADD_CONTENT_FAILURE" ||
          this.props.form.submission.error
        ) {
          openSnackbar(
            "error",
            this.props.form.submission.error ||
              "An error occurred while trying to submit your information."
          );
        } else {
          openSnackbar("success", "Your Submission was Successful!");
          this.props.apiSubmission.clearForm();
          // this.props.history.push("/library");
        }
      })
      .catch(err => openSnackbar("error", err));
  };

  render() {
    const { classes } = this.props;
    return (
      <Form
        className={classes.form}
        id="submissionForm"
        onSubmit={this.onSubmit}
      >
        <label htmlFor="firstName">First Name</label>
        <Field
          name="firstName"
          id="firstName"
          label="firstName"
          type="text"
          component={formElements.renderTextField}
        />

        <label htmlFor="lastName">Last Name</label>
        <Field
          name="lastName"
          id="lastName"
          label="lastName"
          type="text"
          component={formElements.renderTextField}
        />

        <label htmlFor="lastName">Last Name</label>
        <Field
          name="mm"
          id="mm"
          type="select"
          component={formElements.renderSelect}
        >
          <MenuItem value="" />
          <MenuItem value="01">January</MenuItem>
          <MenuItem value="02">February</MenuItem>
          <MenuItem value="03">March</MenuItem>
          <MenuItem value="04">April</MenuItem>
          <MenuItem value="05">May</MenuItem>
          <MenuItem value="06">June</MenuItem>
          <MenuItem value="07">July</MenuItem>
          <MenuItem value="08">August</MenuItem>
          <MenuItem value="09">September</MenuItem>
          <MenuItem value="10">October</MenuItem>
          <MenuItem value="11">November</MenuItem>
          <MenuItem value="12">December</MenuItem>
        </Field>

        <label htmlFor="dd">dd</label>
        <Field
          name="dd"
          id="dd"
          type="select"
          component={formElements.renderSelect}
        >
          {this.dateMenuItems(this.props.form.submission.mm).map(item => (
            <MenuItem key={item} value={item}>
              {item}
            </MenuItem>
          ))}
        </Field>

        <label htmlFor="yyyy">yyyy</label>
        <Field
          name="yyyy"
          id="yyyy"
          type="select"
          component={formElements.renderSelect}
        >
          {this.yearMenuItems().map(item => (
            <MenuItem key={item} value={item}>
              {item}
            </MenuItem>
          ))}
        </Field>

        <label htmlFor="preferredLanguage">preferredLanguage</label>
        <Field
          name="preferredLanguage"
          id="preferredLanguage"
          type="select"
          component={formElements.renderSelect}
        >
          <MenuItem value="" />
          <MenuItem value={"english"}>English</MenuItem>
          <MenuItem value={"russian"}>Russian</MenuItem>
          <MenuItem value={"spanish"}>Spanish</MenuItem>
        </Field>

        <label htmlFor="homeStreet">Home Street</label>
        <Field
          name="homeStreet"
          id="homeStreet"
          type="text"
          component={formElements.renderTextField}
        />

        <label htmlFor="homeCity">Home City</label>
        <Field
          name="homeCity"
          id="homeCity"
          type="text"
          component={formElements.renderTextField}
        />

        <label htmlFor="homeState">Home State</label>
        <Field
          name="homeState"
          id="homeState"
          type="select"
          component={formElements.renderSelect}
        >
          {formElements.stateList.map(item => (
            <MenuItem key={item} value={item}>
              {item}
            </MenuItem>
          ))}
        </Field>
        <label htmlFor="homePostalCode">Home Postal Code</label>
        <Field
          name="homePostalCode"
          id="homePostalCode"
          type="text"
          component={formElements.renderTextField}
        />

        <label htmlFor="homeEmail">Home Email</label>
        <Field name="homeEmail" id="homeEmail" type="email" />

        <label htmlFor="mobilePhone">Mobile Phone</label>
        <Field name="mobilePhone" id="mobilePhone" type="tel" />

        <label htmlFor="employerName">Employer Name</label>
        <Field
          name="employerName"
          id="employerName"
          type="text"
          component={formElements.renderTextField}
        />

        <label htmlFor="agencyNumber">Agency Number</label>
        <Field
          name="agencyNumber"
          id="agencyNumber"
          type="text"
          component={formElements.renderTextField}
        />

        <label htmlFor="textAuthOptOut">Opt Out of Text Alerts</label>
        <Field
          name="textAuthOptOut"
          id="textAuthOptOut"
          type="checkbox"
          component={formElements.renderCheckbox}
        />

        <label htmlFor="termsAgree">Terms Agree</label>
        <Field
          name="termsAgree"
          id="termsAgree"
          type="checkbox"
          component={formElements.renderCheckbox}
        />

        <label htmlFor="signature">Signature</label>
        <Field
          name="signature"
          id="signature"
          type="text"
          component={formElements.renderTextField}
        />

        <label htmlFor="signedApplication">Signed Application</label>
        <Field
          name="signedApplication"
          id="signedApplication"
          type="checkbox"
          component={formElements.renderCheckbox}
        />

        <label htmlFor="onlineCampaignSource">Online Campaign Source</label>
        <Field
          name="onlineCampaignSource"
          id="onlineCampaignSource"
          type="text"
          component={formElements.renderTextField}
        />

        <ButtonWithSpinner type="submit">Submit</ButtonWithSpinner>
      </Form>
    );
  }
}

const mapStateToProps = state => ({
  submission: state.form.submission
});

const mapDispatchToProps = dispatch => ({});

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(
    reduxForm({
      form: "submission"
    })(SubmissionForm)
  )
);
