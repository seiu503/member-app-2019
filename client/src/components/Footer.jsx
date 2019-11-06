import React from "react";
import PropTypes from "prop-types";

const Footer = props => (
  <div className={props.classes.footer} data-test="component-footer">
    <a
      href="https://seiu503.tfaforms.net/490"
      rel="noopener noreferrer"
      target="_blank"
      style={{ color: "white" }}
    >
      Report a problem with this form
    </a>
  </div>
);

Footer.propTypes = {
  classes: PropTypes.object
};

export default Footer;
