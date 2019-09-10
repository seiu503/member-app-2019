import React from "react";
import { Field, reduxForm, getFormValues } from "redux-form";
import { connect } from "react-redux";
import Iframe from "react-iframe";
import PropTypes from "prop-types";

import ButtonWithSpinner from "./ButtonWithSpinner";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

import { validate } from "../utils/validators";
import { onSubmitFailFn, isPaymentRequired } from "../utils";
import CAPEForm from "./CAPE";
import * as formElements from "./SubmissionFormElements";

export const Tab3 = props => {
  const {
    onSubmit,
    classes,
    loading,
    iFrameURL,
    afhDuesRate,
    back,
    formValues,
    formPage1,
    payment,
    toggleCardAddingFrame,
    handleCAPESubmit
  } = props;
  // console.log(isPaymentRequired(formValues.employerType));
  let duesCopy = "";
  // console.log(formPage1.paymentType);
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
    <React.Fragment>
      {isPaymentRequired(formValues.employerType) ? (
        <div data-test="component-tab3" className={classes.sectionContainer}>
          <form
            onSubmit={props.handleSubmit(onSubmit)}
            id="tab3"
            className={classes.form}
          >
            {formPage1.paymentRequired && (
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
            {formPage1.paymentRequired &&
              formPage1.paymentType === "Card" &&
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
              formPage1.paymentType === "Card" &&
              formPage1.newCardNeeded &&
              formPage1.paymentRequired && (
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
            {formPage1.paymentType === "Check" && (
              <div className={classes.paymentCopy}>
                <Typography component="h2" className={classes.head}>
                  To pay your dues by check:
                </Typography>
                <Typography component="p" className={classes.body}>
                  Please mail your payment of $5 (monthly) or $60 (annually) to
                  SEIU Local 503, PO Box 12159, Salem, OR 97309. Please write
                  'Retiree Dues' on your check. Dues are set by the SEIU Local
                  503 bylaws.
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
              color="primary"
              className={classes.formButton}
              variant="contained"
              loading={loading}
            >
              Submit
            </ButtonWithSpinner>
          </form>
        </div>
      ) : (
        <CAPEForm {...props} onSubmit={handleCAPESubmit} />
      )}
    </React.Fragment>
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
  forceUnregisterOnUnmount: false,
  enableReinitialize: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  onSubmitFail: onSubmitFailFn
})(Tab3);

// connect to redux store
export const Tab3Connected = connect(mapStateToProps)(Tab3Form);

export default Tab3Connected;
