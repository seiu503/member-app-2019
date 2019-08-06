import React from "react";
import { getFormValues } from "redux-form";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import queryString from "query-string";

import { withStyles } from "@material-ui/core/styles";

import SubmissionFormPage1Wrap from "../components/SubmissionFormPage1Component";
import * as apiSubmissionActions from "../store/actions/apiSubmissionActions";
import * as apiSFActions from "../store/actions/apiSFActions";

import { stylesPage1 } from "../components/SubmissionFormElements";
import Modal from "../components/Modal";

export class SubmissionFormPage1Container extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
    this.handleModalOpen = this.handleModalOpen.bind(this);
    this.handleModalClose = this.handleModalClose.bind(this);
  }
  componentDidMount() {
    // check for contact id in query string
    const values = queryString.parse(this.props.location.search);
    // if find contact id, call API to fetch contact info for prefill
    if (values.id) {
      const { id } = values;
      this.props.apiSF
        .getSFContactById(id)
        .then(result => {
          // open warning/confirmation modal if prefill successfully loaded
          if (
            this.props.submission.formPage1.firstName &&
            this.props.submission.formPage1.lastName
          ) {
            this.handleModalOpen();
          }
          // console.log("result.payload", result.payload);
        })
        .catch(err => {
          console.log(err);
        });
    } else {
      // console.log("no id found, no prefill");
      return;
    }
  }

  // componentDidUpdate(prevProps) {
  //   if (prevProps.submission.formPage1.firstName) {

  //   }
  // }

  handleModalOpen() {
    const newState = { ...this.state };
    newState.open = true;
    this.setState({ ...newState });
  }

  handleModalClose() {
    const newState = { ...this.state };
    newState.open = false;
    this.setState({ ...newState });
  }

  render() {
    return (
      <div data-test="container-submission-form-page-1">
        <Modal
          open={this.state.open}
          handleModalClose={this.handleModalClose}
          fullName={`${this.props.submission.formPage1.firstName} ${
            this.props.submission.formPage1.lastName
          }`}
        />
        <SubmissionFormPage1Wrap {...this.props} />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  submission: state.submission,
  appState: state.appState,
  initialValues: state.submission.formPage1,
  formValues: getFormValues("submissionPage1")(state) || {}
});

const mapDispatchToProps = dispatch => ({
  apiSubmission: bindActionCreators(apiSubmissionActions, dispatch),
  apiSF: bindActionCreators(apiSFActions, dispatch)
});

export const SubmissionFormPage1Connected = connect(
  mapStateToProps,
  mapDispatchToProps
)(SubmissionFormPage1Container);

export default withStyles(stylesPage1)(SubmissionFormPage1Connected);
