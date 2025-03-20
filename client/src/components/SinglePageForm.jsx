import React, { useEffect, useRef } from "react";
import {
  Field,
  reduxForm,
  getFormValues,
  getFormSubmitErrors
} from "redux-form";
import { connect } from "react-redux";
import { Trans, useTranslation } from "react-i18next";

import {
  FormLabel,
  FormHelperText,
  FormGroup,
  Button,
  Typography,
  Box
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import PropTypes from "prop-types";

import * as formElements from "./SubmissionFormElements";
import { validate, prefillValidate } from "../utils/validators";
import * as utils from "../utils";

// helper functions
const {
  stateList,
  monthList,
  languageOptions,
  dateOptions,
  yearOptions,
  classesPage1,
  languageMap,
  languageMapEnglish,
  getKeyByValue
} = formElements;

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

export const SinglePageForm = props => {
  const {
    onSubmit,
    // classes,
    employerTypesList,
    employerList,
    updateEmployersPicklist,
    handleEmployerChange,
    renderSelect,
    renderTextField,
    renderCheckbox,
    formValues,
    width,
    // verifyCallback,
    legal_language
  } = props;

  const prefillValues = props.submission.prefillValues;

  // console.log(employerTypesList);
  // console.log(employerTypesList.length);

  // console.log("SinglePageFormRender formValues");
  // console.log(formValues);

  // console.log("SinglePageFormRender prefillValues");
  // console.log(prefillValues);

  // detect user language, set preferred language for spf
  // this determines whether language field is displayed and sets value for submission and 
  // OMA but NOT for updating SF contact (that happens in App cDM and changeLanguage)
  
  const defaultLanguage = utils.detectDefaultLanguage().lang;
  // console.log(`defaultLanguage: ${defaultLanguage}`);
  // console.log(`userSelectedLanguage: ${props.userSelectedLanguage}`);

  const langOther = utils.detectDefaultLanguage().other;
  // console.log(`langOther: ${langOther}`);

  let languageCode;
  if (props.userSelectedLanguage) {
    languageCode = languageMap[props.userSelectedLanguage]
  } else {
    languageCode = defaultLanguage
  }
  // console.log(`languageCode: ${languageCode}`);
  const userSelectedLanguage = getKeyByValue(languageMapEnglish,languageCode);
  // console.log(`userSelectedLanguage: ${userSelectedLanguage}`);
  // console.log(`language for preferred language field: ${currentLanguage}`);

  let preferredLanguage;
  if (langOther) {
    preferredLanguage = "";
  } else if (userSelectedLanguage) {
    preferredLanguage = userSelectedLanguage;
  } else if (props.submission.formPage1.preferredLanguage) {
    preferredLanguage = props.submission.formPage1.preferredLanguage
  } 

  prefillValues.preferredLanguage = preferredLanguage;

  const prefillErrors = prefillValidate(prefillValues);

  const completeAddress = !prefillErrors.homeStreet && !prefillErrors.homeCity && !prefillErrors.homeZip;
  // console.log(`completeAddress: ${completeAddress}`);
  // console.log(`prefillErrors`);
  // console.log(prefillErrors);

  const classes = classesPage1;

  const employerNameOnChange = () => {
    handleEmployerChange();
  };

  const employerTypeOnChange = () => {
    console.log("employerTypeOnChange");
    props.updateEmployersPicklist();
    props.handleEmployerChange();
  };

  const matches = useMediaQuery("(min-width:450px)");
  return (
    <Box
      data-testid="component-spf"
      sx={{
        maxWidth: "600px",
        margin: "auto",
        background: "white",
        padding: {
          xs: "15px 15px 40px 15px",
          sm: "20px 20px 40px 20px"
        },
        borderRadius: "0 0 4px 4px"
      }}
    >
    {process.env.REACT_APP_ENV_TEXT !== "production" && (
      <Box
        sx={{
          padding: "20px",
          backgroundColor: "danger.main", // orange[500], // #b71c1c
          margin: {
            xs: "0px -20px 20px -20px",
            sm: "-20px -20px 20px -20px",
            md: "-20px -20px 20px -20px",
            lg: "-20px -20px 20px -20px",
            xl: "0px 0px 20px 0px"
          }
        }}
      >
        <div>
          <Typography
            variant="body1"
            gutterBottom
            data-testid="testWarning"
            style={{ display: "inline" }}
          >
            This form is for testing only. Membership data submitted
            through this form will not be processed. If you landed on the
            test page by mistake and want to become a member of SEIU Local
            503, please click here:&nbsp;
          </Typography>
          <strong>
            <a
              style={{ fontWeight: "bold", fontSize: "1.2em" }}
              href="https://seiu503signup.org"
            >
              seiu503signup.org
            </a>
          </strong>
        </div>
      </Box>
    )}
      <form
        onSubmit={props.handleSubmit(onSubmit)}
        role="form"
        id="singlePageForm"
        data-testid="form-spf"
        sx={{
          marginTop: "20px !important"
        }}
      >
        {prefillErrors.employerName &&
          <>
            {employerTypesList.length < 3 && (
              <Box
                sx={{
                  padding: "20px",
                  backgroundColor: "danger.main", // orange[500], // #b71c1c
                  margin: {
                    xs: "auto -20px",
                    sm: "0px -20px 0px -20px",
                    md: "20px 0px",
                    lg: "20px 0px",
                    xl: "0px"
                  }
                }}
              >
                <div>
                  <Typography
                    variant="body1"
                    gutterBottom
                    data-testid="apiWarning"
                    style={{ display: "inline" }}
                  >
                    <Trans i18nKey="apiWarning" />
                  </Typography>
                  &nbsp;
                  <strong>
                    <a
                      style={{ fontWeight: "bold" }}
                      href="https://seiu503.tfaforms.net/490"
                    >
                      <Trans i18nKey="reportProblem" />
                    </a>
                  </strong>
                </div>
              </Box>
            )}
            <Box
              sx={{
                paddingTop: "20px",
                width: "100%"
              }}
            >         
              <Field
                data-testid="select-employer-type"
                dataTestId="select-employer-type-field"
                label="Employer Type"
                name="employerType"
                id="employerType"
                type="select"
                classes={classes}
                component={renderSelect}
                options={employerTypesList}
                onChange={employerTypeOnChange}
                style={{ width: "100%" }}
              />
              {formValues.employerType !== "" && (
                <Field
                  style={{ width: "100%" }}
                  dataTestId="select-employer-name-field"
                  label="Employer Name"
                  name="employerName"
                  id="employerName"
                  type="select"
                  classes={classes}
                  component={renderSelect}
                  options={employerList}
                  onChange={employerNameOnChange}
                />
              )}
            </Box>
          </>
        }          

          <FormGroup
            row
            sx={{
              display: "flex",
              flexDirection: "row",
              flexWrap: {
                xs: "wrap",
                sm: "nowrap"
              },
              justifyContent: "space-between"
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
              component={renderTextField}
            />

            <Field
              twocol
              mobile={!matches}
              name="lastName"
              id="lastName"
              label="Last Name"
              classes={{ input2col }}
              component={renderTextField}
              type="text"
            />
          </FormGroup>

          <FormLabel
            sx={{
              margin: "10px 0 10px"
            }}
            component="legend"
          >
            <Trans i18nKey="birthDate" />
          </FormLabel>
          <FormGroup
            row
            sx={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "nowrap",
              justifyContent: "space-between",
              width: "280px"
            }}
          >
            <Field
              label="Month"
              name="mm"
              id="mm"
              type="select"
              classes={classes}
              formControlName="formControlDate"
              component={renderSelect}
              style={{ width: "100%" }}
              options={monthList}
              short
            />

            <Field
              label="Day"
              name="dd"
              id="dd"
              type="select"
              formControlName="formControlDate"
              classes={classes}
              component={renderSelect}
              style={{ width: "100%" }}
              options={formElements.dateOptions(props)}
              short
            />

            <Field
              label="Year"
              name="yyyy"
              id="yyyy"
              type="select"
              formControlName="formControlDate"
              classes={classes}
              component={renderSelect}
              style={{ width: "100%" }}
              options={formElements.yearOptions()}
              short
            />
          </FormGroup>

          {prefillErrors.preferredLanguage && 
            <Field
              label="Preferred Language" 
              data-testid="field-preferred-language"
              name="preferredLanguage"
              id="preferredLanguage"
              type="select"
              classes={classes}
              component={renderSelect}
              style={{ width: "100%" }}
              options={languageOptions}
            />
          }

          {!completeAddress &&
            <>
              <FormLabel
                // className={classes.formLabel}
                sx={{
                  margin: "10px 0 10px"
                  // fontSize: "20px",
                  // color: "black"
                }}
                component="legend"
              >
                <Trans i18nKey="address">Address</Trans>
              </FormLabel>

              <Field
                label="Home Street"
                name="homeStreet"
                id="homeStreet"
                type="text"
                classes={classes}
                component={renderTextField}
              />

              <FormHelperText
                // className={classes.formHelperText}
                sx={{
                  margin: "-30px 0 40px",
                  fontSize: ".75rem"
                }}
              >
                <Trans i18nKey="homeStreetHint" />
              </FormHelperText>
              <FormGroup
                row
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: {
                    xs: "wrap",
                    sm: "nowrap"
                  },
                  justifyContent: "space-between",
                  marginBottom: "30px"
                  // classes.formGroup2Col
                }}
              >
                <Field
                  label="Home City"
                  name="homeCity"
                  id="homeCity"
                  type="text"
                  twocol
                  mobile={!matches}
                  classes={classes}
                  component={renderTextField}
                />

                <Field
                  label="Home State"
                  name="homeState"
                  id="homeState"
                  type="select"
                  short
                  mobile={!matches}
                  classes={classes}
                  component={renderSelect}
                  options={stateList}
                  style={{ width: "100%" }}
                />

                <Field
                  label="Home Zip"
                  name="homeZip"
                  id="homeZip"
                  short
                  mobile={!matches}
                  type="text"
                  classes={classes}
                  component={renderTextField}
                />
              </FormGroup>
            </>
          }

          {prefillErrors.homeEmail &&
            <>
              <Field
                label="Home Email"
                name="homeEmail"
                id="homeEmail"
                type="email"
                classes={classes}
                component={renderTextField}
              />

              <FormHelperText
                // className={classes.formHelperText}
                sx={{
                  margin: "-30px 0 40px",
                  fontSize: ".75rem"
                }}
              >
                <Trans i18nKey="homeEmailHint" />
              </FormHelperText>
            </>
          }
          {prefillErrors.mobilePhone &&
            <>
              <FormGroup>
                <Field
                  label="Mobile Phone†"
                  name="mobilePhone"
                  id="mobilePhone"
                  type="tel"
                  classes={classes}
                  component={renderTextField}
                />

                <FormHelperText
                  // className={classes.formHelperText}
                  sx={{
                    margin: "-30px 0 10px",
                    fontSize: ".75rem"
                  }}
                >
                  <Trans i18nKey="phoneLegalLanguage" />
                </FormHelperText>

                <Field
                  label="Opt Out Of Receiving Mobile Alerts"
                  name="textAuthOptOut"
                  id="textAuthOptOut"
                  type="checkbox"
                  formControlName="controlCheckbox"
                  classes={classes}
                  component={renderCheckbox}
                />
              </FormGroup>
            </>
          }

          <Field
            formControlName="controlCheckboxMarginBold"
            label="Agree to Terms of Membership"
            name="termsAgree"
            id="termsAgree"
            type="checkbox"
            classes={classes}
            bold={true}
            component={renderCheckbox}
          />
          <Box
            sx={{
              margin: "0 0 35px 0",
              fontSize: "14px",
              lineHeight: "1.2em"
            }}
            id="termsOfServiceLegalLanguage"
            ref={legal_language}
          >
            <p>
              <Trans i18nKey="membershipTerms2021" />
            </p>

            <div>
              <Field
                formControlName="controlCheckboxMarginBoldSpacer"
                label="Agree to Dues Authorization"
                name="MOECheckbox"
                id="MOECheckbox"
                type="checkbox"
                classes={{
                  root: {
                    marginTop: "35px important!"
                  }
                }}
                bold={true}
                component={renderCheckbox}
              />
              <p>
                <Trans i18nKey="checkoff2021" />
              </p>
            </div>
          </Box>

          <Field
            formControlName="controlCheckboxMargin"
            data-testid="checkbox-ScholarshipBox"
            label="Scholarship Fund"
            name="scholarshipBox"
            id="scholarshipBox"
            type="checkbox"
            mini={true}
            classes={classes}
            component={renderCheckbox}
          />
          <Typography component="h3">
            <Trans i18nKey="signatureTitle" />
          </Typography>

          <>
            <Field
              label="Signature"
              data-testid="input-signature"
              name="signature"
              id="signature"
              type="text"
              classes={classes}
              component={renderTextField}
            />
            <FormHelperText
              // className={classes.formHelperText}
              sx={{
                margin: "-30px 0 40px",
                fontSize: ".75rem"
              }}
            >
              <Trans i18nKey="signatureHint" />
            </FormHelperText>
          </>
          <Box
            // className={classes.buttonWrap}
            sx={{
              width: "100%",
              padding: "0 20px 40px 0",
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "20px"
            }}
          >
            <Button
              type="submit"
              color="primary"
              data-testid="button-submit"
              // className={`g-recaptcha`}
              sx={{
                textTransform: "none",
                fontSize: "1.3rem",
                padding: "6px 20px",
                color: "#ffce04", // yellow/gold // theme.palette.secondary.main,
                "&:hover": {
                  backgroundColor: "#531078" // medium purple // theme.palette.primary.light
                }
                // classes.next
              }}
              variant="contained"
              data-sitekey={process.env.REACT_APP_GRECAPTCHA_SITEKEY}
              // data-callback={verifyCallback}
            >
              <Trans i18nKey="next">Next</Trans>
            </Button>
          </Box>
      </form>

    </Box>
  );
};

SinglePageForm.propTypes = {
  classes: PropTypes.object,
  onSubmit: PropTypes.func,
  employerTypesList: PropTypes.array,
  employerList: PropTypes.array,
  updateEmployersPicklist: PropTypes.func,
  renderSelect: PropTypes.func,
  renderTextField: PropTypes.func,
  renderCheckbox: PropTypes.func,
  formValues: PropTypes.object,
  width: PropTypes.string,
  handleTab: PropTypes.func,
  handleInput: PropTypes.func
};

const mapStateToProps = state => ({
  submission: state.submission,
  initialValues: state.submission.formPage1,
  formValues: getFormValues("submissionPage1")(state) || {},
  submitErrors: getFormSubmitErrors("submissionPage1")(state)
});

// add reduxForm to component
export const spReduxForm = reduxForm({
  form: "submissionPage1",
  validate,
  destroyOnUnmount: false, // <------ preserve form data
  forceUnregisterOnUnmount: true,
  enableReinitialize: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  onSubmitFail: utils.scrollToFirstError
})(SinglePageForm);

// connect to redux store
export const SinglePageFormConnected = connect(mapStateToProps)(spReduxForm);

export default SinglePageFormConnected;
