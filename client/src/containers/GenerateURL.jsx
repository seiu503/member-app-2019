import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import FAB from "@material-ui/core/Fab";
import Tooltip from "@material-ui/core/Tooltip";
import FileCopy from "@material-ui/icons/FileCopy";

import * as utils from "../utils";

const CLIENT_URL = process.env.REACT_APP_CLIENT_URL;

const styles = theme => ({
  root: {},
  bannerStrip: {
    padding: "80px 0 0 0",
    background: "white"
  },
  head: {
    color: theme.palette.primary.light
  },
  form: {
    maxWidth: 600,
    margin: "auto",
    display: "flex",
    justifyContent: "center"
  },
  input: {
    width: "100%",
    margin: "0 0 20px 0"
  },
  buttonCopy: {
    marginLeft: 20,
    width: 64
  }
});

export class GenerateURLUnconnected extends React.Component {
  constructor(props) {
    super(props);
    this.input = React.createRef();
  }

  componentDidMount() {}

  copyToClipboard = e => {
    this.input.current.select();
    document.execCommand("copy");
    e.target.focus();
  };

  render() {
    const { classes } = this.props;
    const query = utils.buildQuery(this.props.content.selectedContent);
    const url = query.length ? `${CLIENT_URL}?${query}` : CLIENT_URL;
    return (
      <div className={classes.bannerStrip} data-test="component-generate-url">
        <div className={classes.form}>
          <TextField
            inputRef={this.input}
            name="url"
            id="url"
            label="Generated URL"
            type="url"
            variant="outlined"
            value={url}
            className={classes.input}
          />
          {document.queryCommandSupported("copy") && (
            <Tooltip title="Copy to clipboard" aria-label="Copy to clipboard">
              <FAB
                className={classes.buttonCopy}
                onClick={this.copyToClipboard}
                color="primary"
                aria-label="Copy to clipboard"
                data-test="button-copy"
              >
                <FileCopy />
              </FAB>
            </Tooltip>
          )}
        </div>
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
