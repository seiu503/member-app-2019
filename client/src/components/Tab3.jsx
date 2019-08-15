import React from "react";
import { reduxForm } from "redux-form";
import ReCAPTCHA from "react-google-recaptcha";
import Iframe from "react-iframe";

import ButtonWithSpinner from "./ButtonWithSpinner";

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
    iFrameURL
  } = props;
  return (
    <div data-test="component-tab3" className={classes.sectionContainer}>
      <form
        onSubmit={props.handleSubmit(onSubmit)}
        id="tab3"
        className={classes.form}
      >
        {iFrameURL && (
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
