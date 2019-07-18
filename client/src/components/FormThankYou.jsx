import React from "react";
import PropTypes from "prop-types";

const FormThankYou = props => (
  <div className={props.classes.message} data-test="component-thankyou">
    <p>
      Your information has been submitted.
      <br />
      Thank You!
    </p>
    <a href="https://www.seiu503.org">Click Here to visit SEIU503.org</a>
  </div>
);

FormThankYou.propTypes = {
  classes: PropTypes.object
};

export default FormThankYou;
