import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import { DropzoneDialog } from "material-ui-dropzone";

import * as apiContentActions from "../store/actions/apiContentActions";

import { openSnackbar } from "./Notifier";
import ButtonWithSpinner from "../components/ButtonWithSpinner";

const styles = theme => ({
  root: {},
  container: {
    padding: "80px 0 140px 0"
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
    flexDirection: "row"
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
  }
});

const labelsObj = {
  headline: "Headline",
  bodyCopy: "Body Copy",
  imageUrl: "Image URL",
  redirectUrl: "Redirect Url"
};

class TextInputForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      files: []
    };
  }

  componentDidMount() {}

  handleClose = () => {
    const newState = { ...this.state };
    newState.open = false;
    this.setState({ ...newState }, () => {
      this.props.apiContent.clearForm();
    });
  };

  handleSave = files => {
    // save files to component state; close modal
    const newState = { ...this.state };
    newState.open = false;
    newState.files = files;
    this.setState({ ...newState }, () => {
      this.handleUpload(this.state.files[0]);
    });
  };

  handleOpen = () => {
    const newState = { ...this.state };
    newState.open = true;
    this.setState({ ...newState });
  };

  handleChange = files => {
    const newState = { ...this.state };
    newState.files = files;
    this.setState({ ...newState });
  };

  handleUpload = file => {
    const { authToken } = this.props.appState;
    const filename = file ? file.name.split(".")[0] : "";
    this.props.apiContent
      .uploadImage(authToken, file)
      .then(result => {
        if (
          result.type === "UPLOAD_IMAGE_FAILURE" ||
          this.props.content.error
        ) {
          openSnackbar(
            "error",
            this.props.content.error ||
              "An error occured while trying to upload your image."
          );
        } else {
          openSnackbar("success", `${filename} Saved.`);
          this.props.apiContent.clearForm();
        }
      })
      .catch(err => openSnackbar("error", err));
  };

  submit = e => {
    e.preventDefault();
    e.target.reset();
    const { contentType, content } = this.props.content.form;
    const { authToken } = this.props.appState;
    const body = {
      contentType,
      content
    };
    this.props.apiContent
      .addContent(authToken, body)
      .then(result => {
        if (result.type === "ADD_CONTENT_FAILURE" || this.props.content.error) {
          openSnackbar(
            "error",
            this.props.content.error ||
              "An error occured while trying to save your content."
          );
        } else {
          openSnackbar("success", `${labelsObj[contentType]} Saved.`);
          this.props.apiContent.clearForm();
        }
      })
      .catch(err => openSnackbar("error", err));
  };

  render() {
    const { classes } = this.props;
    const { contentType } = this.props.content.form;
    return (
      <div className={classes.container}>
        <Typography
          variant="h2"
          align="center"
          gutterBottom
          className={classes.head}
          style={{ paddingTop: 20 }}
        >
          Admin Dashboard
        </Typography>
        <form
          className={classes.form}
          onError={errors => console.log(errors)}
          onSubmit={this.submit}
          id="form"
        >
          <FormControl component="fieldset" className={classes.formControl}>
            <FormLabel component="legend">Content Type</FormLabel>
            <RadioGroup
              aria-label="Content Type"
              name="contentType"
              className={classes.group}
              value={this.props.content.form.contentType}
              onChange={this.props.apiContent.handleInput}
            >
              <FormControlLabel
                value="headline"
                control={<Radio />}
                label="Headline"
              />
              <FormControlLabel
                value="bodyCopy"
                control={<Radio />}
                label="Body"
              />
              <FormControlLabel
                value="imageUrl"
                control={<Radio />}
                label="Image"
              />
              <FormControlLabel
                value="redirectUrl"
                control={<Radio />}
                label="Redirect URL"
              />
            </RadioGroup>
          </FormControl>
          {contentType !== "imageUrl" ? (
            <React.Fragment>
              <TextField
                name="content"
                id="content"
                label={labelsObj[contentType]}
                type={
                  contentType && contentType.includes("Url") ? "url" : "text"
                }
                multiline={contentType === "bodyCopy"}
                rows={contentType === "bodyCopy" ? 5 : 1}
                variant="outlined"
                required
                value={this.props.content.form.content}
                onChange={this.props.apiContent.handleInput}
                className={classes.input}
              />
              <ButtonWithSpinner
                type="submit"
                color="secondary"
                className={classes.formButton}
                variant="contained"
                loading={this.props.content.loading}
              >
                Save {labelsObj[contentType]}
              </ButtonWithSpinner>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <ButtonWithSpinner
                onClick={this.handleOpen.bind(this)}
                variant="contained"
                color="secondary"
                component="label"
                className={classes.formButton}
                loading={this.props.content.loading}
              >
                Choose Image
              </ButtonWithSpinner>
              <DropzoneDialog
                open={this.state.open}
                onSave={this.handleSave}
                acceptedFiles={[
                  "image/jpeg",
                  "image/jpg",
                  "image/png",
                  "image/gif"
                ]}
                showPreviews={true}
                maxFileSize={2000000}
                filesLimit={1} // until add server support for multiupload
                onClose={this.handleClose}
              />
            </React.Fragment>
          )}
        </form>
      </div>
    );
  }
}

TextInputForm.propTypes = {
  type: PropTypes.string,
  appState: PropTypes.shape({
    authToken: PropTypes.string
  }),
  content: PropTypes.shape({
    form: PropTypes.shape({
      contentType: PropTypes.string,
      content: PropTypes.string
    }),
    loading: PropTypes.bool
  }).isRequired,
  apiContent: PropTypes.shape({
    handleInput: PropTypes.func,
    addContent: PropTypes.func,
    clearForm: PropTypes.func,
    uploadImage: PropTypes.func
  }),
  classes: PropTypes.object
};

const mapStateToProps = state => ({
  content: state.content,
  appState: state.appState
});

const mapDispatchToProps = dispatch => ({
  apiContent: bindActionCreators(apiContentActions, dispatch)
});

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(TextInputForm)
);
