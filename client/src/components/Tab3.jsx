import React from "react";
import { Field, reduxForm } from "redux-form";
import ReCAPTCHA from "react-google-recaptcha";
import Iframe from "react-iframe";

import ButtonWithSpinner from "./ButtonWithSpinner";
import Button from "@material-ui/core/Button";
import * as formElements from "./SubmissionFormElements";

import PropTypes from "prop-types";

import validate from "../utils/validators";

export const Tab3 = props => {
  const {
    onSubmit,
    classes,
    reCaptchaChange,
    reCaptchaRef,
    loading,
    invalid,
    iFrameURL,
    back,
    formValues
  } = props;
  console.log(formValues);
  console.log(formValues.paymentType);
  return (
    <div data-test="component-tab3" className={classes.sectionContainer}>
      <form
        onSubmit={props.handleSubmit(onSubmit)}
        id="tab3"
        className={classes.form}
      >
        {formValues.employerName.toLowerCase() === "retirees" && (
          <Field
            // labelWidth={104}
            label="How would you like to pay your union dues?"
            name="paymentType"
            id="paymentType"
            type="radio"
            classes={classes}
            component={formElements.renderRadioGroup}
            options={formElements.paymentTypes}
          />
        )}
        {iFrameURL && formValues.paymentType !== "Check" && (
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
        )}

        <ReCAPTCHA
          ref={reCaptchaRef}
          sitekey="6Ld89LEUAAAAAI3_S2GBHXTJGaW-sr8iAeQq0lPY"
          onChange={reCaptchaChange}
        />
        <div className={classes.buttonWrapTab3}>
          <Button
            type="button"
            data-test="button-back"
            onClick={e => back(e, 1)}
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

// add reduxForm to component
export const Tab3Form = reduxForm({
  form: "submissionPage1",
  validate,
  destroyOnUnmount: false,
  forceUnregisterOnUnmount: true, // <------ unregister fields on unmount
  enableReinitialize: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true
})(Tab3);

export default Tab3Form;