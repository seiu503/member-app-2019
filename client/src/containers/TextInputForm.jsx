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
import * as utils from "../utils";

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

export class TextInputFormUnconnected extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      files: []
    };
  }

  componentDidMount() {
    if (this.props.edit && this.props.match.params.id) {
      this.props.apiContent
        .getContentById(this.props.match.params.id)
        .then(result => {
          console.log(result.type);
          if (
            result.type === "GET_CONTENT_BY_ID_FAILURE" ||
            this.props.content.error
          ) {
            openSnackbar(
              "error",
              this.props.content.error ||
                "An error occured while trying to fetch your content."
            );
          } else {
            // console.log(this.props.content.form)
          }
        })
        .catch(err => openSnackbar("error", err));
    }
  }

  handleClose = () => {
    const newState = { ...this.state };
    newState.open = false;
    this.setState({ ...newState }, () => {
      this.props.apiContent.clearForm();
      this.props.history.push("/library");
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

  onDropRejected = rejected => {
    let errors = [];
    if (rejected[0].size > 2000000) {
      errors.push("File too large. File size limit 2MB.");
    }
    if (
      rejected[0].type !== "image/jpeg" &&
      rejected[0].type !== "image/jpg" &&
      rejected[0].type !== "image/png" &&
      rejected[0].type !== "image/gif"
    ) {
      errors.push(
        "Invalid file type. Accepted file types are .jpeg, .jpg, .png, and .gif."
      );
    }
    // display errors
    if (errors.length) {
      openSnackbar("error", errors.join(" "));
    }
  };

  handleUpload = file => {
    const { authToken } = this.props.appState;
    const filename = file ? file.name.split(".")[0] : "";
    const edit = this.props.edit;
    const id = this.props.edit ? this.props.match.params.id : undefined;
    this.props.apiContent
      .uploadImage(authToken, file, edit, id)
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
          this.props.apiContent.getAllContent(authToken);
          this.props.history.push("/library");
        }
      })
      .catch(err => openSnackbar("error", err));
  };

  submit = e => {
    // e.preventDefault();
    const { content_type, content } = this.props.content.form;
    const { authToken } = this.props.appState;
    const body = {
      content_type,
      content
    };
    let id;
    if (this.props.match.params.id) {
      id = this.props.match.params.id;
    }
    if (!this.props.edit) {
      this.props.apiContent
        .addContent(authToken, body)
        .then(result => {
          if (
            result.type === "ADD_CONTENT_FAILURE" ||
            this.props.content.error
          ) {
            openSnackbar(
              "error",
              this.props.content.error ||
                "An error occured while trying to save your content."
            );
          } else {
            openSnackbar("success", `Saved ${utils.labelsObj[content_type]}.`);
            this.props.apiContent.clearForm();
            this.props.history.push("/library");
          }
        })
        .catch(err => openSnackbar("error", err));
    } else if (id) {
      this.props.apiContent
        .updateContent(authToken, id, body)
        .then(result => {
          if (
            result.type === "UPDATE_CONTENT_FAILURE" ||
            this.props.content.error
          ) {
            openSnackbar(
              "error",
              this.props.content.error ||
                "An error occured while trying to update your content."
            );
          } else {
            openSnackbar(
              "success",
              `Updated ${utils.labelsObj[content_type]}.`
            );
            this.props.apiContent.clearForm();
            this.props.history.push("/library");
          }
        })
        .catch(err => openSnackbar("error", err));
    } else {
      openSnackbar(
        "error",
        this.props.content.error ||
          "An error occured while trying to save your content."
      );
    }
  };

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.container} data-test="component-text-input-form">
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
          id="form"
        >
          <FormControl component="fieldset" className={classes.formControl}>
            <FormLabel component="legend" className={classes.radioLabel}>
              Content Type
            </FormLabel>
            <RadioGroup
              aria-label="Content Type"
              name="content_type"
              className={classes.group}
              value={this.props.content.form.content_type}
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
                value="image"
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
          {this.props.content.form.content_type &&
          this.props.content.form.content_type !== "image" ? (
            <React.Fragment>
              <TextField
                name="content"
                id="content"
                label={utils.labelsObj[this.props.content.form.content_type]}
                type={
                  this.props.content.form.content_type &&
                  this.props.content.form.content_type.includes("Url")
                    ? "url"
                    : "text"
                }
                multiline={this.props.content.form.content_type === "bodyCopy"}
                rows={
                  this.props.content.form.content_type === "bodyCopy" ? 5 : 1
                }
                variant="outlined"
                required
                value={this.props.content.form.content}
                onChange={this.props.apiContent.handleInput}
                className={classes.input}
              />
              <ButtonWithSpinner
                type="button"
                color="secondary"
                className={classes.formButton}
                variant="contained"
                loading={this.props.content.loading}
                onClick={this.submit}
              >
                Save {utils.labelsObj[this.props.content.form.content_type]}
              </ButtonWithSpinner>
            </React.Fragment>
          ) : this.props.content.form.content_type &&
            this.props.content.form.content_type === "image" ? (
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
                onDropRejected={this.onDropRejected}
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
          ) : (
            ""
          )}
        </form>
      </div>
    );
  }
}

TextInputFormUnconnected.propTypes = {
  type: PropTypes.string,
  appState: PropTypes.shape({
    authToken: PropTypes.string
  }),
  content: PropTypes.shape({
    form: PropTypes.shape({
      content_type: PropTypes.string,
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

export const TextInputFormConnected = connect(
  mapStateToProps,
  mapDispatchToProps
)(TextInputFormUnconnected);

export default withStyles(styles)(TextInputFormConnected);
