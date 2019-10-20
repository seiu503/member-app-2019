import React from "react";
import { getFormValues } from "redux-form";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import queryString from "query-string";
import { withLocalize } from "react-localize-redux";

import { withStyles } from "@material-ui/core/styles";

import SubmissionFormPage2Wrap from "../components/SubmissionFormPage2Component";

import * as apiSubmissionActions from "../store/actions/apiSubmissionActions";
import * as apiSFActions from "../store/actions/apiSFActions";
import { stylesPage2, handleError } from "../components/SubmissionFormElements";

export class SubmissionFormPage2Container extends React.Component {
  classes = this.props.classes;

  componentDidMount() {
    // check state for ids from page1
    let cId = this.props.submission.salesforceId,
      sId = this.props.submission.submissionId;
    // check for ids in query string
    const params = queryString.parse(this.props.location.search);
    if (!cId && params.cId) {
      cId = params.cId;
      this.props.apiSubmission.saveSalesforceId(cId);
    }
    if (!sId && params.sId) {
      sId = params.sId;
      this.props.apiSubmission.saveSubmissionId(sId);
    }

    // if find cId, call API to fetch contact info for prefill
    if (cId) {
      this.props.apiSF
        .getSFContactById(cId)
        .then(result => {
          console.log("result.payload", result.payload);
        })
        .catch(err => {
          console.log(err);
          handleError(err);
        });
    } else {
      // console.log("no id found");
      return this.props.history.push("/");
    }
  }
  render() {
    return (
      <div data-test="container-submission-form-page-2">
        <SubmissionFormPage2Wrap {...this.props} />
      </div>
    );
  }
}

// export const SubmissionFormPage2Wrap = reduxForm({
//   form: "submissionPage2",
//   validate,
//   enableReinitialize: true
// })(SubmissionFormPage2Component);

const mapStateToProps = state => ({
  submission: state.submission,
  appState: state.appState,
  initialValues: state.submission.formPage2,
  localize: state.localize,
  formValues: getFormValues("submissionPage2")(state) || {}
});

const mapDispatchToProps = dispatch => ({
  apiSubmission: bindActionCreators(apiSubmissionActions, dispatch),
  apiSF: bindActionCreators(apiSFActions, dispatch)
});

export const SubmissionFormPage2Connected = connect(
  mapStateToProps,
  mapDispatchToProps
)(SubmissionFormPage2Container);

// add MUI styles and faked lifecycle methods
export default withStyles(stylesPage2)(
  withLocalize(SubmissionFormPage2Connected)
);
