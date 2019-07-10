import React from "react";
import { reduxForm, getFormValues } from "redux-form";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
// import lifecycle from "react-pure-lifecycle";

import { withStyles } from "@material-ui/core/styles";

import SubmissionFormPage1Component from "../components/SubmissionFormPage1Component";
import * as apiSubmissionActions from "../store/actions/apiSubmissionActions";
import * as apiSFActions from "../store/actions/apiSFActions";
import validate from "../utils/validators";
import { stylesPage1 } from "../components/SubmissionFormElements";

// default initial values we want if salesforce doesn't provide useful data
const initialValues = {
  mm: "",
  onlineCampaignSource: null,
  homeState: "or",
  preferredLanguage: "english"
};

export class SubmissionFormPage1Container extends React.Component {
  componentDidMount() {
    if (this.props.match.params.id) {
      const { id } = this.props.match.params;
      this.props.apiSF
        .getSFContactById(id)
        .then(result => {
          console.log("success -- Contact data fetched.");
          console.log(result.payload);
          const preFill = result.payload;
          console.log(preFill);
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
          initialValues.salesforceId = preFill.id;
          if (initialValues.mm.length === 1) {
            initialValues.mm = "0" + initialValues.mm;
          }
          if (initialValues.dd.length === 1) {
            initialValues.dd = "0" + initialValues.dd;
          }
        })
        .catch(err => {
          console.log(err);
        });
    } else {
      console.log("no match params found, no prefill");
      return;
    }
  }

  render() {
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
  initialValues,
  formValues: getFormValues("submissionPage1")(state) || {}
});

const mapDispatchToProps = dispatch => ({
  apiSubmission: bindActionCreators(apiSubmissionActions, dispatch),
  apiSF: bindActionCreators(apiSFActions, dispatch)
});

// add MUI styles and faked lifecycle methods
export default withStyles(stylesPage1)(
  // lifecycle(methods)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(SubmissionFormPage1Container)
  // )
);
