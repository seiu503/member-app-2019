import React from "react";
import { reduxForm, getFormValues } from "redux-form";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import queryString from "query-string";

import { withStyles } from "@material-ui/core/styles";

import SubmissionFormPage1Component from "../components/SubmissionFormPage1Component";
import * as apiSubmissionActions from "../store/actions/apiSubmissionActions";
import * as apiSFActions from "../store/actions/apiSFActions";
import validate from "../utils/validators";
import { stylesPage1 } from "../components/SubmissionFormElements";

export class SubmissionFormPage1Container extends React.Component {
  componentDidMount() {
    const values = queryString.parse(this.props.location.search);
    console.log(values.id);
    if (values.id) {
      const { id } = values;
      this.props.apiSF
        .getSFContactById(id)
        .then(result => {
          console.log("success -- Contact data fetched.");
          console.log("result.payload", result.payload);
        })
        .catch(err => {
          console.log(err);
        });
    } else {
      console.log("no id found, no prefill");
      return;
    }
  }
  render() {
    if (this.props.submission.loading) {
      return <div>Loading...</div>;
    }
    return <SubmissionFormPage1Wrap {...this.props} />;
  }
}

// param for add lifecycle methods to functional component
// const methods = {
//   componentDidMount
// };

// add reduxForm to component
export const SubmissionFormPage1Wrap = reduxForm({
  form: "submissionPage1",
  validate,
  enableReinitialize: true
})(SubmissionFormPage1Component);

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

// add MUI styles and faked lifecycle methods
export default withStyles(stylesPage1)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(SubmissionFormPage1Container)
);
