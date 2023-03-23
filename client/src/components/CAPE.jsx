import { Field, reduxForm, getFormValues } from "redux-form";
import { connect } from "react-redux";
// import { ReCaptcha } from "react-recaptcha-v3";
import { Translate } from "react-localize-redux";

import AlertDialog from "./AlertDialog";
import ButtonWithSpinner from "./ButtonWithSpinner";
import * as formElements from "./SubmissionFormElements";

import {
  Button,
  Typography,
  Card,
  CardContent,
  CardMedia,
  FormLabel,
  FormHelperText,
  FormGroup
} from "@mui/material";

import FormatQuote from "@mui/icons-material/FormatQuote";

import useMediaQuery from "@mui/material/useMediaQuery";

import headshot from "../img/deffo_mebrat_300.png";

import PropTypes from "prop-types";

import { capeValidate } from "../utils/validators";
import { scrollToFirstError } from "../utils";

// change to class component and add getDJRRate on componentDidMount for standalone prefills (only needed for prefill with contact id AND !checkoff)
// if standalone blank slate skip DJR call, just require payment by default if !checkoff

export const CAPE = props => {
  const {
    handleCAPESubmit,
    classes,
    loading,
    back,
    formValues,
    width,
    renderSelect,
    renderTextField,
    renderCheckbox,
    suggestedAmountOnChange,
    standAlone,
    verifyCallback,
    employerTypesList,
    updateEmployersPicklist,
    employerList,
    cape_legal,
    change,
    lookupSFContact,
    capeObject,
    checkCAPEPaymentLogic,
    displayCAPEPaymentFields,
    handleCAPEOpen,
    handleCAPEClose,
    capeOpen,
    closeDialog,
    mobilePhoneOnBlur,
    checkoff
  } = props;

  const community = formValues.employerType === "community member";
  const matches = useMediaQuery("(min-width:450px)");
  return (
    <div data-testid="component-cape">
      {capeOpen && (
        <AlertDialog
          open={capeOpen}
          handleClose={handleCAPEClose}
          title={<Translate id="skipTab" />}
          content={<Translate id="skipWarning" />}
          danger={true}
          action={closeDialog}
          buttonText={<Translate id="skip" />}
          data-testid="component-alert-dialog"
        />
      )}
      <form
        onSubmit={props.handleSubmit(() => handleCAPESubmit(standAlone))}
        id="CAPE"
        className={classes.form}
        data-testid="cape-form"
      >
        <div className={classes.paymentCopy}>
          <Typography component="h2" className={classes.head}>
            <Translate id="capeHeadline">
              Contribute to CAPE: Citizen Action for Political Education
            </Translate>
          </Typography>
          <Typography component="p" className={classes.subhead}>
            <Translate id="capeSubhead">
              Collective political action to raise wages, protect benefits, fund
              public services, and build strong communities.
            </Translate>
          </Typography>
          <Typography component="p" className={classes.body}>
            <Translate id="capeBody1" />
          </Typography>
          <ul className={classes.ul}>
            <li className={classes.li}>
              <Translate id="capeBullet1" />
            </li>
            <li className={classes.li}>
              <Translate id="capeBullet2" />
            </li>
            <li className={classes.li}>
              <Translate id="capeBullet3" />
            </li>
          </ul>
          <Card className={classes.card}>
            <div className={classes.details}>
              <CardContent className={classes.content}>
                <Typography
                  component="h5"
                  variant="h5"
                  className={classes.cardHead}
                >
                  <Translate id="capeCardHead">Join us</Translate>
                </Typography>
                <div style={{ position: "relative" }}>
                  <FormatQuote
                    style={{
                      color: "#531078",
                      transform: "scaleX(-1)",
                      position: "absolute",
                      top: -3,
                      left: -5,
                      opacity: 0.8
                    }}
                  />
                  <Typography component="p" className={classes.pullQuote}>
                    <Translate id="capePullQuote">
                      I can’t write big checks. But I contribute what I can each
                      month to CAPE. And when we put all of our resources
                      together, we have shown we can elect legislators in Oregon
                      who will fight for working families and our clients.
                    </Translate>
                  </Typography>
                  <FormatQuote
                    style={{
                      color: "#531078",
                      position: "absolute",
                      bottom: 5,
                      right: -10,
                      opacity: 0.8
                    }}
                  />
                </div>
                <Typography component="p" className={classes.quoteAttr}>
                  <Translate id="capeQuoteAttr">
                    &mdash;Deffo Mebrat, Adult Foster Care Provider
                  </Translate>
                </Typography>
              </CardContent>
            </div>
            <CardMedia
              className={classes.cover}
              image={headshot}
              title="Deffo Mebrat"
            />
          </Card>
        </div>
        {standAlone && (
          <div data-testid="form-contact-info">
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
            <FormGroup classes={{ root: classes.formGroupTopMargin }}>
              <Field
                label="Home Email"
                name="homeEmail"
                id="homeEmail"
                type="email"
                classes={classes}
                component={renderTextField}
              />
            </FormGroup>
            <FormHelperText className={classes.formHelperText}>
              <Translate id="homeEmailHint" />
            </FormHelperText>
            <FormGroup>
              <Field
                data-testid="select-employer-type"
                label="Employer Type"
                name="employerType"
                id="employerType"
                type="select"
                classes={classes}
                component={renderSelect}
                options={employerTypesList}
                onChange={updateEmployersPicklist}
                // labelWidth={'100'}
                style={{ width: 100 }}
              />
              {formValues.employerType !== "" && (
                <Field
                  // labelWidth={'104'}
                  style={{ width: 104 }}
                  label="Employer Name"
                  name="employerName"
                  id="employerName"
                  type="select"
                  classes={classes}
                  component={renderSelect}
                  options={employerList}
                  onBlur={lookupSFContact}
                />
              )}
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
                // labelWidth={'41'}
                style={{ width: 41 }}
                options={formElements.monthList}
              />

              <Field
                label="Day"
                name="dd"
                id="dd"
                type="select"
                formControlName="formControlDate"
                classes={classes}
                component={renderSelect}
                // labelWidth={'24'}
                style={{ width: 24 }}
                options={formElements.dateOptions(props)}
              />

              <Field
                label="Year"
                name="yyyy"
                id="yyyy"
                type="select"
                formControlName="formControlDate"
                classes={classes}
                component={renderSelect}
                // labelWidth={'30'}
                style={{ width: 30 }}
                options={formElements.yearOptions()}
              />
            </FormGroup>

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
                options={formElements.stateList}
                // labelWidth={'80'}
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

            <FormGroup>
              <Field
                label="Mobile Phone†"
                name="mobilePhone"
                id="mobilePhone"
                type="tel"
                classes={classes}
                component={renderTextField}
                onBlur={mobilePhoneOnBlur}
              />

              <FormHelperText className={classes.formHelperText}>
                <Translate id="phoneLegalLanguage" />
              </FormHelperText>

              <Field
                label="Opt Out Of Receiving Mobile Alerts"
                name="textAuthOptOut"
                id="textAuthOptOut"
                type="checkbox"
                formControlName="controlCheckboxMargin"
                classes={classes}
                component={renderCheckbox}
              />
            </FormGroup>
          </div>
        )}
        <Field
          label="Job Title"
          name="jobTitle"
          id="jobTitle"
          type="text"
          classes={classes}
          component={renderTextField}
        />
        {!displayCAPEPaymentFields && (
          <ButtonWithSpinner
            type="button"
            color="primary"
            className={classes.formButton}
            variant="contained"
            loading={loading}
            onClick={checkCAPEPaymentLogic}
            data-testid="button-next-upper"
          >
            <Translate id="next">Next</Translate>
          </ButtonWithSpinner>
        )}
        {displayCAPEPaymentFields && (
          <div data-testid="component-cape-payment-fields">
            <div className={classes.paymentCopy}>
              <Typography component="h2" className={classes.head}>
                <Translate id="capePaymentHead">
                  Make your contribution today
                </Translate>
              </Typography>
              <div className={classes.suggestedAmounts}>
                <div className={classes.suggestedAmountBoxes}>
                  <Field
                    data-testid="radio-cape-amount"
                    label="Donation amount"
                    name="capeAmount"
                    formControlName="capeAmount"
                    id="capeAmountMonthly"
                    direction="horiz"
                    className={classes.horizRadio}
                    classes={classes}
                    component={formElements.renderCAPERadioGroup}
                    options={capeObject.monthlyOptions}
                    onChange={(event, value) => {
                      change("capeAmount", value);
                      suggestedAmountOnChange(event);
                    }}
                  />
                </div>
              </div>
              {formValues.capeAmount === "Other" && (
                <Field
                  dataTestId="field-other-amount"
                  label="Monthly Donation Amount"
                  name="capeAmountOther"
                  id="capeAmountOther"
                  type="number"
                  inputProps={{ min: 1 }}
                  classes={classes}
                  component={renderTextField}
                  onChange={(event, value) => {
                    change("capeAmountOther", value);
                  }}
                  additionalOnChange={suggestedAmountOnChange}
                />
              )}
            </div>
            <div className={classes.legalCopy} ref={cape_legal}>
              {community ? (
                <p>
                  <Translate id="communityCAPE2022" />
                </p>
              ) : (
                <>
                  <p>
                    <Translate
                      id={checkoff ? "capeLegalCheckoff1" : "capeLegalStripe1"}
                    />
                  </p>
                  <p>
                    <strong>
                      <Translate id="capeNewLegal1" />
                    </strong>
                  </p>
                  <p>
                    <Translate id="capeNewLegal2" />
                  </p>
                  <p>
                    <Translate id="capeNewLegal3" />
                  </p>
                  <p>
                    <Translate id="capeNewLegal4" />
                  </p>
                  <p>
                    <Translate id="capeNewLegal5" />
                  </p>
                  <p>
                    <Translate id="capeNewLegal6" />
                  </p>
                  <p>
                    <Translate id="capeNewLegal7" />
                  </p>
                  <p>
                    <Translate id="capeNewLegal8" />
                  </p>
                </>
              )}
            </div>
            <ButtonWithSpinner
              type="submit"
              color="primary"
              className={
                standAlone
                  ? `${classes.formButton} g-recaptcha`
                  : classes.formButton
              }
              variant="contained"
              loading={loading}
              data-sitekey="6LdzULcUAAAAAJ37JEr5WQDpAj6dCcPUn1bIXq2O"
              data-callback={verifyCallback}
              data-testid="button-submit"
              aria-label="Submit"
            >
              <Translate id="submitButton">Submit</Translate>
            </ButtonWithSpinner>
          </div>
        )}
        {!standAlone && (
          <div className={classes.buttonWrapCAPE}>
            <Button
              type="button"
              data-testid="button-back"
              onClick={() => back(1)}
              color="primary"
              className={classes.backSmall}
              variant="contained"
            >
              <Translate id="back">Back</Translate>
            </Button>
            <Button
              type="button"
              data-testid="button-next"
              onClick={handleCAPEOpen}
              color="primary"
              className={classes.nextSmall}
              variant="contained"
            >
              <Translate id="skip">Skip</Translate>
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

CAPE.propTypes = {
  onSubmit: PropTypes.func,
  classes: PropTypes.object,
  verifyCallback: PropTypes.func,
  loading: PropTypes.bool,
  pristine: PropTypes.bool,
  invalid: PropTypes.bool
};

const mapStateToProps = state => ({
  submission: state.submission,
  initialValues: state.submission.formPage1,
  formValues: getFormValues("submissionPage1")(state) || {}
});

// add reduxForm to component
export const CAPEForm = reduxForm({
  form: "submissionPage1",
  validate: capeValidate,
  destroyOnUnmount: false,
  forceUnregisterOnUnmount: true, // <------ unregister fields on unmount
  enableReinitialize: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  onSubmitFail: scrollToFirstError
})(CAPE);

// connect to redux store
export const CAPEConnected = connect(mapStateToProps)(CAPEForm);

export default CAPEConnected;
