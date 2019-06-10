import React from "react";
import PropTypes from "prop-types";

const Footer = props => (
  <div className={props.classes.footer} data-test="component-footer">
    SEIU Local 503
  </div>
);

Footer.propTypes = {
  classes: PropTypes.object
};

export default Footer;
