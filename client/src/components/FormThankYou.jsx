import React from "react";
import PropTypes from "prop-types";
import { Translate } from "react-localize-redux";

const FormThankYou = props => (
  <div className={props.classes.message} data-test="component-thankyou">
    <p>
      Your information has been submitted.
      <br />
      <Translate id="thankYou" />
    </p>
    <a href="https://www.seiu503.org">Click Here to visit SEIU503.org</a>
  </div>
);

FormThankYou.propTypes = {
  classes: PropTypes.object
};

export default FormThankYou;
