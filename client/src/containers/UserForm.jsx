import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
// import { Redirect } from "react-router-dom";

import CreateUser from "../components/CreateUser";
import EditUser from "../components/EditUser";

import { withStyles } from "@mui/styles";
import {
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel
} from "@mui/material";

const styles = theme => ({
  root: {},
  container: {
    padding: "80px 0 140px 0",
    background: "white",
    minHeight: "100vh"
  },
  head: {
    color: theme.palette.primary.light
  },
  form: {
    maxWidth: 600,
    margin: "auto"
  },
  group: {
    display: "flex",
    width: "100%",
    flexDirection: "row",
    justifyContent: "center"
  },
  input: {
    width: "100%",
    margin: "0 0 20px 0"
  },
  textarea: {
    width: "100%",
    margin: "0 0 20px 0"
  },
  formButton: {
    width: "100%",
    padding: 20
  },
  formControl: {
    width: "100%"
  },
  radioLabel: {
    width: "100%",
    textAlign: "center"
  }
});

export class UserFormUnconnected extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      form: "createUser"
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    this.setState({ form: e.target.value });
  }

  render() {
    const { classes } = this.props;
    const { loggedIn } = this.props.appState;
    return (
      <div className={classes.container} data-testid="user-form-container">
        {loggedIn && (
          <form>
            <FormControl
              component="fieldset"
              className={classes.formControl}
              variant="standard"
            >
              <FormLabel component="legend" className={classes.radioLabel}>
                Create or Edit User
              </FormLabel>
              <RadioGroup
                aria-label="User Action"
                name="user_action"
                className={classes.group}
                value={this.state.form}
                onChange={this.handleChange}
              >
                <FormControlLabel
                  value="createUser"
                  control={<Radio />}
                  label="Create User"
                />
                <FormControlLabel
                  value="editUser"
                  control={<Radio />}
                  label="Edit/Delete User"
                />
              </RadioGroup>
            </FormControl>
          </form>
        )}
        {loggedIn && this.state.form === "createUser" && (
          <CreateUser history={this.props.history} />
        )}
        {loggedIn && this.state.form === "editUser" && (
          <EditUser history={this.props.history} />
        )}
      </div>
    );
  }
}

UserFormUnconnected.propTypes = {
  appState: PropTypes.shape({
    loggedIn: PropTypes.bool,
    authToken: PropTypes.string,
    loading: PropTypes.bool
  }).isRequired,
  classes: PropTypes.object
};

const mapStateToProps = state => ({
  appState: state.appState,
  localize: state.localize
});

export const UserFormConnected = connect(mapStateToProps)(UserFormUnconnected);

export default withStyles(styles)(UserFormConnected);
