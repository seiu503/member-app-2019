import React from "react";
import PropTypes from "prop-types";
import { reduxForm, Field } from "redux-form";
import { withLocalize, Translate } from "react-localize-redux";
import queryString from "query-string";
import moment from "moment";

import FormLabel from "@material-ui/core/FormLabel";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormGroup from "@material-ui/core/FormGroup";
import CheckCircleOutline from "@material-ui/icons/CheckCircleOutline";
import Divider from "@material-ui/core/Divider";
import withWidth, { isWidthUp } from "@material-ui/core/withWidth";

import * as formElements from "./SubmissionFormElements";
import ButtonWithSpinner from "./ButtonWithSpinner";
import { validate } from "../utils/validators";
import { openSnackbar } from "../containers/Notifier";

const stateList = formElements.stateList;
const genderOptions = formElements.genderOptions;
const genderPronounOptions = formElements.genderPronounOptions;

export class SubmissionFormPage2Component extends React.Component {
  classes = this.props.classes;
  constructor(props) {
    super(props);
    this.state = {};
  }

  // reusable MUI form components
  renderTextField = formElements.renderTextField;
  renderSelect = formElements.renderSelect;
  renderCheckbox = formElements.renderCheckbox;

  handleSubmit = async values => {
    const {
      mailToCity,
      mailToState,
      mailToStreet,
      mailToZip,
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
      workPhone,
      hireDate,
      firstName,
      lastName,
      homeEmail
    } = values;
    const ethnicity = formElements.calcEthnicity(values);
    const body = {
      mail_to_city: mailToCity,
      mail_to_state: mailToState,
      mail_to_street: mailToStreet,
      mail_to_postal_code: mailToZip,
      ethnicity,
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
      work_email: workEmail,
      work_phone: workPhone
    };
    const cleanBody = formElements.removeFalsy(body);
    let salesforceId = this.props.submission.salesforceId;
    if (!salesforceId) {
      const params = queryString.parse(this.props.location.search);
      if (params.id) {
        salesforceId = params.id;
      }
    }
    cleanBody.salesforce_id = salesforceId;
    if (cleanBody.hire_date) {
      let hireDate = moment(new Date(cleanBody.hire_date));
      if (hireDate.isValid()) {
        cleanBody.hire_date = formElements.formatSFDate(hireDate);
        // console.log(`cleanBody.hire_date: ${cleanBody.hire_date}`);
      }
    }

    let id = this.props.submission.submissionId;

    if (!id) {
      cleanBody.first_name = firstName;
      cleanBody.last_name = lastName;
      cleanBody.home_email = homeEmail;

      // console.log("CLEANBODY", cleanBody);

      await this.props
        .createSubmission(cleanBody, true) // partial submission = true
        .catch(err => {
          console.error(err);
          return formElements.handleError(err);
        });
    } else {
      await this.props.updateSubmission(id, cleanBody).catch(err => {
        console.error(err);
        return formElements.handleError(err);
      });
    }

    this.props
      .updateSFContact(salesforceId, cleanBody)
      .then(() => {
        openSnackbar("success", this.props.translate("snackBarSuccess"));
        this.props.history.push(`/thankyou`);
      })
      .catch(err => {
        console.error(err);
        return formElements.handleError(err);
      });
  };

  render() {
    const id = this.props.submission.submissionId;
    return (
      <div
        className={this.classes.formContainer}
        data-test="component-submissionformpage2"
      >
        <form
          id="submissionFormPage2"
          onSubmit={this.props.handleSubmit(this.handleSubmit.bind(this))}
          className={this.classes.form}
        >
          <div className={this.classes.successWrap}>
            <div className={this.classes.checkIcon}>
              <CheckCircleOutline
                style={{ color: "#66BB6A", height: 100, width: 100 }}
              />
            </div>
            <FormHelperText
              className={this.classes.page2IntroText}
              id="page2IntroText"
            >
              <Translate id="introParagraph" />
            </FormHelperText>
          </div>
          <Divider style={{ margin: 20 }} />
          {!id && (
            <React.Fragment>
              <FormGroup
                className={this.classes.formGroup}
                row
                classes={{ root: this.classes.formGroup2Col }}
              >
                <Field
                  twocol
                  mobile={!isWidthUp("sm", this.props.width)}
                  label="First Name"
                  name="firstName"
                  id="firstName"
                  type="text"
                  classes={{ input2col: this.classes.input2col }}
                  component={this.renderTextField}
                />

                <Field
                  twocol
                  mobile={!isWidthUp("sm", this.props.width)}
                  name="lastName"
                  id="lastName"
                  label="Last Name"
                  classes={{ input2col: this.classes.input2col }}
                  component={this.renderTextField}
                  type="text"
                />
              </FormGroup>
              <Field
                label="Home Email"
                name="homeEmail"
                id="homeEmail"
                type="email"
                classes={this.classes}
                component={this.renderTextField}
              />
            </React.Fragment>
          )}
          <FormLabel className={this.classes.formLabel} component="legend">
            <Translate id="raceEthnicityHelperText" />
          </FormLabel>
          <FormGroup className={this.classes.formGroup}>
            <Field
              label="African or African-American"
              name="africanOrAfricanAmerican"
              id="africanOrAfricanAmerican"
              classes={this.classes}
              component={this.renderCheckbox}
              localize={this.props.localize}
            />
            <Field
              label="Arab American, Middle Eastern, or North African"
              name="arabAmericanMiddleEasternOrNorthAfrican"
              id="arabAmericanMiddleEasternOrNorthAfrican"
              classes={this.classes}
              component={this.renderCheckbox}
              localize={this.props.localize}
            />
            <Field
              label="Asian or Asian American"
              name="asianOrAsianAmerican"
              id="asianOrAsianAmerican"
              classes={this.classes}
              component={this.renderCheckbox}
              localize={this.props.localize}
            />
            <Field
              label="Hispanic or Latinx"
              name="hispanicOrLatinx"
              id="hispanicOrLatinx"
              classes={this.classes}
              component={this.renderCheckbox}
              localize={this.props.localize}
            />
            <Field
              label="Native American or Indigenous"
              name="nativeAmericanOrIndigenous"
              id="nativeAmericanOrIndigenous"
              classes={this.classes}
              component={this.renderCheckbox}
              localize={this.props.localize}
            />
            <Field
              label="Native Hawaiian or Other Pacific Islander"
              name="nativeHawaiianOrOtherPacificIslander"
              id="nativeHawaiianOrOtherPacificIslander"
              classes={this.classes}
              component={this.renderCheckbox}
              localize={this.props.localize}
            />
            <Field
              label="White"
              name="white"
              id="white"
              classes={this.classes}
              component={this.renderCheckbox}
              localize={this.props.localize}
            />
            <Field
              label="Other"
              name="other"
              id="other"
              classes={this.classes}
              component={this.renderCheckbox}
              localize={this.props.localize}
            />
            <Field
              label="Declined"
              name="declined"
              id="declined"
              classes={this.classes}
              component={this.renderCheckbox}
              localize={this.props.localize}
            />
          </FormGroup>

          <FormLabel className={this.classes.formLabel} component="legend">
            <Translate id="otherSocialIdentities" />
          </FormLabel>
          <FormGroup className={this.classes.formGroup}>
            <Field
              label="I identify as LGBTQIA+"
              name="lgbtqId"
              id="lgbtqId"
              type="checkbox"
              classes={this.classes}
              component={this.renderCheckbox}
              localize={this.props.localize}
            />
            <Field
              label="I identify as transgender"
              name="transId"
              id="transId"
              type="checkbox"
              classes={this.classes}
              component={this.renderCheckbox}
              localize={this.props.localize}
            />
            <Field
              label="I identify as disabled or a person with a disability"
              name="disabilityId"
              id="disabilityId"
              type="checkbox"
              classes={this.classes}
              component={this.renderCheckbox}
              localize={this.props.localize}
            />
            <Field
              label="I identify as Deaf or hard-of-hearing"
              name="deafOrHardOfHearing"
              id="deafOrHardOfHearing"
              type="checkbox"
              classes={this.classes}
              component={this.renderCheckbox}
              localize={this.props.localize}
            />
            <Field
              label="I identify as Blind or visually impaired"
              name="blindOrVisuallyImpaired"
              id="blindOrVisuallyImpaired"
              type="checkbox"
              classes={this.classes}
              component={this.renderCheckbox}
              localize={this.props.localize}
            />
            <Field
              label="Gender"
              name="gender"
              id="gender"
              type="select"
              classes={this.classes}
              component={this.renderSelect}
              labelWidth={50}
              options={genderOptions}
            />
            {this.props.formValues.gender === "other" && (
              <Field
                label="If other, Please describe"
                name="genderOtherDescription"
                id="genderOtherDescription"
                type="text"
                classes={this.classes}
                component={this.renderTextField}
              />
            )}
            <Field
              label="Your pronouns"
              name="genderPronoun"
              id="genderPronoun"
              type="select"
              classes={this.classes}
              component={this.renderSelect}
              labelWidth={97}
              options={genderPronounOptions}
            />
          </FormGroup>

          <FormLabel className={this.classes.formLabel} component="legend">
            <Translate id="employmentInfo" />
          </FormLabel>
          <FormGroup className={this.classes.formGroup}>
            <Field
              label="Job Class/Title"
              name="jobTitle"
              id="jobTitle"
              type="text"
              classes={this.classes}
              component={this.renderTextField}
            />
            <Field
              label="Hire Date"
              name="hireDate"
              id="hireDate"
              type="text"
              classes={this.classes}
              component={this.renderTextField}
            />
            <Field
              label="Worksite"
              name="worksite"
              id="worksite"
              type="text"
              classes={this.classes}
              component={this.renderTextField}
            />
            <Field
              label="Work Email"
              name="workEmail"
              id="workEmail"
              type="email"
              classes={this.classes}
              component={this.renderTextField}
            />
            <Field
              label="Work Phone"
              name="workPhone"
              id="workPhone"
              type="tel"
              classes={this.classes}
              component={this.renderTextField}
            />
          </FormGroup>

          <FormLabel className={this.classes.formLabel} component="legend">
            <Translate id="mailToAddress" />
          </FormLabel>
          <FormHelperText
            className={this.classes.formHelperText}
            id="mailingAddressDescription"
          >
            <Translate id="fieldHintAddress" />
          </FormHelperText>
          <FormGroup className={this.classes.formGroup}>
            <Field
              label="Mailing Street"
              name="mailToStreet"
              id="mailToStreet"
              type="text"
              classes={this.classes}
              component={this.renderTextField}
            />
            <Field
              label="Mailing City"
              name="mailToCity"
              id="mailToCity"
              type="text"
              classes={this.classes}
              component={this.renderTextField}
            />
            <Field
              label="Mailing State"
              name="mailToState"
              id="mailToState"
              type="select"
              classes={this.classes}
              formControlName="formControlDate"
              component={this.renderSelect}
              labelWidth={88}
              options={stateList}
            />
            <Field
              label="Mailing ZIP"
              name="mailToZip"
              id="mailToZip"
              type="text"
              classes={this.classes}
              component={this.renderTextField}
            />
          </FormGroup>

          <ButtonWithSpinner
            type="submit"
            color="primary"
            className={this.classes.formButton}
            variant="contained"
            loading={this.props.submission.loading}
          >
            <Translate id="submit" />
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
    loading: PropTypes.bool,
    error: PropTypes.string,
    salesforceId: PropTypes.string
  }).isRequired,
  apiSF: PropTypes.shape({
    updateSFContact: PropTypes.func
  }).isRequired,
  classes: PropTypes.object
};

// add reduxForm to component
export const SubmissionFormPage2Wrap = reduxForm({
  form: "submissionPage2",
  validate,
  enableReinitialize: true
})(SubmissionFormPage2Component);

export default withLocalize(withWidth()(SubmissionFormPage2Wrap));
