import React from "react";
import PropTypes from "prop-types";
import { reduxForm, Field } from "redux-form";
import { withTranslation, Trans } from "react-i18next";
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
  constructor(props) {
    super(props);
    this.state = {};
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  // reusable MUI form components
  renderTextField = formElements.renderTextField;
  renderSelect = formElements.renderSelect;
  renderCheckbox = formElements.renderCheckbox;

  handleSubmit = async () => {
    console.log("handleSubmit p2");
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
      firstName,
      lastName,
      homeEmail,
      Wmm,
      Wdd,
      Wyyyy
    } = this.props.formValues;
    const ethnicity = formElements.calcEthnicity(this.props.formValues);
    console.log(ethnicity);
    // format hireDate
    let hireDate;
    if (Wmm && Wdd && Wyyyy) {
      hireDate = formElements.formatHireDate(this.props.formValues);
    }
    console.log(`################################`);
    console.log(hireDate);
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
    // console.log(`SUBMISSION ID: ${id}`);

    if (!id) {
      cleanBody.first_name = firstName;
      cleanBody.last_name = lastName;
      cleanBody.home_email = homeEmail;

      await this.props
        .createSubmission(cleanBody, true) // partial submission = true
        .catch(err => {
          console.error(err);
          return this.props.handleError(err);
        });
    } else {
      await this.props
        .updateSubmission(id, cleanBody)
        // no then block here bc nothing is returned (this is an app method not an API Call)
        .catch(err => {
          console.error(err);
          return this.props.handleError(err);
        });
    }
    this.props.apiSF
      .updateSFContact(salesforceId, cleanBody)
      .then(() => {
        console.log("updated SF contact");
        this.props.openSnackbar("success", this.props.t("snackBarSuccess"));
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
            onSubmit={this.props.handleSubmit(this.handleSubmit)}
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
                <Trans
                  i18nKey="thankYouNoPayment"
                  data-testid="no-payment-text"
                />
              </FormHelperText>
            </Box>
            <p>
              <Trans i18nKey="introParagraph" />
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
              <Trans i18nKey="raceEthnicityHelperText" />
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
                label="Black, African, or African-American"
                name="africanOrAfricanAmerican"
                id="africanOrAfricanAmerican"
                component={this.renderCheckbox}
              />
              <Field
                label="Arab, Middle Eastern, or North African"
                name="arabAmericanMiddleEasternOrNorthAfrican"
                id="arabAmericanMiddleEasternOrNorthAfrican"
                component={this.renderCheckbox}
              />
              <Field
                label="Asian, Desi, or Pacific Islander"
                name="asianOrAsianAmerican"
                id="asianOrAsianAmerican"
                component={this.renderCheckbox}
              />
              <Field
                label="Latino/a/x, Chicano/a, or Hispanic"
                name="hispanicOrLatinx"
                id="hispanicOrLatinx"
                component={this.renderCheckbox}
              />
              <Field
                label="Indigenous, American Indian, or Native American"
                name="nativeAmericanOrIndigenous"
                id="nativeAmericanOrIndigenous"
                component={this.renderCheckbox}
              />
              <Field
                label="White"
                name="white"
                id="white"
                component={this.renderCheckbox}
              />
              <Field
                label="Something else"
                name="other"
                id="other"
                component={this.renderCheckbox}
              />
              <Field
                label="Prefer not to say"
                name="declined"
                id="declined"
                component={this.renderCheckbox}
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
              <Trans i18nKey="otherSocialIdentities" />
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
                  label="I identify as LGBTQIA2S+ or Queer"
                  name="lgbtqId"
                  id="lgbtqId"
                  type="checkbox"
                  block
                  component={this.renderCheckbox}
                />
                <Field
                  label="I identify as transgender"
                  name="transId"
                  id="transId"
                  type="checkbox"
                  block
                  component={this.renderCheckbox}
                />
                <Field
                  label="I am a veteran or active military"
                  name="veteranId"
                  id="veteranId"
                  type="checkbox"
                  block
                  component={this.renderCheckbox}
                />
                <Field
                  label="I identify as disabled or a person with a disability"
                  name="disabilityId"
                  id="disabilityId"
                  type="checkbox"
                  block
                  component={this.renderCheckbox}
                />
                <Field
                  label="I identify as Deaf or hard-of-hearing"
                  name="deafOrHardOfHearing"
                  id="deafOrHardOfHearing"
                  type="checkbox"
                  block
                  component={this.renderCheckbox}
                />
                <Field
                  label="I identify as Blind or visually impaired"
                  name="blindOrVisuallyImpaired"
                  id="blindOrVisuallyImpaired"
                  type="checkbox"
                  block
                  component={this.renderCheckbox}
                />
              </Box>
              <Field
                label="Gender"
                name="gender"
                id="gender"
                type="select"
                component={this.renderSelect}
                sx={{
                  marginBottom: "15px"
                }}
                options={genderOptions}
              />
              {this.props.formValues.gender === "other" && (
                <Field
                  label="If other, Please describe"
                  name="genderOtherDescription"
                  id="genderOtherDescription"
                  type="text"
                  component={this.renderTextField}
                />
              )}
              <Field
                label="Your pronouns"
                name="genderPronoun"
                id="genderPronoun"
                type="select"
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
              <Trans i18nKey="employmentInfo" />
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
                component={this.renderTextField}
              />
              <FormLabel
                // className={classes.formLabel}
                sx={{
                  margin: "10px 0 10px"
                  // fontSize: "20px",
                  // color: "black"
                }}
                component="legend"
              >
                <Trans i18nKey="hireDate" />
              </FormLabel>
              <FormGroup
                row
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "nowrap",
                  justifyContent: "space-between",
                  width: "280px"
                  //classes.formGroup2ColShort
                }}
              >
                <Field
                  label="Month"
                  name="Wmm"
                  id="Wmm"
                  type="select"
                  formControlName="formControlDate"
                  component={this.renderSelect}
                  style={{ width: "100%" }}
                  options={formElements.monthList}
                  short
                />

                <Field
                  label="Day"
                  name="Wdd"
                  id="Wdd"
                  type="select"
                  formControlName="formControlDate"
                  component={this.renderSelect}
                  style={{ width: "100%" }}
                  options={formElements.dateOptions(this.props)}
                  short
                />

                <Field
                  label="Year"
                  name="Wyyyy"
                  id="Wyyyy"
                  type="select"
                  formControlName="formControlDate"
                  component={this.renderSelect}
                  style={{ width: "100%" }}
                  options={formElements.yearOptions()}
                  short
                />
              </FormGroup>
              <Field
                label="Worksite"
                name="worksite"
                id="worksite"
                type="text"
                component={this.renderTextField}
              />
              <Field
                label="Work Email"
                name="workEmail"
                id="workEmail"
                type="email"
                component={this.renderTextField}
              />
              <Field
                label="Work Phone"
                name="workPhone"
                id="workPhone"
                type="tel"
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
              <Trans i18nKey="mailToAddress" />
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
              <Trans i18nKey="fieldHintAddress" />
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
                component={this.renderTextField}
              />
              <Field
                label="Mailing City"
                name="mailToCity"
                id="mailToCity"
                type="text"
                component={this.renderTextField}
              />
              <Field
                label="Mailing State"
                name="mailToState"
                id="mailToState"
                type="select"
                formControlName="formControlDate"
                component={this.renderSelect}
                // labelWidth={88}
                sx={{ marginBottom: "15px" }}
                options={stateList}
              />
              <Field
                label="Mailing ZIP"
                name="mailToZip"
                id="mailToZip"
                type="text"
                component={this.renderTextField}
              />
            </FormGroup>
            <div data-testid="button-div">
              <ButtonWithSpinner
                type="submit"
                color="primary"
                data-testid="button-submit-p2"
                //className={this.classes.formButton}
                sx={{
                  width: "100%",
                  padding: "20px",
                  margin: "0 0 40px"
                }}
                variant="contained"
                loading={this.props.submission.loading}
              >
                <Trans i18nKey="submit" />
              </ButtonWithSpinner>
            </div>
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

export default withTranslation()(SubmissionFormPage2FormWrap);
