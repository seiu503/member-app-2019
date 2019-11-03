import React from "react";
import PropTypes from "prop-types";
import Button from "@material-ui/core/Button";
const BASE_URL = process.env.REACT_APP_BASE_URL;

export class Login extends React.Component {
  componentDidMount() {
    window.location.assign(`${BASE_URL}/api/auth/google`);
  }

  render() {
    return (
      <div
        className={this.props.classes.fullWidthContainer}
        data-test="component-login"
      >
        <div className={this.props.classes.buttonWrap}>
          <Button
            type="button"
            color="primary"
            className={this.props.classes.next}
            variant="contained"
            href={`${BASE_URL}/api/auth/google`}
          >
            Log in
          </Button>
        </div>
      </div>
    );
  }
}

Login.propTypes = {
  classes: PropTypes.object
};

export default Login;
