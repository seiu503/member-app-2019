import React from "react";
import PropTypes from "prop-types";
import Button from "@material-ui/core/Button";
import queryString from "query-string";
const BASE_URL = process.env.REACT_APP_BASE_URL;

export class NoAccess extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      message:
        "You do not have permission to access this content. Please log in or contact an admin to request access."
    };
  }
  componentDidMount() {
    const params = queryString.parse(this.props.location.search);
    if (params.message) {
      this.setState({
        message: decodeURIComponent(params.message)
      });
    }
  }
  render() {
    return (
      <div
        className={this.props.classes.message}
        data-test="component-no-access"
      >
        <p>
          {this.state.message}
          <br />
        </p>
        <div className={this.props.classes.buttonWrap}>
          <Button
            type="button"
            color="primary"
            className={this.props.classes.next}
            variant="contained"
            href={`${BASE_URL}/api/auth/google`}
            onClick={this.props.setRedirect}
          >
            Log in
          </Button>
        </div>
      </div>
    );
  }
}

NoAccess.propTypes = {
  classes: PropTypes.object
};

export default NoAccess;
