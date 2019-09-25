import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import CreateUser from "../components/CreateUser";
import EditUser from "../components/EditUser";

import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import { withStyles } from "@material-ui/core/styles";

const styles = theme => ({
  root: {
    margin: 20,
    padding: 20,
    maxWidth: 1200
  },
  card: {
    margin: "auto",
    width: "100%",
    maxWidth: 300
  },
  media: {
    height: 0,
    paddingTop: "56.25%", // 16:9
    position: "relative"
  },
  avatar: {
    width: 80,
    height: 80,
    position: "absolute",
    top: 100,
    left: "calc(50% - 40px)"
  },
  container: {
    height: "100%",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center"
  },
  name: {
    color: "primary",
    textAlign: "center",
    marginTop: 15
  }
});

export class UserFormUnconnected extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      edit: "createUser"
    };
    this.submit = this.submit.bind(this);
  }

  componentDidMount() {
    //check for userType status here
  }
  handleChange(e) {
    this.setState({ edit: e.target.value });
  }

  render() {
    const { classes } = this.props;
    const { loggedIn } = this.props.appState;
    const redirect = window.localStorage.getItem("redirect");

    return (
      <div className={classes.container} data-test="user-form-container">
        <FormControl component="fieldset" className={classes.formControl}>
          <FormLabel component="legend" className={classes.radioLabel}>
            Create or Edit User
          </FormLabel>
          <RadioGroup
            aria-label="User Action"
            name="user_action"
            className={classes.group}
            value={this.state.edit}
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
              label="Edit User"
            />
          </RadioGroup>
        </FormControl>
        {loggedIn && !redirect && this.state.edit === "createUser" && (
          <CreateUser />
        )}
        {loggedIn && !redirect && this.state.edit === "editUser" && (
          <EditUser />
        )}
      </div>
    );
  }
}

UserFormUnconnected.propTypes = {
  user: PropTypes.shape({
    form: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      email: PropTypes.string,
      userType: PromiseRejectionEvent.string
    }),
    loading: PropTypes.bool
  }).isRequired,
  apiUser: PropTypes.shape({
    handleInput: PropTypes.func,
    clearForm: PropTypes.func
  }),
  classes: PropTypes.object
};

const mapStateToProps = state => ({
  appState: state.appState
});

export const UserFormConnected = connect(mapStateToProps)(UserFormUnconnected);

export default withStyles(styles)(UserFormConnected);
