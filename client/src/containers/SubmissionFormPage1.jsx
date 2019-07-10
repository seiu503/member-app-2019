import { reduxForm, getFormValues } from "redux-form";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import lifecycle from "react-pure-lifecycle";

import { withStyles } from "@material-ui/core/styles";

import SubmissionFormPage1Component from "../components/SubmissionFormPage1Component";
import * as apiSubmissionActions from "../store/actions/apiSubmissionActions";
import * as apiSFActions from "../store/actions/apiSFActions";
import validate from "../utils/validators";
import { stylesPage1 } from "../components/SubmissionFormElements";

// add reduxForm to component
export const SubmissionFormPage1 = reduxForm({
  form: "submissionPage1",
  validate,
  enableReinitialize: true
})(SubmissionFormPage1Component);

const mapStateToProps = state => ({
  submission: state.submission,
  appState: state.appState,
  formValues: getFormValues("submissionPage1")(state) || {}
});

const mapDispatchToProps = dispatch => ({
  apiSubmission: bindActionCreators(apiSubmissionActions, dispatch),
  apiSF: bindActionCreators(apiSFActions, dispatch)
});

const methods = {
  // componentDidMount
};

// add MUI styles and faked lifecycle methods
export default withStyles(stylesPage1)(
  lifecycle(methods)(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(SubmissionFormPage1)
  )
);
