import React from "react";
import PropTypes from "prop-types";
import { reduxForm, Field } from "redux-form";
import { withLocalize, Translate } from "react-localize-redux";
import queryString from "query-string";
import moment from "moment";

import {
  FormLabel,
  FormHelperText,
  FormGroup,
  Divider,
  Box
} from "@mui/material";
import { CheckCircleOutline } from "@mui/icons-material";

import useMediaQuery from "@mui/material/useMediaQuery";

import * as formElements from "./SubmissionFormElements";
import ButtonWithSpinner from "./ButtonWithSpinner";
import { validate } from "../utils/validators";
// import { openSnackbar } from "../containers/Notifier";

const stateList = formElements.stateList;
const genderOptions = formElements.genderOptions;
const genderPronounOptions = formElements.genderPronounOptions;

// function wrapper for component allows use of useMediaQuery hook

export function SubmissionFormPage2ComponentFunctionWrapper({ ...rest }) {
  const matches = useMediaQuery("(min-width:450px)");
  return <SubmissionFormPage2Component {...rest} matches={matches} />;
}

export class SubmissionFormPage2Component extends React.Component {
  // classes = this.props.classes;
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
      veteranId,
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
      veteran_id: veteranId,
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
    console.log(body);
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
    console.log(`SUBMISSION ID: ${id}`);

    if (!id) {
      cleanBody.first_name = firstName;
      cleanBody.last_name = lastName;
      cleanBody.home_email = homeEmail;

      console.log("119");

      await this.props
        .createSubmission(cleanBody, true) // partial submission = true
        .catch(err => {
          console.error(err);
          return this.props.handleError(err);
        });
    } else {
      await this.props
        .updateSubmission(id, cleanBody)
        .then(result => {
          // console.log(result.type);
          if (
            result.type === "UPDATE_SUBMISSION_FAILURE" ||
            this.props.submission.error
          ) {
            // console.log(this.props.submission.error);
            this.props.saveSubmissionErrors(
              this.props.submission.submissionId,
              "updateSubmission",
              this.props.submission.error
            );
            console.error(this.props.submission.error);
            return this.props.handleError(this.props.submission.error);
          }
        })
        .catch(err => {
          console.log("131");
          console.error(err);
          return this.props.handleError(err);
        });
    }
    console.log("134");
    this.props.apiSF
      .updateSFContact(salesforceId, cleanBody)
      .then(() => {
        console.log("updated SF contact");
        this.props.openSnackbar(
          "success",
          this.props.translate("snackBarSuccess")
        );
        this.props.history.push(`/thankyou`);
      })
      .catch(err => {
        console.error(err);
        return this.props.handleError(err);
      });
  };

  render() {
    const id = this.props.submission.submissionId;
    const { matches } = this.props;
    const paymentRequired = this.props.submission.formPage1.paymentRequired;
    const formContainer = {
      display: "flex",
      padding: {
        xs: "20px 10px",
        lg: "20px 0 20px 0",
        xl: "80px 0 140px 0"
      },
      margin: {
        xs: "36px auto",
        sm: "44px auto"
        // lg: "44px 0 44px 50%"
      },
      width: {
        xs: "100vw",
        sm: "auto"
      },
      position: {
        xs: "absolute",
        sm: "static"
      },
      left: {
        xs: 0
      },
      top: {
        xs: 0
      },
      background: "white"
    };
    const input2col = {
      width: {
        xs: "100%",
        sm: "48%"
      },
      display: {
        xs: "block",
        sm: "flex" // ????
      }
      // classes.input2col
    };
    return (
      <Box
        sx={{
          margin: "auto",
          padding: "20px",
          maxWidth: "600px",
          background: "white"
        }}
        data-testid="component-submissionformpage2"
      >
        <Box sx={formContainer}>
          <form
            id="submissionFormPage2"
            onSubmit={this.props.handleSubmit(this.handleSubmit.bind(this))}
            data-testid="form-page2"
            // className={this.classes.form}
          >
            <Box
              // className={this.classes.successWrap}
              sx={{
                display: "flex",
                flexWrap: {
                  xs: "wrap",
                  sm: "nowrap"
                }
              }}
            >
              <Box
                // className={this.classes.checkIcon}
                sx={{
                  width: {
                    xs: "100%",
                    sm: "auto"
                  },
                  display: {
                    xs: "flex",
                    sm: "static"
                  },
                  justifyContent: {
                    xs: "center",
                    sm: "left"
                  }
                }}
              >
                <CheckCircleOutline
                  style={{ color: "#66BB6A", height: 100, width: 100 }}
                />
              </Box>
              <FormHelperText
                // className={this.classes.page2IntroText}
                sx={{
                  fontSize: "1.2rem",
                  lineHeight: "1.4em",
                  padding: {
                    xs: "0 0 .5em 0",
                    sm: "0 0 .5em .5em"
                  }
                }}
                id="page2IntroText"
              >
                <Translate
                  id="thankYouNoPayment"
                  data-testid="no-payment-text"
                />
              </FormHelperText>
            </Box>
            <p>
              <Translate id="introParagraph" />
            </p>
            <Divider style={{ margin: 20 }} />
            {!id && (
              <React.Fragment>
                <FormGroup
                  // className={this.classes.formGroup}
                  // sx={{
                  //   display: "flex",
                  //   flexDirection: "column",
                  //   justifyContent: "flex-start",
                  //   margin: "0 0 20px"
                  // }}
                  row
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: {
                      xs: "wrap",
                      sm: "nowrap"
                    },
                    justifyContent: "space-between"
                    // classes.formGroup2Col
                  }}
                >
                  <Field
                    twocol
                    mobile={!matches}
                    label="First Name"
                    name="firstName"
                    id="firstName"
                    type="text"
                    classes={{ input2col }}
                    component={this.renderTextField}
                  />

                  <Field
                    twocol
                    mobile={!matches}
                    name="lastName"
                    id="lastName"
                    label="Last Name"
                    classes={{ input2col }}
                    component={this.renderTextField}
                    type="text"
                  />
                </FormGroup>
                <Field
                  label="Home Email"
                  name="homeEmail"
                  id="homeEmail"
                  type="email"
                  // classes={this.classes}
                  component={this.renderTextField}
                />
              </React.Fragment>
            )}
            <FormLabel
              // className={this.classes.formLabel}
              sx={{
                margin: "10px 0 10px",
                fontSize: "20px",
                color: "black"
              }}
              component="legend"
            >
              <Translate id="raceEthnicityHelperText" />
            </FormLabel>
            <FormGroup
              // className={this.classes.formGroup}
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                margin: "0 0 20px"
              }}
            >
              <Field
                label="African or African-American"
                name="africanOrAfricanAmerican"
                id="africanOrAfricanAmerican"
                // classes={this.classes}
                component={this.renderCheckbox}
                localize={this.props.localize}
              />
              <Field
                label="Arab American, Middle Eastern, or North African"
                name="arabAmericanMiddleEasternOrNorthAfrican"
                id="arabAmericanMiddleEasternOrNorthAfrican"
                // classes={this.classes}
                component={this.renderCheckbox}
                localize={this.props.localize}
              />
              <Field
                label="Asian or Asian American"
                name="asianOrAsianAmerican"
                id="asianOrAsianAmerican"
                // classes={this.classes}
                component={this.renderCheckbox}
                localize={this.props.localize}
              />
              <Field
                label="Hispanic or Latinx"
                name="hispanicOrLatinx"
                id="hispanicOrLatinx"
                // classes={this.classes}
                component={this.renderCheckbox}
                localize={this.props.localize}
              />
              <Field
                label="Native American or Indigenous"
                name="nativeAmericanOrIndigenous"
                id="nativeAmericanOrIndigenous"
                // classes={this.classes}
                component={this.renderCheckbox}
                localize={this.props.localize}
              />
              <Field
                label="Native Hawaiian or Other Pacific Islander"
                name="nativeHawaiianOrOtherPacificIslander"
                id="nativeHawaiianOrOtherPacificIslander"
                // classes={this.classes}
                component={this.renderCheckbox}
                localize={this.props.localize}
              />
              <Field
                label="White"
                name="white"
                id="white"
                // classes={this.classes}
                component={this.renderCheckbox}
                localize={this.props.localize}
              />
              <Field
                label="Other"
                name="other"
                id="other"
                // classes={this.classes}
                component={this.renderCheckbox}
                localize={this.props.localize}
              />
              <Field
                label="Declined"
                name="declined"
                id="declined"
                // classes={this.classes}
                component={this.renderCheckbox}
                localize={this.props.localize}
              />
            </FormGroup>

            <FormLabel
              // className={this.classes.formLabel}
              sx={{
                margin: "10px 0 10px",
                fontSize: "20px",
                color: "black"
              }}
              component="legend"
            >
              <Translate id="otherSocialIdentities" />
            </FormLabel>
            <FormGroup
              // className={this.classes.formGroup}
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                margin: "0 0"
              }}
            >
              <Box
                sx={{
                  marginBottom: "15px"
                }}
              >
                <Field
                  label="I identify as LGBTQIA+"
                  name="lgbtqId"
                  id="lgbtqId"
                  type="checkbox"
                  //classes={this.classes}
                  block
                  component={this.renderCheckbox}
                  localize={this.props.localize}
                />
                <Field
                  label="I identify as transgender"
                  name="transId"
                  id="transId"
                  type="checkbox"
                  block
                  // classes={this.classes}
                  component={this.renderCheckbox}
                  localize={this.props.localize}
                />
                <Field
                  label="I am a veteran or active military"
                  name="veteranId"
                  id="veteranId"
                  type="checkbox"
                  block
                  //classes={this.classes}
                  component={this.renderCheckbox}
                  localize={this.props.localize}
                />
                <Field
                  label="I identify as disabled or a person with a disability"
                  name="disabilityId"
                  id="disabilityId"
                  type="checkbox"
                  block
                  //classes={this.classes}
                  component={this.renderCheckbox}
                  localize={this.props.localize}
                />
                <Field
                  label="I identify as Deaf or hard-of-hearing"
                  name="deafOrHardOfHearing"
                  id="deafOrHardOfHearing"
                  type="checkbox"
                  block
                  //classes={this.classes}
                  component={this.renderCheckbox}
                  localize={this.props.localize}
                />
                <Field
                  label="I identify as Blind or visually impaired"
                  name="blindOrVisuallyImpaired"
                  id="blindOrVisuallyImpaired"
                  type="checkbox"
                  block
                  //classes={this.classes}
                  component={this.renderCheckbox}
                  localize={this.props.localize}
                />
              </Box>
              <Field
                label="Gender"
                name="gender"
                id="gender"
                type="select"
                //classes={this.classes}
                component={this.renderSelect}
                sx={{
                  marginBottom: "0px"
                }}
                options={genderOptions}
              />
              {this.props.formValues.gender === "other" && (
                <Field
                  label="If other, Please describe"
                  name="genderOtherDescription"
                  id="genderOtherDescription"
                  type="text"
                  //classes={this.classes}
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
                // labelWidth={97}
                sx={{ marginBottom: "0px" }}
                options={genderPronounOptions}
              />
            </FormGroup>

            <FormLabel
              // className={this.classes.formLabel}
              sx={{
                margin: "10px 0 10px",
                fontSize: "20px",
                color: "black"
              }}
              component="legend"
            >
              <Translate id="employmentInfo" />
            </FormLabel>
            <FormGroup
              // className={this.classes.formGroup}
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                margin: "0 0 20px"
              }}
            >
              <Field
                label="Job Class/Title"
                name="jobTitle"
                id="jobTitle"
                type="text"
                //classes={this.classes}
                component={this.renderTextField}
              />
              <Field
                label="Hire Date"
                name="hireDate"
                id="hireDate"
                type="text"
                //classes={this.classes}
                component={this.renderTextField}
              />
              <Field
                label="Worksite"
                name="worksite"
                id="worksite"
                type="text"
                //classes={this.classes}
                component={this.renderTextField}
              />
              <Field
                label="Work Email"
                name="workEmail"
                id="workEmail"
                type="email"
                //classes={this.classes}
                component={this.renderTextField}
              />
              <Field
                label="Work Phone"
                name="workPhone"
                id="workPhone"
                type="tel"
                //classes={this.classes}
                component={this.renderTextField}
              />
            </FormGroup>

            <FormLabel
              // className={this.classes.formLabel}
              sx={{
                margin: "10px 0 10px",
                fontSize: "20px",
                color: "black"
              }}
              component="legend"
            >
              <Translate id="mailToAddress" />
            </FormLabel>
            <FormHelperText
              // className={this.classes.page2IntroText}
              sx={{
                fontSize: ".9rem",
                lineHeight: "1.2em",
                padding: {
                  xs: "0 0 .5em 0",
                  sm: "0 0 .5em .5em"
                },
                marginTop: "0px"
              }}
              id="mailingAddressDescription"
            >
              <Translate id="fieldHintAddress" />
            </FormHelperText>
            <FormGroup
              // className={this.classes.formGroup}
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                margin: "0 0 20px"
              }}
            >
              <Field
                label="Mailing Street"
                name="mailToStreet"
                id="mailToStreet"
                type="text"
                //classes={this.classes}
                component={this.renderTextField}
              />
              <Field
                label="Mailing City"
                name="mailToCity"
                id="mailToCity"
                type="text"
                //classes={this.classes}
                component={this.renderTextField}
              />
              <Field
                label="Mailing State"
                name="mailToState"
                id="mailToState"
                type="select"
                //classes={this.classes}
                formControlName="formControlDate"
                component={this.renderSelect}
                // labelWidth={88}
                sx={{ marginBottom: "0px" }}
                options={stateList}
              />
              <Field
                label="Mailing ZIP"
                name="mailToZip"
                id="mailToZip"
                type="text"
                //classes={this.classes}
                component={this.renderTextField}
              />
            </FormGroup>

            <ButtonWithSpinner
              type="submit"
              color="primary"
              //className={this.classes.formButton}
              sx={{
                width: "100%",
                padding: "20px",
                margin: "0 0 40px"
              }}
              variant="contained"
              loading={this.props.submission.loading}
            >
              <Translate id="submit" />
            </ButtonWithSpinner>
          </form>
        </Box>
      </Box>
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
export const SubmissionFormPage2FormWrap = reduxForm({
  form: "submissionPage2",
  validate,
  enableReinitialize: true
})(SubmissionFormPage2ComponentFunctionWrapper);

export default withLocalize(SubmissionFormPage2FormWrap);
