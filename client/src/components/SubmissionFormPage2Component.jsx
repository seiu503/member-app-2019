import React from "react";
import { Field } from "redux-form";
import uuid from "uuid";
import PropTypes from "prop-types";

import * as formElements from "./SubmissionFormElements";
import * as utils from "../utils/index";
import { openSnackbar } from "../containers/Notifier";
import ButtonWithSpinner from "./ButtonWithSpinner";
import WelcomeInfo from "./WelcomeInfo";

// helper functions these MAY NEED TO BE UPDATED with localization package
// *********  POPULATE ME  ********* //

class SubmissionFormPage2Component extends React.Component {
  classes = this.props.classes;
  constructor(props) {
    super(props);
    this.state = {};
  }

  // reusable MUI form components
  renderTextField = formElements.renderTextField;
  renderSelect = formElements.renderSelect;
  renderCheckbox = formElements.renderCheckbox;

  handleSubmit = values => {
    const {
      // *********  POPULATE ME  ********* //
    } = values;

    const body = {
      // *********  POPULATE ME  ********* //
    };

    return this.props.apiSubmission
      .addSubmission(body)
      .then(result => {
        if (
          result.type === "ADD_SUBMISSION_FAILURE" ||
          this.props.submission.error
        ) {
          openSnackbar(
            "error",
            this.props.submission.error ||
              "An error occurred while trying to submit your information."
          );
        } else {
          openSnackbar("success", "Your Submission was Successful!");
          this.props.apiSubmission.clearForm();
          this.props.reset("submission");
        }
      })
      .catch(err => openSnackbar("error", err));
  };
  render() {
    return (
      <div
        className={this.classes.root}
        data-test="component-submissionformpage2"
      >
        <WelcomeInfo />
        <form
          id="submissionFormPage2"
          onSubmit={this.props.handleSubmit(this.handleSubmit.bind(this))}
          className={this.classes.form}
        >
          {/* *********  POPULATE ME  ********* */}

          <Field
            label="textField"
            name="textField"
            id="textField"
            type="text"
            classes={this.classes}
            component={this.renderTextField}
          />
          {/* *********  POPULATE ME  ********* */}
          <Field
            label="select"
            name="select"
            id="select"
            type="select"
            classes={this.classes}
            formControlName="formControlDate"
            component={this.renderSelect}
            labelWidth={41}
            options={FILLMEIN}
          />
          {/* *********  POPULATE ME  ********* */}
          <Field
            label="checkbox"
            name="checkbox"
            id="checkbox"
            type="checkbox"
            classes={this.classes}
            component={this.renderCheckbox}
          />

          <ButtonWithSpinner
            type="submit"
            color="secondary"
            className={this.classes.formButton}
            variant="contained"
            loading={this.props.submission.loading}
          >
            Submit
          </ButtonWithSpinner>
        </form>
      </div>
    );
  }
}

SubmissionFormPage2Component.propTypes = {
  type: PropTypes.string,
  appState: PropTypes.shape({
    authToken: PropTypes.string
  }),
  submission: PropTypes.shape({
    form: PropTypes.shape({
      textField: PropTypes.string,
      select: PropTypes.string,
      checkbox: PropTypes.bool
    }),
    loading: PropTypes.bool,
    error: PropTypes.string
  }).isRequired,
  classes: PropTypes.object
};

export default SubmissionFormPage2Component;
