import { reduxForm, getFormValues } from "redux-form";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import { withStyles } from "@material-ui/core/styles";

import SubmissionFormComponent from "../components/SubmissionFormComponent";
import * as apiSubmissionActions from "../store/actions/apiSubmissionActions";
import validate from "../utils/validators";
import { styles } from "../components/SubmissionFormElements";

export const SubmissionFormReduxForm = reduxForm({
  form: "submission",
  validate,
  enableReinitialize: true
})(SubmissionFormComponent);

const mapStateToProps = state => ({
  submission: state.submission,
  appState: state.appState,
  initialValues: {
    mm: "",
    onlineCampaignSource: null
  },
  formValues: getFormValues("submission")(state) || {}
});

const mapDispatchToProps = dispatch => ({
  apiSubmission: bindActionCreators(apiSubmissionActions, dispatch)
});

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(SubmissionFormReduxForm)
);
