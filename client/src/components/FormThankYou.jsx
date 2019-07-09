import React from "react";
import PropTypes from "prop-types";

const ThankYou = props => (
  <div className={props.classes.message} data-test="component-thankyou">
    <p>
      Your information has been submitted.
      <br />
      Thank You!
    </p>
    <a href="https://www.seiu503.org">Click Here to visit SEIU503.org</a>
  </div>
);

ThankYou.propTypes = {
  classes: PropTypes.object
};

export default ThankYou;
