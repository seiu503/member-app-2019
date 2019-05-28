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
      contentType: null
    };
  }

  handleInput = e => {
    const newState = this.state;
    newState.contentType = e.target.value;
    this.setState(newState);
  };

  componentDidMount() {}

  submit = () => {
    const { headline, bodyCopy, image } = this.props.content.form;
    const { contentType } = this.state;
    const body = {
      contentType,
      headline,
      bodyCopy,
      image
    };
    this.props.apiContent
      .addContent(body)
      .then(result => {
        console.log(result.type);
        if (result.type === "ADD_CONTENT_FAILURE" || this.props.content.error) {
          openSnackbar(
            "error",
            this.props.contact.error ||
              "An error occured while trying to save your content."
          );
        } else {
          openSnackbar("success", "Content Saved.");
          this.props.apiContent.clearForm();
        }
      })
      .catch(err => openSnackbar("error", err));
  };

  render() {
    const { classes } = this.props;
    const { contentType } = this.state;
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
            <FormLabel component="legend">Content Type</FormLabel>
            <RadioGroup
              aria-label="Content Type"
              name="contentType"
              className={classes.group}
              value={this.state.contentType}
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
            </RadioGroup>
          </FormControl>

          {contentType === "headline" ? (
            <TextField
              name="headline"
              id="headline"
              label="Headline"
              type="text"
              variant="outlined"
              required
              value={this.props.content.form.headline}
              onChange={this.props.apiContent.handleInput}
              className={classes.input}
            />
          ) : contentType === "body" ? (
            <TextField
              name="bodyCopy"
              id="bodyCopy"
              label="Body Copy"
              multiline
              rows="5"
              variant="outlined"
              required
              value={this.props.content.form.bodyCopy}
              onChange={this.props.apiContent.handleInput}
              className={classes.textarea}
            />
          ) : contentType === "image" ? (
            <TextField
              name="imageUrl"
              id="imageUrl"
              label="Image URL"
              type="text"
              variant="outlined"
              required
              value={this.props.content.form.imageUrl}
              onChange={this.props.apiContent.handleInput}
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
            loading={this.props.content.loading}
          >
            Save Content
          </ButtonWithSpinner>
        </form>
      </div>
    );
  }
}

TextInputForm.propTypes = {
  type: PropTypes.string,
  content: PropTypes.shape({
    form: PropTypes.shape({
      headline: PropTypes.string,
      bodyCopy: PropTypes.string,
      imageUrl: PropTypes.string
    }),
    loading: PropTypes.bool
  }).isRequired,
  apiContent: PropTypes.shape({
    handleInput: PropTypes.func,
    addContent: PropTypes.func,
    clearForm: PropTypes.func
  }),
  classes: PropTypes.object
};

const mapStateToProps = state => ({
  content: state.content
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
