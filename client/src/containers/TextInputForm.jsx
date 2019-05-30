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

import * as apiFormMetaActions from "../store/actions/apiFormMetaActions";

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

class TextInputForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      formMetaType: null
    };
  }

  handleInput = e => {
    const newState = this.state;
    newState.formMetaType = e.target.value;
    this.setState(newState);
  };

  componentDidMount() {}

  submit = () => {
    const {
      headline,
      bodyCopy,
      imageUrl,
      redirectUrl
    } = this.props.formMeta.form;
    const { formMetaType } = this.state;
    const body = {
      formMetaType,
      headline,
      bodyCopy,
      imageUrl,
      redirectUrl
    };
    this.props.apiFormMeta
      .addFormMeta(body)
      .then(result => {
        console.log(result.type);
        if (
          result.type === "ADD_FORM_META_FAILURE" ||
          this.props.formMeta.error
        ) {
          openSnackbar(
            "error",
            this.props.contact.error ||
              "An error occured while trying to save your formMeta."
          );
        } else {
          openSnackbar("success", "FormMeta Saved.");
          this.props.apiFormMeta.clearForm();
        }
      })
      .catch(err => openSnackbar("error", err));
  };

  render() {
    const { classes } = this.props;
    const { formMetaType } = this.state;
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
        <form className={classes.form} onError={errors => console.log(errors)}>
          <FormControl component="fieldset" className={classes.formControl}>
            <FormLabel component="legend">Form Meta Type</FormLabel>
            <RadioGroup
              aria-label="FormMeta Type"
              name="formMetaType"
              className={classes.group}
              value={this.state.formMetaType}
              onChange={this.handleInput}
            >
              <FormControlLabel
                value="headline"
                control={<Radio />}
                label="Headline"
              />
              <FormControlLabel value="body" control={<Radio />} label="Body" />
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

          {formMetaType === "headline" ? (
            <TextField
              name="headline"
              id="headline"
              label="Headline"
              type="text"
              variant="outlined"
              required
              value={this.props.formMeta.form.headline}
              onChange={this.props.apiFormMeta.handleInput}
              className={classes.input}
            />
          ) : formMetaType === "body" ? (
            <TextField
              name="bodyCopy"
              id="bodyCopy"
              label="Body Copy"
              multiline
              rows="5"
              variant="outlined"
              required
              value={this.props.formMeta.form.bodyCopy}
              onChange={this.props.apiFormMeta.handleInput}
              className={classes.textarea}
            />
          ) : formMetaType === "image" ? (
            <TextField
              name="imageUrl"
              id="imageUrl"
              label="Image URL"
              type="text"
              variant="outlined"
              required
              value={this.props.formMeta.form.imageUrl}
              onChange={this.props.apiFormMeta.handleInput}
              className={classes.input}
            />
          ) : formMetaType === "redirectUrl" ? (
            <TextField
              name="redirectUrl"
              id="redirectUrl"
              label="Redirect URL"
              type="text"
              variant="outlined"
              required
              value={this.props.formMeta.form.redirectUrl}
              onChange={this.props.apiFormMeta.handleInput}
              className={classes.input}
            />
          ) : (
            ""
          )}
          <ButtonWithSpinner
            type="button"
            color="secondary"
            className={classes.formButton}
            variant="contained"
            onClick={() => this.submit()}
            loading={this.props.formMeta.loading}
          >
            Save FormMeta
          </ButtonWithSpinner>
        </form>
      </div>
    );
  }
}

TextInputForm.propTypes = {
  type: PropTypes.string,
  formMeta: PropTypes.shape({
    form: PropTypes.shape({
      headline: PropTypes.string,
      bodyCopy: PropTypes.string,
      imageUrl: PropTypes.string
    }),
    loading: PropTypes.bool
  }).isRequired,
  apiFormMeta: PropTypes.shape({
    handleInput: PropTypes.func,
    addFormMeta: PropTypes.func,
    clearForm: PropTypes.func
  }),
  classes: PropTypes.object
};

const mapStateToProps = state => ({
  formMeta: state.formMeta
});

const mapDispatchToProps = dispatch => ({
  apiFormMeta: bindActionCreators(apiFormMetaActions, dispatch)
});

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(TextInputForm)
);
