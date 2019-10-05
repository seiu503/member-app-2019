import React from "react";
import PropTypes from "prop-types";
import BASE_URL from "../store/actions/apiConfig";

const NoAccess = props => (
  <div className={props.classes.message} data-test="component-no-access">
    <p>
      You do not have permission to access to the page you were trying to reach.
      Please&nbsp;
      <a href={`${BASE_URL}/api/auth/google`}>click here to log in</a> or
      contact an admin to request access.
      <br />
    </p>
  </div>
);

NoAccess.propTypes = {
  classes: PropTypes.object
};

export default NoAccess;
