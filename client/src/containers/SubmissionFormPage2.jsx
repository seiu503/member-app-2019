import React from "react";
import { getFormValues } from "redux-form";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import queryString from "query-string";
import { withLocalize } from "react-localize-redux";

// import { withStyles } from "@mui/styles";

import SubmissionFormPage2FormWrap from "../components/SubmissionFormPage2Component";

import * as apiSubmissionActions from "../store/actions/apiSubmissionActions";
import * as apiSFActions from "../store/actions/apiSFActions";
// import { stylesPage2 } from "../components/SubmissionFormElements";

export class SubmissionFormPage2Container extends React.Component {
  classes = this.props.classes;

  componentDidMount() {
    // check state for ids from page1
    let cId = this.props.submission.salesforceId,
      sId = this.props.submission.submissionId;
    console.log(`previously saved sId: ${sId}`);
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
          this.props.handleError(err);
        });
    } else {
      // console.log("no id found");
      return this.props.history.push("/");
    }
  }
  render() {
    return (
      <div data-testid="container-submission-form-page-2">
        <SubmissionFormPage2FormWrap {...this.props} />
      </div>
    );
  }
}

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
// export default withStyles(stylesPage2)(
//   withLocalize(SubmissionFormPage2Connected)
// );

export default withLocalize(SubmissionFormPage2Connected);
