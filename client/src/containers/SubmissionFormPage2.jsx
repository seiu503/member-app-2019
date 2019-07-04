import { reduxForm, getFormValues } from "redux-form";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import lifecycle from "react-pure-lifecycle";
import uuid from "uuid";

import { withStyles } from "@material-ui/core/styles";

import SubmissionFormPage2Component from "../components/SubmissionFormPage2Component";
import * as apiSubmissionActions from "../store/actions/apiSubmissionActions";
import validate from "../utils/validators";
import { styles } from "../components/SubmissionFormElements";

// default initial values we want if salesforce doesn't provide useful data
const initialValues = {
  /* *********  POPULATE ME  ********* */
};

const salesForceCheck = id => {
  // MAKE SALESFORCE API CALL HERE using passed Id

  // fake response with an attempt to mock salesforce naming convention based on GoogleDoc
  let fakePositive = {
    // *********  UPDATE WITH PROPER FIELDS FROM COMPONENT  ********* //
  };
  let fakeNegative = {
    error: "no data found in salesforce"
  };

  // using fake test to check if last char is a letter, but really want check truthiness/value of salesforce returned data
  if (id[id.length - 1].toUpperCase() !== id[id.length - 1].toLowerCase()) {
    return fakePositive;
  } else {
    return fakeNegative;
  }
};

const componentDidMount = () => {
  // for now running random 50/50 shot of prefill to test, eventually Will need to nest function in an if block that checks truthiness of `this.props.match.params.id`
  let chance = Math.random() < 0.5;
  if (chance) {
    // temp random ID
    const mockId = uuid.v4();
    // check truthiness of return saleForceAPI call
    const preFill = salesForceCheck(mockId);
    // set initialValue params to values returned from SalesForce
    if (preFill.error) {
      return;
    } else {
      /* *********  POPULATE ME  ********* */
    }
    return;
  }
};

// param for add lifecycle methods to functional component
const methods = {
  componentDidMount
};

// add reduxForm to component
export const SubmissionFormPage2 = reduxForm({
  form: "submissionPage2",
  validate,
  enableReinitialize: true
})(SubmissionFormPage2Component);

const mapStateToProps = state => ({
  submission: state.submission,
  appState: state.appState,
  initialValues,
  formValues: getFormValues("submissionPage2")(state) || {}
});

const mapDispatchToProps = dispatch => ({
  apiSubmission: bindActionCreators(apiSubmissionActions, dispatch)
});

// add MUI styles and faked lifecycle methods
export default withStyles(styles)(
  lifecycle(methods)(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(SubmissionFormPage2)
  )
);
