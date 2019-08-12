import React from "react";
import { reduxForm } from "redux-form";
import ReCAPTCHA from "react-google-recaptcha";

import ButtonWithSpinner from "./ButtonWithSpinner";

import PropTypes from "prop-types";

import validate from "../utils/validators";

export const Tab3 = props => {
  const {
    handleSubmit,
    classes,
    reCaptchaChange,
    reCaptchaRef,
    loading,
    pristine,
    invalid
  } = props;
  return (
    <div data-test="component-tab3" className={classes.sectionContainer}>
      <form onSubmit={handleSubmit} id="tab3" className={classes.form}>
        <h3>Here's where the payment processing stuff will go...</h3>
        <ReCAPTCHA
          ref={reCaptchaRef}
          sitekey="6Ld89LEUAAAAAI3_S2GBHXTJGaW-sr8iAeQq0lPY"
          onChange={reCaptchaChange}
        />

        <ButtonWithSpinner
          type="submit"
          color="secondary"
          className={classes.formButton}
          variant="contained"
          loading={loading}
          disabled={pristine || invalid}
        >
          Submit
        </ButtonWithSpinner>
      </form>
    </div>
  );
};

Tab3.propTypes = {
  handleSubmit: PropTypes.func,
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
  enableReinitialize: true
})(Tab3);

export default Tab3Form;
