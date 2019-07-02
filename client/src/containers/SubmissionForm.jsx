import { reduxForm, getFormValues } from "redux-form";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import lifecycle from "react-pure-lifecycle";
import uuid from "uuid";

import { withStyles } from "@material-ui/core/styles";

import SubmissionFormComponent from "../components/SubmissionFormComponent";
import * as apiSubmissionActions from "../store/actions/apiSubmissionActions";
import validate from "../utils/validators";
import { styles } from "../components/SubmissionFormElements";

// default initial values we want if salesforce doesn't provide useful data
const initialValues = {
  mm: "",
  onlineCampaignSource: null,
  homeState: "or",
  preferredLanguage: "english"
};

const salesForceCheck = id => {
  // MAKE SALESFORCE API CALL HERE using passed Id

  // fake response with an attempt to mock salesforce naming convention based on GoogleDoc
  let fakePositive = {
    Birthdate__c: new Date("02/03/1989"),
    Cell_Phone__c: "555-555-5555",
    EmployerName_fromWebForm__c: "SEIU",
    firstName__c: "SF firstName",
    lastName__c: "SF lastName",
    Home_Street__c: "SF homeStreet",
    Home_City__c: "SF homeCity",
    Home_State__c: "OR",
    Home_Zip__c: 11111,
    Home_Email__c: "SFemail@fake.com",
    Preferred_Language__c: "english",
    id
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
      initialValues.mm = (preFill.Birthdate__c.getMonth() + 1).toString();
      initialValues.dd = preFill.Birthdate__c.getDate().toString();
      initialValues.yyyy = preFill.Birthdate__c.getFullYear().toString();
      initialValues.mobilePhone = preFill.Cell_Phone__c;
      initialValues.employerName = preFill.EmployerName_fromWebForm__c;
      initialValues.firstName = preFill.firstName__c;
      initialValues.lastName = preFill.lastName__c;
      initialValues.homeStreet = preFill.Home_Street__c;
      initialValues.homeCity = preFill.Home_City__c;
      initialValues.homeState = preFill.Home_State__c;
      initialValues.homePostalCode = preFill.Home_Zip__c;
      initialValues.homeEmail = preFill.Home_Email__c;
      initialValues.preferredLanguage = preFill.Preferred_Language__c;
      initialValues.contactId = preFill.id;
      if (initialValues.mm.length === 1) {
        initialValues.mm = "0" + initialValues.mm;
      }
      if (initialValues.dd.length === 1) {
        initialValues.dd = "0" + initialValues.dd;
      }
    }
    return;
  }
};

// param for add lifecycle methods to functional component
const methods = {
  componentDidMount
};

// add reduxForm to component
export const SubmissionForm = reduxForm({
  form: "submission",
  validate,
  enableReinitialize: true
})(SubmissionFormComponent);

const mapStateToProps = state => ({
  submission: state.submission,
  appState: state.appState,
  initialValues,
  formValues: getFormValues("submission")(state) || {}
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
    )(SubmissionForm)
  )
);
