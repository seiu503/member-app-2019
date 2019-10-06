import React from "react";
import PropTypes from "prop-types";
import BASE_URL from "../store/actions/apiConfig";
import Button from "@material-ui/core/Button";

const NoAccess = props => (
  <div className={props.classes.message} data-test="component-no-access">
    <p>
      You do not have permission to access to the page you were trying to reach.
      Please log in or contact an admin to request access.
      <br />
    </p>
    <div className={props.classes.buttonWrap}>
      <Button
        type="button"
        color="primary"
        className={props.classes.next}
        variant="contained"
        href={`${BASE_URL}/api/auth/google`}
        onClick={props.setRedirect}
      >
        Log in
      </Button>
    </div>
  </div>
);

NoAccess.propTypes = {
  classes: PropTypes.object
};

export default NoAccess;
