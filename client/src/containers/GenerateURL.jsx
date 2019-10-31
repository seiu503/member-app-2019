import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";

import ButtonWithSpinner from "../components/ButtonWithSpinner";
import * as utils from "../utils";

const BASE_URL = process.env.REACT_APP_BASE_URL;

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
  formButton: {
    width: "100%",
    padding: 20
  }
});

export class GenerateURLUnconnected extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

  render() {
    const { classes } = this.props;
    const query = utils.buildQuery(this.props.content.selectedContent);
    const url = `${BASE_URL}?${query}`;
    return (
      <div className={classes.container} data-test="component-generate-url">
        <Typography
          variant="h2"
          align="center"
          gutterBottom
          className={classes.head}
          style={{ paddingTop: 20 }}
        >
          Generate URL
        </Typography>
        <TextField
          name="url"
          id="url"
          label="Generated URL"
          type="url"
          variant="outlined"
          value={url}
          className={classes.input}
        />
      </div>
    );
  }
}

GenerateURLUnconnected.propTypes = {
  content: PropTypes.shape({
    loading: PropTypes.bool
  }).isRequired,
  classes: PropTypes.object
};

const mapStateToProps = state => ({
  content: state.content
});

export const GenerateURLConnected = connect(mapStateToProps)(
  GenerateURLUnconnected
);

export default withStyles(styles)(GenerateURLConnected);
