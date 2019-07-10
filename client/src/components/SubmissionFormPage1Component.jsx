import React from "react";
import { Field } from "redux-form";
import localIpUrl from "local-ip-url";
import PropTypes from "prop-types";

import FormLabel from "@material-ui/core/FormLabel";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormGroup from "@material-ui/core/FormGroup";

import * as formElements from "./SubmissionFormElements";
import * as utils from "../utils/index";
import { openSnackbar } from "../containers/Notifier";
import ButtonWithSpinner from "./ButtonWithSpinner";
import WelcomeInfo from "./WelcomeInfo";

// helper functions these MAY NEED TO BE UPDATED with localization package
const stateList = formElements.stateList;
const monthList = formElements.monthList;
const languageOptions = formElements.languageOptions;
const dateOptions = formElements.dateOptions;
const yearOptions = formElements.yearOptions;

class SubmissionFormPage1Component extends React.Component {
  classes = this.props.classes;
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    if (this.props.match.params.id) {
      const { id } = this.props.match.params;
      try {
        this.getPrefillData(id);
      } catch (err) {
        console.log(err);
        openSnackbar("error", err);
      }
    }
  }

  getPrefillData(id) {
    this.props.apiSF
      .getSFContactById(id)
      .then(contact => {
        console.log(contact);
        openSnackbar("success", "Contact data fetched.");
      })
      .catch(err => {
        console.log(err);
        openSnackbar("error", err);
      });
  }

  // reusable MUI form components
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
      textAuthOptOut,
      termsAgree,
      signature,
      salesforceId
    } = values;
    const birthdate = mm + "/" + dd + "/" + yyyy;

    const body = {
      ip_address: localIpUrl(),
      submission_date: new Date(),
      agency_number: utils.randomInt(),
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
      online_campaign_source: "HARD CODED",
      legal_language: this.legal_language.textContent.toString(),
      maintenance_of_effort: new Date(),
      seiu503_cba_app_date: new Date(),
      direct_pay_auth: null,
      direct_deposit_auth: null,
      immediate_past_member_status: null,
      salesforce_id: salesforceId
    };
    console.log(body);

    return this.props.apiSubmission
      .addSubmission(body)
      .then(result => {
        if (
          result.type === "ADD_SUBMISSION_FAILURE" ||
          this.props.submission.error
        ) {
          openSnackbar(
            "error",
            this.props.submission.error ||
              "An error occurred while trying to submit your information."
          );
        } else {
          openSnackbar("success", "Your Submission was Successful!");
          this.props.reset("submissionPage1");
          this.props.apiSubmission.saveSalesforceId(salesforceId);
          this.props.history.push(`/page2`);
        }
      })
      .catch(err => {
        console.log(err);
        openSnackbar("error", err);
      });
  };
  render() {
    return (
      <div
        className={this.classes.root}
        data-test="component-submissionformpage1"
      >
        <WelcomeInfo />
        <form
          id="submissionFormPage1"
          onSubmit={this.props.handleSubmit(this.handleSubmit.bind(this))}
          className={this.classes.form}
        >
          <Field
            label="Employer Name"
            name="employerName"
            id="employerName"
            type="text"
            classes={this.classes}
            component={this.renderTextField}
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
          <FormGroup className={this.classes.formGroup}>
            <Field
              label="Month"
              name="mm"
              id="mm"
              type="select"
              classes={this.classes}
              formControlName="formControlDate"
              component={this.renderSelect}
              labelWidth={41}
              options={monthList}
            />

            <Field
              label="Day"
              name="dd"
              id="dd"
              type="select"
              formControlName="formControlDate"
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
              formControlName="formControlDate"
              classes={this.classes}
              component={this.renderSelect}
              labelWidth={30}
              options={yearOptions()}
            />
          </FormGroup>

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

          <FormHelperText className={this.classes.formHelperText}>
            Please enter your physical street address here, not a P.O. box.
            There is a space for a mailing address on the next page, if
            different from your physical address.
          </FormHelperText>

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

          <FormHelperText className={this.classes.formHelperText}>
            Please use your personal email if you have one, since some employers
            limit union communication via work email. If you don't have a
            personal email, work email is fine. If you don't have an email
            address, call us at 1.844.503.7348 to sign up over the phone.
          </FormHelperText>

          <Field
            label="Mobile Phone†"
            name="mobilePhone"
            id="mobilePhone"
            type="tel"
            classes={this.classes}
            component={this.renderTextField}
          />

          <FormHelperText className={this.classes.formHelperText}>
            † By providing my phone number, I understand that the Service
            Employees International Union (SEIU), its local unions, and
            affiliates may use automated calling technologies and/or text
            message me on my cellular phone on a periodic basis. SEIU will never
            charge for text message alerts. Carrier message and data rates may
            apply to such alerts. Reply STOP to stop receiving messages; reply
            HELP for more information.
          </FormHelperText>

          <Field
            label="Opt Out Of Receiving Mobile Alerts"
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
          <FormHelperText
            className={this.classes.formHelperText}
            id="termsOfServiceLegalLanguage"
            ref={el => (this.legal_language = el)}
          >
            Your full name, the network address you are accessing this page
            from, and the timestamp of submission will serve as signature
            indicating: I hereby designate SEIU Local 503, OPEU (or any
            successor Union entity) as my desired collective bargaining agent. I
            also hereby authorize my employer to deduct from my wages,
            commencing with the next payroll period, all Union dues and other
            fees or assessments as shall be certified by SEIU Local 503, OPEU
            (or any successor Union entity) and to remit those amounts to such
            Union. This authorization/delegation is unconditional, made in
            consideration for the cost of representation and other actions in my
            behalf by the Union and is made irrespective of my membership in the
            Union. This authorization is irrevocable for a period of one year
            from the date of execution and from year to year thereafter unless
            not less than thirty (30) and not more than forty-five (45) days
            prior to the end of any annual period or the termination of the
            contract between my employer and the Union, whichever occurs first,
            I notify the Union and my employer in writing, with my valid
            signature, of my desire to revoke this authorization.
          </FormHelperText>

          <Field
            label="Signature"
            name="signature"
            id="signature"
            type="text"
            classes={this.classes}
            component={this.renderTextField}
          />
          <FormHelperText className={this.classes.formHelperText}>
            Enter your full legal name. This will act as your signature.
          </FormHelperText>

          <ButtonWithSpinner
            type="submit"
            color="secondary"
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

SubmissionFormPage1Component.propTypes = {
  type: PropTypes.string,
  appState: PropTypes.shape({
    authToken: PropTypes.string
  }),
  submission: PropTypes.shape({
    loading: PropTypes.bool,
    error: PropTypes.string,
    salesforceId: PropTypes.string
  }).isRequired,
  classes: PropTypes.object
};

export default SubmissionFormPage1Component;
