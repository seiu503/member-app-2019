import React from "react";
import { Field } from "redux-form";
import uuid from "uuid";
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
const ethnicityOptions = formElements.ethnicityOptions;
const genderOptions = formElements.genderOptions;
const genderPronounOptions = formElements.genderPronounOptions;
const monthList = formElements.monthList;
const dateOptions = formElements.dateOptions;
const yearOptions = formElements.yearOptions;

class SubmissionFormPage2Component extends React.Component {
  classes = this.props.classes;
  constructor(props) {
    super(props);
    this.state = {};
  }

  // reusable MUI form components
  renderTextField = formElements.renderTextField;
  renderSelect = formElements.renderSelect;
  renderCheckbox = formElements.renderCheckbox;

  handleSubmit = values => {
    const {
      mailToCity,
      mailToState,
      mailToStreet,
      mailToPostalCode,
      ethnicity,
      lgbtqId,
      transId,
      disabilityId,
      deafOrHardOfHearing,
      blindOrVisuallyImpaired,
      gender,
      genderOtherDescription,
      genderPronoun,
      jobTitle,
      worksite,
      workEmail,
      hiremm,
      hiredd,
      hireyyyy
    } = values;
    const hireDate = hiremm + "/" + hiredd + "/" + hireyyyy;

    const body = {
      mail_to_city: mailToCity,
      mail_to_state: mailToState,
      mail_to_street: mailToStreet,
      mail_to_postal_code: mailToPostalCode,
      ethnicity: ethnicity,
      lgbtq_id: lgbtqId,
      trans_id: transId,
      disability_id: disabilityId,
      deaf_or_hard_of_hearing: deafOrHardOfHearing,
      blind_or_visually_impaired: blindOrVisuallyImpaired,
      gender: gender,
      gender_other_description: genderOtherDescription,
      gender_pronoun: genderPronoun,
      job_title: jobTitle,
      hire_date: hireDate,
      worksite: worksite,
      work_email: workEmail
    };

    return this.props.apiSubmission
      .updateSubmission(body)
      .then(result => {
        if (
          result.type === "UPDATE_SUBMISSION_FAILURE" ||
          this.props.submission.error
        ) {
          openSnackbar(
            "error",
            this.props.submission.error ||
              "An error occurred while trying to update your information."
          );
        } else {
          openSnackbar("success", "Your information was updated!");
          this.props.apiSubmission.clearForm();
          this.props.reset("submission");
        }
      })
      .catch(err => openSnackbar("error", err));
  };
  render() {
    return (
      <div
        className={this.classes.root}
        data-test="component-submissionformpage2"
      >
        <WelcomeInfo />
        <form
          id="submissionFormPage2"
          onSubmit={this.props.handleSubmit(this.handleSubmit.bind(this))}
          className={this.classes.form}
        >
          <Field
            label="mailToStreet"
            name="mailToStreet"
            id="mailToStreet"
            type="text"
            classes={this.classes}
            component={this.renderTextField}
          />
          <Field
            label="mailToCity"
            name="mailToCity"
            id="mailToCity"
            type="text"
            classes={this.classes}
            component={this.renderTextField}
          />

          <Field
            label="mailToState"
            name="mailToState"
            id="mailToState"
            type="select"
            classes={this.classes}
            formControlName="formControlDate"
            component={this.renderSelect}
            labelWidth={41}
            options={stateList}
          />

          <Field
            label="mailToPostalCode"
            name="mailToPostalCode"
            id="mailToPostalCode"
            type="text"
            classes={this.classes}
            component={this.renderTextField}
          />

          <Field
            label="ethnicity"
            name="ethnicity"
            id="ethnicity"
            type="select"
            classes={this.classes}
            component={this.renderSelect}
            labelWidth={41}
            options={ethnicityOptions}
          />

          <Field
            label="lgbtqId"
            name="lgbtqId"
            id="lgbtqId"
            type="checkbox"
            classes={this.classes}
            component={this.renderCheckbox}
          />

          <Field
            label="transId"
            name="transId"
            id="transId"
            type="checkbox"
            classes={this.classes}
            component={this.renderCheckbox}
          />

          <Field
            label="disabilityId"
            name="disabilityId"
            id="disabilityId"
            type="checkbox"
            classes={this.classes}
            component={this.renderCheckbox}
          />

          <Field
            label="deafOrHardOfHearing"
            name="deafOrHardOfHearing"
            id="deafOrHardOfHearing"
            type="checkbox"
            classes={this.classes}
            component={this.renderCheckbox}
          />

          <Field
            label="blindOrVisuallyImpaired"
            name="blindOrVisuallyImpaired"
            id="blindOrVisuallyImpaired"
            type="checkbox"
            classes={this.classes}
            component={this.renderCheckbox}
          />

          <Field
            label="gender"
            name="gender"
            id="gender"
            type="select"
            classes={this.classes}
            component={this.renderSelect}
            labelWidth={41}
            options={genderOptions}
          />

          <Field
            label="genderOtherDescription"
            name="genderOtherDescription"
            id="genderOtherDescription"
            type="text"
            classes={this.classes}
            component={this.renderTextField}
          />

          <Field
            label="genderPronoun"
            name="genderPronoun"
            id="genderPronoun"
            type="select"
            classes={this.classes}
            component={this.renderSelect}
            labelWidth={41}
            options={genderPronounOptions}
          />

          <Field
            label="worksite"
            name="worksite"
            id="worksite"
            type="text"
            classes={this.classes}
            component={this.renderTextField}
          />

          <FormLabel className={this.classes.formLabel} component="legend">
            Hire Date
          </FormLabel>
          <FormGroup className={this.classes.formGroup}>
            <Field
              label="Month"
              name="hirehire"
              id="hiremm"
              type="select"
              classes={this.classes}
              formControlName="formControlDate"
              component={this.renderSelect}
              labelWidth={41}
              options={monthList}
            />

            <Field
              label="Day"
              name="hiredd"
              id="hiredd"
              type="select"
              formControlName="formControlDate"
              classes={this.classes}
              component={this.renderSelect}
              labelWidth={24}
              options={dateOptions(this.props)}
            />

            <Field
              label="Year"
              name="hireyyyy"
              id="hireyyyy"
              type="select"
              formControlName="formControlDate"
              classes={this.classes}
              component={this.renderSelect}
              labelWidth={30}
              options={yearOptions()}
            />
          </FormGroup>

          <Field
            label="worksite"
            name="worksite"
            id="worksite"
            type="text"
            classes={this.classes}
            component={this.renderTextField}
          />

          <Field
            label="workEmail"
            name="workEmail"
            id="workEmail"
            type="text"
            classes={this.classes}
            component={this.renderTextField}
          />

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

SubmissionFormPage2Component.propTypes = {
  type: PropTypes.string,
  appState: PropTypes.shape({
    authToken: PropTypes.string
  }),
  submission: PropTypes.shape({
    form: PropTypes.shape({
      mailToStreet: PropTypes.string,
      mailToCity: PropTypes.string,
      mailToState: PropTypes.string,
      mailToPostalCode: PropTypes.string,
      ethnicity: PropTypes.string,
      lgbtqId: PropTypes.bool,
      transId: PropTypes.bool,
      disabilityId: PropTypes.bool,
      deafOrHardOfHearing: PropTypes.bool,
      blindOrVisuallyImpaired: PropTypes.bool,
      gender: PropTypes.string,
      genderOtherDescription: PropTypes.string,
      genderPronoun: PropTypes.string,
      jobTitle: PropTypes.string,
      hireDate: PropTypes.string,
      worksite: PropTypes.string,
      workEmail: PropTypes.string
    }),
    loading: PropTypes.bool,
    error: PropTypes.string
  }).isRequired,
  classes: PropTypes.object
};

export default SubmissionFormPage2Component;
