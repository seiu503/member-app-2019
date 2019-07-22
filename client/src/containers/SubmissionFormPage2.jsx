import React from "react";
import { reduxForm, getFormValues } from "redux-form";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import queryString from "query-string";

import { withStyles } from "@material-ui/core/styles";

import SubmissionFormPage2Component from "../components/SubmissionFormPage2Component";
import * as apiSubmissionActions from "../store/actions/apiSubmissionActions";
import * as apiSFActions from "../store/actions/apiSFActions";
import validate from "../utils/validators";
import { stylesPage2 } from "../components/SubmissionFormElements";

export class SubmissionFormPage2Container extends React.Component {
  componentDidMount() {
    // check for contact id in query string
    const values = queryString.parse(this.props.location.search);
    // if find contact id, call API to fetch contact info for prefill
    if (values.id) {
      const { id } = values;
      this.props.apiSF
        .getSFContactById(id)
        .then(result => {
          // console.log("result.payload", result.payload);
        })
        .catch(err => {
          console.log(err);
        });
    } else {
      alert("We Did not find your Id, redirecting to main submission page");
      console.log("no id found, no prefill");

      //RESTORE LINE BELOW FOR PRODUCTION!!!!!!! COMMENTED OUT FOR DEV PURPOSES
      // return this.props.history.push("/")
    }
  }
  render() {
    if (this.props.submission.loading) {
      return <div>Loading...</div>;
    }
    return <SubmissionFormPage2Wrap {...this.props} />;
  }
}

export const SubmissionFormPage2Wrap = reduxForm({
  form: "submissionPage2",
  validate,
  enableReinitialize: true
})(SubmissionFormPage2Component);

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

// add MUI styles and faked lifecycle methods
export default withStyles(stylesPage2)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(SubmissionFormPage2Container)
);
