import React from "react";
import PropTypes from "prop-types";
import { Translate } from "react-localize-redux";
import BASE_URL from "../store/actions/apiConfig";

const NoAccess = props => (
  <div className={props.classes.message} data-test="component-thankyou">
    <p>
      You do not have access to the page you were trying to reach. Please{" "}
      <a href={`${BASE_URL}/api/auth/google`}>click here to login</a> or contact
      an admin to request access.
      <br />
    </p>
  </div>
);

NoAccess.propTypes = {
  classes: PropTypes.object
};

export default NoAccess;
