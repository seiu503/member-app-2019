// import { ReCaptcha } from "react-recaptcha-v3";
import {
  Field,
  reduxForm,
  getFormValues,
  getFormSubmitErrors
} from "redux-form";
import { connect } from "react-redux";
import { Trans } from "react-i18next";

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
import { validate } from "../utils/validators";
import { scrollToFirstError } from "../utils";

// helper functions
const {
  stateList,
  monthList,
  languageOptions,
  dateOptions,
  yearOptions,
  classesPage1
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

export const Tab1 = props => {
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
    width
    // width,
    // verifyCallback
  } = props;

  // console.log(employerTypesList);
  // console.log(employerTypesList.length);

  // console.log("Tab1Render");
  // console.log(formValues);

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
      data-testid="component-tab1"
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
      <form
        onSubmit={props.handleSubmit(onSubmit)}
        role="form"
        id="tab2"
        data-testid="form-tab1"
        // className={classes.form}
      >
        {employerTypesList.length < 3 && (
          <Box
            sx={{
              padding: "20px",
              backgroundColor: "danger.main", // orange[500], // #b71c1c
              margin: {
                xs: "auto -20px",
                sm: "-20px -20px 0px -20px",
                md: "10px 0px",
                lg: "10px 0px",
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
          // className={classes.formSection}
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
          {formValues.employerType &&
            formValues.employerType.toLowerCase() === "adult foster home" && (
              <Field
                label="Number of Medicaid Residents"
                name="medicaidResidents"
                id="medicaidResidents"
                type="number"
                classes={classes}
                component={renderTextField}
                InputProps={{
                  inputProps: { min: 0, max: 9, id: "medicaidResidents" }
                }}
              />
            )}
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
            // className={classes.formLabel}
            sx={{
              margin: "10px 0 10px"
              // fontSize: "20px",
              // color: "black"
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
              //classes.formGroup2ColShort
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

          <Field
            label="Preferred Language"
            name="preferredLanguage"
            id="preferredLanguage"
            type="select"
            classes={classes}
            component={renderSelect}
            style={{ width: "100%" }}
            options={languageOptions}
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
              className={`g-recaptcha`}
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
              data-sitekey="6LdzULcUAAAAAJ37JEr5WQDpAj6dCcPUn1bIXq2O"
              // data-callback={verifyCallback}
            >
              <Trans i18nKey="next">Next</Trans>
            </Button>
          </Box>
        </Box>
      </form>
    </Box>
  );
};

Tab1.propTypes = {
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
export const Tab1Form = reduxForm({
  form: "submissionPage1",
  validate,
  destroyOnUnmount: false, // <------ preserve form data
  forceUnregisterOnUnmount: true,
  enableReinitialize: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  onSubmitFail: scrollToFirstError
})(Tab1);

// connect to redux store
export const Tab1Connected = connect(mapStateToProps)(Tab1Form);

export default Tab1Connected;
