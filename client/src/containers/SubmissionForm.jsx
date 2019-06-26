import React from "react";
import { Field, reduxForm } from "redux-form";
import localIpUrl from "local-ip-url";
import uuid from "uuid";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getFormValues } from "redux-form";

import { withStyles } from "@material-ui/core/styles";

import FormLabel from "@material-ui/core/FormLabel";
import FormHelperText from "@material-ui/core/FormHelperText";

import * as apiSubmissionActions from "../store/actions/apiSubmissionActions";
import * as formElements from "../components/SubmissionFormElements";
import { openSnackbar } from "./Notifier";
import ButtonWithSpinner from "../components/ButtonWithSpinner";
import validate from "../utils/validators";

const styles = theme => ({
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
  formButton: {
    width: "100%",
    padding: 20
  },
  formControl: {
    width: "100%"
  },
  formControlLabel: {
    width: "100%"
  },
  formLabel: {
    margin: "10px 0"
  }
});
const stateList = formElements.stateList;
const monthList = formElements.monthList;
const languageOptions = formElements.languageOptions;
const dateOptions = formElements.dateOptions;
const yearOptions = formElements.yearOptions;

export class SubmissionFormUnconnected extends React.Component {
  classes = this.props.classes;
  constructor(props) {
    super(props);
    this.state = {};
  }

  renderTextField = formElements.renderTextField;
  renderSelect = formElements.renderSelect;
  renderCheckbox = formElements.renderCheckbox;

  handleSubmit = values => {
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

    return this.props.apiSubmission
      .addSubmission(body)
      .then(result => {
        if (
          result.type === "ADD_CONTENT_FAILURE" ||
          this.props.submission.error
        ) {
          openSnackbar(
            "error",
            this.props.submission.error ||
              "An error occurred while trying to submit your information."
          );
        } else {
          openSnackbar("success", "Your Submission was Successful!");
          this.props.apiSubmission.clearForm();
        }
      })
      .catch(err => openSnackbar("error", err));
  };
  render() {
    return (
      <div className={this.classes.root} data-test="component-submissionform">
        <form
          id="submissionForm"
          onSubmit={this.props.handleSubmit(this.handleSubmit.bind(this))}
          className={this.classes.form}
        >
          <Field
            label="Preferred Language"
            name="preferredLanguage"
            id="preferredLanguage"
            type="select"
            classes={this.classes}
            component={this.renderSelect}
            labelWidth={132}
            options={languageOptions}
          />

          <Field
            label="First Name"
            name="firstName"
            id="firstName"
            type="text"
            classes={this.classes}
            component={this.renderTextField}
          />

          <Field
            name="lastName"
            id="lastName"
            label="Last Name"
            classes={this.classes}
            component={this.renderTextField}
            type="text"
          />

          <FormLabel className={this.classes.formLabel} component="legend">
            Birthdate
          </FormLabel>

          <Field
            label="Month"
            name="mm"
            id="mm"
            type="select"
            classes={this.classes}
            component={this.renderSelect}
            labelWidth={41}
            options={monthList}
          />

          <Field
            label="Day"
            name="dd"
            id="dd"
            type="select"
            classes={this.classes}
            component={this.renderSelect}
            labelWidth={24}
            options={dateOptions(this.props)}
          />

          <Field
            label="Year"
            name="yyyy"
            id="yyyy"
            type="select"
            classes={this.classes}
            component={this.renderSelect}
            labelWidth={30}
            options={yearOptions()}
          />

          <FormLabel className={this.classes.formLabel} component="legend">
            Address
          </FormLabel>

          <Field
            label="Home Street"
            name="homeStreet"
            id="homeStreet"
            type="text"
            classes={this.classes}
            component={this.renderTextField}
          />

          <Field
            label="Home City"
            name="homeCity"
            id="homeCity"
            type="text"
            classes={this.classes}
            component={this.renderTextField}
          />

          <Field
            label="Home State"
            name="homeState"
            id="homeState"
            type="select"
            classes={this.classes}
            component={this.renderSelect}
            options={stateList}
            labelWidth={80}
          />

          <Field
            label="Home Postal Code"
            name="homePostalCode"
            id="homePostalCode"
            type="text"
            classes={this.classes}
            component={this.renderTextField}
          />

          <Field
            label="Home Email"
            name="homeEmail"
            id="homeEmail"
            type="email"
            classes={this.classes}
            component={this.renderTextField}
          />

          <Field
            label="Mobile Phone"
            name="mobilePhone"
            id="mobilePhone"
            type="tel"
            classes={this.classes}
            component={this.renderTextField}
          />

          <Field
            label="Employer Name"
            name="employerName"
            id="employerName"
            type="text"
            classes={this.classes}
            component={this.renderTextField}
          />

          <Field
            label="Agency Number"
            name="agencyNumber"
            id="agencyNumber"
            type="text"
            classes={this.classes}
            component={this.renderTextField}
          />

          <Field
            label="Text Opt Out"
            name="textAuthOptOut"
            id="textAuthOptOut"
            type="checkbox"
            classes={this.classes}
            component={this.renderCheckbox}
          />

          <Field
            label="Agree to Terms of Service"
            name="termsAgree"
            id="termsAgree"
            type="checkbox"
            classes={this.classes}
            component={this.renderCheckbox}
          />

          <Field
            label="Signature"
            name="signature"
            id="signature"
            type="text"
            classes={this.classes}
            component={this.renderTextField}
          />

          <Field
            label="Online Campaign Source"
            name="onlineCampaignSource"
            id="onlineCampaignSource"
            type="text"
            classes={this.classes}
            component={this.renderTextField}
          />

          <ButtonWithSpinner
            type="submit"
            color="secondary"
            classes={this.classes}
            className={this.classes.formButton}
            variant="contained"
            loading={this.props.submission.loading}
          >
            Submit
          </ButtonWithSpinner>
        </form>
      </div>
    );
  }
}

SubmissionFormUnconnected.propTypes = {
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
      onlineCampaignSource: PropTypes.string
    }),
    loading: PropTypes.bool
  }).isRequired,
  classes: PropTypes.object
};

export const SubmissionFormReduxForm = reduxForm({
  form: "submission",
  validate,
  enableReinitialize: true
})(SubmissionFormUnconnected);

const mapStateToProps = state => ({
  submission: state.submission,
  appState: state.appState,
  initialValues: {
    mm: monthList[0],
    onlineCampaignSource: null
  },
  formValues: getFormValues("submission")(state) || {}
});

const mapDispatchToProps = dispatch => ({
  apiSubmission: bindActionCreators(apiSubmissionActions, dispatch)
});

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(SubmissionFormReduxForm)
);
