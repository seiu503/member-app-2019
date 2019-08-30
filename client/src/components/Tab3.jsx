import React from "react";
import { Field, reduxForm, getFormValues } from "redux-form";
import { connect } from "react-redux";
import Iframe from "react-iframe";

import ButtonWithSpinner from "./ButtonWithSpinner";
import Button from "@material-ui/core/Button";
import * as formElements from "./SubmissionFormElements";
import Typography from "@material-ui/core/Typography";

import PropTypes from "prop-types";

import validate from "../utils/validators";
import { scrollToFirstError } from "../utils";

export const Tab3 = props => {
  const {
    onSubmit,
    classes,
    loading,
    invalid,
    iFrameURL,
    afhDuesRate,
    back,
    formValues,
    payment,
    toggleCardAddingFrame
  } = props;

  let duesCopy = "";
  console.log(formValues.paymentType);
  if (formValues.employerType) {
    switch (formValues.employerType.toLowerCase()) {
      case "adult foster home":
        duesCopy = formElements.afhDuesCopy(afhDuesRate);
        break;
      case "retired":
        duesCopy = formElements.retireeDuesCopy;
        break;
      default:
        duesCopy = formElements.commDuesCopy;
    }
  }
  const validMethod = !!payment.activeMethodLast4 && !payment.paymentErrorHold;

  return (
    <div data-test="component-tab3" className={classes.sectionContainer}>
      <form
        onSubmit={props.handleSubmit(onSubmit)}
        id="tab3"
        className={classes.form}
      >
        {formValues.paymentRequired && (
          <div className={classes.paymentCopy}>
            <Typography component="p" className={classes.body}>
              {duesCopy}
            </Typography>
          </div>
        )}
        {formValues.employerType &&
          formValues.employerType.toLowerCase() === "retired" && (
            <Field
              data-test="radio-payment-type"
              label="How would you like to pay your union dues?"
              name="paymentType"
              formControlName="paymentType"
              id="paymentType"
              direction="horiz"
              className={classes.horizRadio}
              classes={classes}
              component={formElements.renderRadioGroup}
              options={formElements.paymentTypes}
            />
          )}
        {formValues.paymentRequired &&
          formValues.paymentType === "Card" &&
          validMethod && (
            <div data-test="component-choose-card">
              <Typography component="p" className={classes.body}>
                Your existing payment method on file is the card ending in{" "}
                {payment.activeMethodLast4}.
              </Typography>
              <Field
                data-test="radio-which-card"
                label="Do you want to use the existing card or add a new one?"
                name="whichCard"
                formControlName="whichCard"
                id="whichCard"
                direction="horiz"
                className={classes.horizRadio}
                legendClass={classes.horizRadioBold}
                classes={classes}
                defaultItem="Use existing"
                additionalOnChange={toggleCardAddingFrame}
                component={formElements.renderRadioGroup}
                options={["Use existing", "Add new card"]}
              />
            </div>
          )}
        {iFrameURL &&
          formValues.paymentType === "Card" &&
          formValues.newCardNeeded &&
          formValues.paymentRequired && (
            <div data-test="component-iframe">
              <Typography component="h2" className={classes.head}>
                Add a payment method
              </Typography>
              <div className={classes.iframeWrap}>
                <Iframe
                  url={iFrameURL}
                  width="100%"
                  height="100px"
                  id="iFrame"
                  className={classes.iframe}
                  display="initial"
                  position="relative"
                />
              </div>
            </div>
          )}
        {formValues.paymentType === "Check" && (
          <div className={classes.paymentCopy}>
            <Typography component="h2" className={classes.head}>
              To pay your dues by check:
            </Typography>
            <Typography component="p" className={classes.body}>
              Please mail your payment of $5 (monthly) or $60 (annually) to SEIU
              Local 503, PO Box 12159, Salem, OR 97309. Please write 'Retiree
              Dues' on your check. Dues are set by the SEIU Local 503 bylaws.
            </Typography>
          </div>
        )}
        <div className={classes.buttonWrapTab3}>
          <Button
            type="button"
            data-test="button-back"
            onClick={() => back(1)}
            color="primary"
            className={classes.back}
            variant="contained"
          >
            Back
          </Button>
        </div>

        <ButtonWithSpinner
          type="submit"
          color="secondary"
          className={classes.formButton}
          variant="contained"
          loading={loading}
          disabled={invalid}
        >
          Submit
        </ButtonWithSpinner>
      </form>
    </div>
  );
};

Tab3.propTypes = {
  onSubmit: PropTypes.func,
  classes: PropTypes.object,
  reCaptchaChange: PropTypes.func,
  reCaptchaRef: PropTypes.object,
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
export const Tab3Form = reduxForm({
  form: "submissionPage1",
  validate,
  destroyOnUnmount: false,
  forceUnregisterOnUnmount: true, // <------ unregister fields on unmount
  enableReinitialize: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  onSubmitFail: errors => scrollToFirstError(errors)
})(Tab3);

// connect to redux store
export const Tab3Connected = connect(mapStateToProps)(Tab3Form);

export default Tab3Connected;
