import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import * as Actions from "../store/actions";

import { Typography } from "@mui/material";

export class Logout extends React.Component {
  componentDidMount() {
    this.props.actions.logout();
    window.localStorage.clear();
    setTimeout(() => {
      window.location.assign("/");
    }, 1000);
  }

  render() {
    return (
      <div
        className={this.props.classes.fullWidthContainer}
        data-testid="component-logout"
      >
        <Typography
          variant="h5"
          className={this.props.classes.message}
          data-testid="message"
        >
          Goodbye!
        </Typography>
      </div>
    );
  }
}

Logout.propTypes = {
  actions: PropTypes.shape({
    logout: PropTypes.func
  }).isRequired,
  classes: PropTypes.object
};

export const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(Actions, dispatch)
});

export default connect(null, mapDispatchToProps)(Logout);
