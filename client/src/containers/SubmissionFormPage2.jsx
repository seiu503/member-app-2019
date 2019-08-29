import React from "react";
import { getFormValues } from "redux-form";
// import { reduxForm, getFormValues } from "redux-form";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import queryString from "query-string";

import { withStyles } from "@material-ui/core/styles";

import SubmissionFormPage2Wrap from "../components/SubmissionFormPage2Component";

import * as apiSubmissionActions from "../store/actions/apiSubmissionActions";
import * as apiSFActions from "../store/actions/apiSFActions";
// import validate from "../utils/validators";
import { stylesPage2, handleError } from "../components/SubmissionFormElements";

export class SubmissionFormPage2Container extends React.Component {
  componentDidMount() {
    // check state for contact id from page1
    let id = this.props.submission.salesforceId;
    if (!id) {
      // check for contact id in query string
      const params = queryString.parse(this.props.location.search);
      if (params.id) {
        id = params.id;
      }
    }

    // if find contact id, call API to fetch contact info for prefill
    if (id) {
      this.props.apiSF
        .getSFContactById(id)
        .then(result => {
          // console.log("result.payload", result.payload);
        })
        .catch(err => {
          console.log(err);
          handleError(err);
        });
    } else {
      // console.log("no id found");
      //RESTORE LINE BELOW FOR PRODUCTION!!!!!!! COMMENTED OUT FOR DEV PURPOSES
      // return this.props.history.push("/")
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
export default withStyles(stylesPage2)(SubmissionFormPage2Connected);
