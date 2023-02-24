// import { ReCaptcha } from "react-recaptcha-v3";
import {
  Field,
  reduxForm,
  getFormValues,
  getFormSubmitErrors
} from "redux-form";
import { connect } from "react-redux";
import { Translate } from "react-localize-redux";

import { FormLabel, FormHelperText, FormGroup, Button } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import PropTypes from "prop-types";

import * as formElements from "./SubmissionFormElements";
import { validate } from "../utils/validators";
import { scrollToFirstError } from "../utils";

// helper functions these MAY NEED TO BE UPDATED with localization package
const {
  stateList,
  monthList,
  languageOptions,
  dateOptions,
  yearOptions
} = formElements;

export const Tab1 = props => {
  const {
    onSubmit,
    classes,
    employerTypesList,
    employerList,
    updateEmployersPicklist,
    handleEmployerChange,
    renderSelect,
    renderTextField,
    renderCheckbox,
    formValues,
    width,
    verifyCallback
  } = props;

  const employerNameOnChange = () => {
    handleEmployerChange();
  };

  const employerTypeOnChange = () => {
    updateEmployersPicklist();
    handleEmployerChange();
  };

  const matches = useMediaQuery("(min-width:450px)");

  return (
    <div data-testid="component-tab1" className={classes.sectionContainer}>
      <form
        onSubmit={props.handleSubmit(onSubmit)}
        id="tab2"
        className={classes.form}
      >
        <div className={classes.formSection}>
          <Field
            data-testid="select-employer-type"
            label="Employer Type"
            name="employerType"
            id="employerType"
            type="select"
            classes={classes}
            component={renderSelect}
            options={employerTypesList}
            onChange={employerTypeOnChange}
            // labelWidth={100}
            style={{ width: "100%" }}
          />
          {formValues.employerType !== "" && (
            <Field
              // labelWidth={104}
              style={{ width: "100%" }}
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
          <FormGroup row classes={{ root: classes.formGroup2Col }}>
            <Field
              twocol
              mobile={!matches}
              label="First Name"
              name="firstName"
              id="firstName"
              type="text"
              classes={{ input2col: classes.input2col }}
              component={renderTextField}
            />

            <Field
              twocol
              mobile={!matches}
              name="lastName"
              id="lastName"
              label="Last Name"
              classes={{ input2col: classes.input2col }}
              component={renderTextField}
              type="text"
            />
          </FormGroup>

          <FormLabel className={classes.formLabel} component="legend">
            <Translate id="birthDate" />
          </FormLabel>
          <FormGroup row classes={{ root: classes.formGroup2ColShort }}>
            <Field
              label="Month"
              name="mm"
              id="mm"
              type="select"
              classes={classes}
              formControlName="formControlDate"
              component={renderSelect}
              // labelWidth={41}
              style={{ width: "100%" }}
              options={monthList}
            />

            <Field
              label="Day"
              name="dd"
              id="dd"
              type="select"
              formControlName="formControlDate"
              classes={classes}
              component={renderSelect}
              // labelWidth={24}
              style={{ width: "100%" }}
              options={dateOptions(props)}
            />

            <Field
              label="Year"
              name="yyyy"
              id="yyyy"
              type="select"
              formControlName="formControlDate"
              classes={classes}
              component={renderSelect}
              // labelWidth={30}
              style={{ width: "100%" }}
              options={yearOptions()}
            />
          </FormGroup>

          <Field
            label="Preferred Language"
            name="preferredLanguage"
            id="preferredLanguage"
            type="select"
            classes={classes}
            component={renderSelect}
            // labelWidth={132}
            style={{ width: 132 }}
            options={languageOptions}
          />

          <FormLabel className={classes.formLabel} component="legend">
            <Translate id="address">Address</Translate>
          </FormLabel>

          <Field
            label="Home Street"
            name="homeStreet"
            id="homeStreet"
            type="text"
            classes={classes}
            component={renderTextField}
          />

          <FormHelperText className={classes.formHelperText}>
            <Translate id="homeStreetHint" />
          </FormHelperText>
          <FormGroup
            className={classes.formGroup}
            row
            classes={{ root: classes.formGroup2Col }}
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
              // labelWidth={80}
              style={{ width: 80 }}
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

          <FormHelperText className={classes.formHelperText}>
            <Translate id="homeEmailHint" />
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

            <FormHelperText className={classes.formHelperText}>
              <Translate id="phoneLegalLanguage" />
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
          <div className={classes.buttonWrap}>
            <Button
              type="submit"
              color="primary"
              className={`${classes.next} g-recaptcha`}
              variant="contained"
              data-sitekey="6LdzULcUAAAAAJ37JEr5WQDpAj6dCcPUn1bIXq2O"
              data-callback={verifyCallback}
            >
              <Translate id="next">Next</Translate>
            </Button>
          </div>
        </div>
      </form>
    </div>
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
