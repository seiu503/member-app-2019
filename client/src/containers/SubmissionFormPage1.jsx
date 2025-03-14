import React, { useEffect } from "react";
import {
  getFormValues,
  submit,
  isSubmitting,
  isPristine,
  isValid,
  getFormSubmitErrors,
  reset,
  change
} from "redux-form";

import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import queryString from "query-string";

import SubmissionFormPage1Wrap from "../components/SubmissionFormPage1Component";
import * as utils from "../utils";
import { prefillValidate } from "../utils/validators";
import * as apiSubmissionActions from "../store/actions/apiSubmissionActions";
import * as apiSFActions from "../store/actions/apiSFActions";
import * as actions from "../store/actions";
import { withTranslation } from "react-i18next";

import { findEmployerObject } from "../components/SubmissionFormElements";
import withRouter from "../components/ComponentWithRouterProp";
import Modal from "../components/Modal";

export const SubmissionFormPage1Container = (props) => {

  let _isMounted = false;

  useEffect(() => {
    // previously componentDidMount
    // console.log("Component is mounted");
    _isMounted = true;

    // console.log(`SubmFormP1Container props.location`);
    // console.log(props.location);
    // console.log(`SubmFormP1Container props.history`);
    // console.log(props.history);

    // append and load gRecaptcha script
    const script = document.createElement("script")
    script.src = "https://www.google.com/recaptcha/enterprise.js?render=6LcIuOIqAAAAALoIbgk8ij8a_wggmfj8cQDyD_iW"
    document.body.appendChild(script)

    // check for contact & account ids in query string
    const params = queryString.parse(props.location.search);
    // console.log('**************   PARAMS   ************');
    // console.log(params);
    // const params = {};

    // if find both ids, call API to fetch contact info for prefill
    
    if (params.cId && params.aId) {
      const { cId, aId } = params;
      async function fetchData() {
        props.apiSF
          .getSFContactByDoubleId(cId, aId)
          .then(async (result) => {
            console.log(result);
            // open warning/confirmation modal if prefill successfully loaded
            if (
              props.submission.formPage1.firstName &&
              props.submission.formPage1.lastName
            ) {
              props.actions.setOpen(true);
              console.log(`props.appState.open: ${props.appState.open}`);
              console.log('prefill values');
              console.log(props.submission.prefillValues);
              // check for complete prefill for spf only
              if (params.spf) {
                console.log(Object.keys(prefillValidate(props.submission.prefillValues)));
                if (!Object.keys(prefillValidate(props.submission.prefillValues)).length) {
                  console.log(`completePrefill: true`);
                  props.apiSubmission.handleInput({
                    target: { name: "completePrefill", value: true }
                  });
                } else {
                  console.log('completePrefill: false');
                }
              }
              // props.setCAPEOptions();
            } else {
              // if prefill lookup fails, remove ids from query params
              // and reset to blank form
              handleCloseAndClear();
            }
          })
          .catch(err => {
            console.error(err);
            props.apiSubmission.clearForm();
            // remove cId & aId from route params if no match,
            // but preserve other params
            const cleanUrl1 = utils.removeURLParam(window.location.href, "cId");
            const cleanUrl2 = utils.removeURLParam(cleanUrl1, "aId");
            window.history.replaceState(null, null, cleanUrl2);
            return props.handleError(err);
          });
      }
      fetchData();
    } 
    return () => {
        console.log("Component will unmount");
        _isMounted = false;
      };
    }, []);

  const handleCloseAndClear = () => {
    console.log("handleCloseAndClear");
    props.actions.setOpen(false);
    if (props.appState.spf) {
      // reset to blank multi-page form
      props.actions.setSPF(false); 
    }
    props.apiSubmission.clearForm();
    // remove cId & aId from route params if no match,
    // but preserve other params
    const cleanUrl1 = utils.removeURLParam(window.location.href, "cId");
    const cleanUrl2 = utils.removeURLParam(cleanUrl1, "aId");
    const cleanUrl3 = utils.removeURLParam(cleanUrl2, "spf");
    console.log(`cleanUrl3: ${cleanUrl3}`);
    window.history.replaceState(null, null, cleanUrl3);
    window.location.reload(true);
  }

  const closeDialog = () => {
    console.log("closeDialog");
    const params = queryString.parse(props.location.search);
    const embed = params.embed ? "&embed=true" : "";
    props.navigate(
      `/page2/?cId=${props.submission.salesforceId}&sId=${props.submission.submissionId}${embed}`
    );
    props.actions.setCapeOpen(false);
  }

  const handleEmployerChange = () => {
    // console.log("handleEmployerChange");
    // track that employer has been manually changed after prefill
    // to send the prefilled value back to SF on submit if no change
    props.apiSubmission.handleInput({
      target: { name: "prefillEmployerChanged", value: true }
    });
  }

  const verifyRecaptchaScore = async () => {
    console.log("SFP1 143 verifyRecaptchaScore");

    // set loading
    console.log("setting spinner");
    props.actions.setSpinner();

    // fetch token
    document.addEventListener("DOMContentLoaded", () => {
      console.log('DOMContentLoaded');
      window.grecaptcha.enterprise 
        .execute("6LcIuOIqAAAAALoIbgk8ij8a_wggmfj8cQDyD_iW", { action: "homepage" })
        .then(async token => {
          console.log(`SPF1 154 token: ${token.length}`);
          await props.apiSubmission.handleInput({
            target: { name: "reCaptchaValue", value: token }
          });
          console.log(props.submission.formPage1.reCaptchaValue);

          if (token) {
            console.log("SFP1 158 verifyRecaptchaScore");
            props.apiSubmission
              .verify(token)
              .then(result => {
                console.log("SFP1 162 verifyRecaptchaScore", result.payload ? result.payload.score : 'no result payload');
                return result.payload.score;
              })
              .catch(err => {
                console.log("SPF1 166 verifyRecaptchaScore verify catch err");
                console.error(err);
                const rcErr = props.t("reCaptchaError");
                return props.handleError(rcErr);
              });
          } else {
            console.log("SFP1 172 verifyRecaptchaScore no token err");
            const rcErr = props.t("reCaptchaError");
            return props.handleError(rcErr);
          }
        })
        .catch(err => {
          console.log("SFP1 178 verifyRecaptchaScore grecaptcha execute error")
          console.log(err)
        })
    });
    
    //
    // console.log(props.recaptcha.current);
    // console.log(props.recaptcha.current.executeAsync);
    // let token
    // try {
    //   token = await props.recaptcha.current.executeAsync();
    // } catch(err) {
    //   console.log(`sfp1 155: ${err}`);
    // }
    // await props.recaptcha.current.execute();

    // then verify
    // const token = props.submission.formPage1.reCaptchaValue;
    // console.log(`SPF1 154 token: ${token}`);

    // check for token every 200ms until returned to avoid race condition
    // (async () => {
    //   while (!token) {
    //     await new Promise(resolve => setTimeout(resolve, 200));
    //   }
    // })();
    
  }

  const saveLegalLanguage = async () => {
    console.log('SFP1 195 saveLegalLanguage start');
    return new Promise(resolve => {
      const { formValues } = props;
      // save legal_language to redux store before ref disappears
      // but first check to see if it's already been saved? because this is running twice when it shouldn't
      // and sometimes it runs after we've already moved to the next tab and then the ref is gone

      if (!props.submission.formPage1.legalLanguage && !props.submission.p4cReturnValues.legalLanguage) {
        let legalLanguage =
          props.legal_language.current.textContent ||
          props.legal_language.current.innerText ||
          "";
        // console.log(legalLanguage);

        props.apiSubmission.handleInput({
          target: { name: "legalLanguage", value: legalLanguage }
        });
      }
      
      console.log('SFP1 214 saveLegalLanguage resolve');
      resolve();
    })
  }

  const generateCAPEBody = async (capeAmount, capeAmountOther) => {
    console.log("SFP1 220 generateCAPEBody");
    // console.log(capeAmount, capeAmountOther);
    const { formValues } = props;
    // console.log(formValues);

    // if no contact in prefill or from previous form tabs...
    if (!props.submission.salesforceId) {
      console.log("SFP1 227 generateCAPEBody");
      await props
        .lookupSFContact(formValues)
        .then(() => console.log("SFP1 230 generateCAPEBody"))
        .catch(err => {
          console.error(err);
          return props.handleError(err);
        });
    }

    // find employer object
    let employerObject = findEmployerObject(
      props.submission.employerObjects,
      formValues.employerName
    );

    if (employerObject) {
      console.log(`employerId: ${employerObject.Id}`);
    } else {
      console.log(
        `SFP1 247 no employerObject found for ${formValues.employerName}; no agency #`
      );
    }

    // decide whether to use prefilled employer id (worksite level),
    // or user-chosen employer id (employer level)
    let employerId;
    if (
      props.submission.formPage1 &&
      props.submission.formPage1.prefillEmployerId
    ) {
      if (!props.submission.formPage1.prefillEmployerChanged) {
        // if this is a prefill and employer has not been changed manually,
        // return original prefilled employer Id
        // this will be a worksite-level account id in most cases
        employerId = props.submission.formPage1.prefillEmployerId;
      } else {
        // if employer has been manually changed since prefill, or if
        // this is a blank-slate form, find id in employer object
        // this will be an agency-level employer Id
        employerId = employerObject ? employerObject.Id : "0016100000WERGeAAP"; // <= unknown employer
      }
    } else {
      // if employer has been manually changed since prefill, or if
      // this is a blank-slate form, find id in employer object
      // this will be an agency-level employer Id
      employerId = employerObject ? employerObject.Id : "0016100000WERGeAAP"; // <= unknown employer
    }
    console.log(`employerId: ${employerId}`);

    // set campaign source
    const q = queryString.parse(props.location.search);
    // console.log(q);
    const campaignSource =
      q && q.s ? q.s : q && q.src ? q.src : "Direct seiu503signup";

    console.log(campaignSource);

    // set body fields
    const paymentMethod = "Checkoff";
    let donationAmount =
      capeAmount === "Other"
        ? parseFloat(capeAmountOther)
        : parseFloat(capeAmount);
    // console.log(capeAmountOther);
    // console.log(capeAmount);
    console.log(`donationAmount: ${donationAmount}`);

    // generate body
    const body = {
      submission_date: utils.formatDate(new Date()),
      contact_id: props.submission.salesforceId,
      first_name: formValues.firstName,
      last_name: formValues.lastName,
      home_email: formValues.homeEmail,
      cell_phone: formValues.mobilePhone,
      home_street: formValues.homeStreet,
      home_city: formValues.homeCity,
      home_state: formValues.homeState,
      home_zip: formValues.homeZip,
      job_title: formValues.jobTitle,
      employer_id: employerId,
      payment_method: paymentMethod,
      online_campaign_source: campaignSource,
      cape_legal: props.cape_legal.current.innerHTML,
      cape_amount: donationAmount,
      cape_status: "Incomplete",
      donation_frequency: "Monthly"
    };
    // console.log(body);
    return body;
  }

  // create an initial CAPE record in postgres to get returned ID
  // not finalized until payment method added and SFCAPE status updated
  const createCAPE = async (capeAmount, capeAmountOther) => {
    console.log("createCAPE");
    const body = await generateCAPEBody(capeAmount, capeAmountOther);
    console.log(body);
    if (body) {
      const capeResult = await props.apiSubmission
        .createCAPE(body)
        .catch(err => {
          console.error(err);
          return props.handleError(err);
        });

      if (
        (capeResult && capeResult.type !== "CREATE_CAPE_SUCCESS") ||
        props.submission.error
      ) {
        console.log(props.submission.error);
        return props.handleError(props.submission.error);
      } else {
        return capeResult;
      }
    } else {
      console.log("no CAPE body generated");
    }
  }

  const handleCAPESubmit = async (standAlone) => {
    console.log("handleCAPESubmit", standAlone);
    const { formValues } = props;
    console.dir(formValues);
    if (standAlone) {
      // verify recaptcha score
      try {
        await verifyRecaptchaScore()
          .then(score => {
            console.log('SFP1 handleCAPESubmit 377')
            console.log(`score: ${score}`);
            if (!score || score <= 0.3) {
              console.log(`recaptcha failed: ${score}`);
              return props.handleError(
                props.t("reCaptchaError")
              );
              return;
            }
          })
          .catch(err => {
            console.log('SFP1 handleCAPESubmit 390');
            console.error(err);
          });
      } catch (err) {
        console.log('SFP1 handleCAPESubmit 394');
        console.error(err);
      }
    }
    // if user clicks submit before the payment logic finishes loading,
    // they may not have donation amount fields visible
    // but will still get an error that the field is missing
    if (!formValues.capeAmount && !formValues.capeAmountOther) {
      // console.log("no donation amount chosen: 360");
      props.actions.setDisplayCapePaymentFields(true);
      return props.handleError(props.t("donationAmountError"));
        console.log(props.appState.displayCAPEPaymentFields);
      };

    let cape_errors = "",
      cape_status = "Pending";
    const body = await generateCAPEBody(
      formValues.capeAmount,
      formValues.capeAmountOther
    ).catch(err => {
      cape_errors += err;
      cape_status = "Error";
      console.error(err);
      props.handleError(err);
    });
    if (body) {
      delete body.cape_status;
    } else {
      const err = "There was a problem with the CAPE Submission";
      cape_errors += err;
      cape_status = "Error";
      console.error(err);
      props.handleError(err);
    }

    // console.log(body);

    // write CAPE contribution to SF
    const sfCapeResult = await props.apiSF
      .createSFCAPE(body)
      .catch(err => {
        cape_errors += err;
        cape_status = "Error";
        console.error(err);
        props.handleError(err);
      });

    if (
      (sfCapeResult && sfCapeResult.type !== "CREATE_SF_CAPE_SUCCESS") ||
      props.submission.error
    ) {
      cape_errors += props.submission.error;
      cape_status = "Error";
      // console.log(props.submission.error);
      return props.handleError(props.submission.error);
    } else if (sfCapeResult && sfCapeResult.type === "CREATE_SF_CAPE_SUCCESS") {
      cape_status = "Success";
    } else {
      cape_status = "Error";
    }

    let capeId;
    await createCAPE(formValues.capeAmount, formValues.capeAmountOther)
      .then(result => {
        console.log("421");
        console.log(result);
        capeId = result.payload.cape_id;
      })
      .catch(err => {
        console.error(err);
        return props.handleError(err);
      });

    // const { id } = props.submission.cape;

    // collect updates to cape record (values returned from other API calls,
    // amount and frequency)
    const donationAmount =
      formValues.capeAmount === "Other"
        ? parseFloat(formValues.capeAmountOther)
        : parseFloat(formValues.capeAmount);
    const updates = {
      cape_status,
      cape_errors,
      cape_amount: donationAmount,
      donation_frequency: formValues.donationFrequency
    };
    console.log(updates);
    // update CAPE record in postgres
    await props.apiSubmission
      .updateCAPE(capeId, updates)
      .then(result => {
        console.log(result);
      })
      .catch(err => {
        console.error(err);
        // return props.handleError(err); // don't return to client here
      });

    if (!standAlone) {
      console.log("451");
      console.log(props.history);
      const params = queryString.parse(props.location.search);
      console.log(params);
      const embed = params.embed ? "&embed=true" : "";
      console.log(
        `/page2/?cId=${props.submission.salesforceId}&sId=${props.submission.submissionId}${embed}`
      );
      props.navigate(
        `/page2/?cId=${props.submission.salesforceId}&sId=${props.submission.submissionId}${embed}`
      );
    } else {
      console.log("462");
      props.openSnackbar(
        "success",
        "Thank you. Your CAPE submission was processed."
      );
      props.navigate(`/thankyou/?cape=true`);
    }
  }

  const handleTab2 = async () => {
    // p4c hasn't been run yet so can't use previously saved values from redux store
    const { formValues } = props;
    console.log( 'handleTab2formValues');
    console.log(formValues);

    if (!formValues.signature) {
      console.log(props.t("provideSignatureError"));
      return props.handleError(props.t("provideSignatureError"));
    }

    // save legal language
    await saveLegalLanguage();

    // save partial submission (update later with demographics from p2)
    await props.createSubmission(formValues).catch(err => {
      console.error(err);
      return props.handleError(err);
    });

    // move to next tab (CAPE)
    return props.actions.setTab(2);
  }

  const handleTab1 = async () => {
    console.log("SFP1 516 handleTab1");
    console.log( 'handleTab1formValues');
    const { formValues } = props;
    console.log(formValues);
 
    // verify recaptcha score
    const score = await verifyRecaptchaScore();
    setTimeout(() => {
      if (score <= 0.3) {
        console.log(`recaptcha failed: ${score}`);
        // don't return error to client here because the error is returned even if recaptcha is still waiting for result
        // const reCaptchaError = props.t("reCaptchaError");
        // return props.handleError(reCaptchaError);
        return;
      }
    }, 0);

    console.log("SFP1 533 handleTab1");

    const updateContactAndMoveToNextTab = async () => {
      console.log("SFP1 538 handleTab1 updateContactAndMoveToNextTab");
      // update existing contact, move to next tab
      await props.updateSFContact(formValues)
        .catch(err => {
          console.error(err);
          return props.handleError(err);
        });
      console.log('SFP1 545 handleTab1 updateContactAndMoveToNextTab');
      if (props.appState.spf) {
        console.log('single page form: calling handleTab2 after updating contact');
        return handleTab2()
          .catch(err => {
            console.error(err);
            return props.handleError(err);
          });
      } else {
        console.log('not spf: moving to tab 2');
        return props.actions.setTab(1);
      }
    };

    console.log("SFP1 557 handleTab1");

    // check if SF contact id already exists (prefill case)
    console.log(`sfid: ${props.submission.salesforceId}`);

    if (props.submission.salesforceId) {
      await updateContactAndMoveToNextTab();
      console.log("SFP1 564 handleTab1");
    } else {
      // otherwise, lookup contact by first/last/email
      await props.lookupSFContact(formValues).catch(err => {
        console.log("SFP1 568 handleTab1");
        console.error(err);
        return props.handleError(err);
      });

      // if lookup was successful, update existing contact and move to next tab
      if (props.submission.salesforceId) {
        await updateContactAndMoveToNextTab();
        console.log("SFP1 576 handleTab1");
      } else {
        // otherwise, create new contact with submission data,
        // then move to next tab
        await props.createSFContact(formValues).catch(err => {
          console.error(err);
          return props.handleError(err);
        });
        if (props.appState.spf) {
          console.log('single page form: calling handleTab2 after creating new contact');
          return handleTab2();
        } else {
          console.log('not spf: moving to tab 2');
          return props.actions.setTab(1);
        }
      } 
    }
  }

  const handleTab = async (newValue) => {
    // e.preventDefault();
    // set loading
    console.log("setting spinner");
    props.actions.setSpinner();

    console.log("handleTab");
    console.log(newValue);
    if (newValue === 1) {
      return handleTab1().catch(err => {
        console.log("handleTab1 failed");
        console.error(err);
        return props.handleError(err);
      });
    }
    if (newValue === 2) {
      return handleTab2().catch(err => {
        console.log("handleTab2 failed");
        console.error(err);
        return props.handleError(err);
      });
    } else {
      props.actions.spinnerOff();
      return props.actions.setTab(newValue);
    }
  }


  const fullName = `${
    props.submission &&
    props.submission.formPage1 &&
    props.submission.formPage1.firstName
      ? props.submission.formPage1.firstName
      : ""
  } ${
    props.submission &&
    props.submission.formPage1 &&
    props.submission.formPage1.lastName
      ? props.submission.formPage1.lastName
      : ""
  }`;

    // console.log('%^*%*&^%&^%*&%*&%^&*^%*&^%*&^%*&^%*&^');
    // console.log(`props.appState.open: ${props.appState.open}`);
    // console.log(`fullName.length: ${fullName.length}`);
    // console.log(`props.submission.redirect: ${props.submission.redirect}`);
    // console.log(`props.appState.open &&
    //         fullName.length &&
    //         !props.submission.redirect: ${props.appState.open &&
    //         fullName.length &&
    //         !props.submission.redirect}`);
    return (
      <div data-testid="container-submission-form-page-1">
        <Modal
          open={
            props.appState.open &&
            fullName.length &&
            !props.submission.redirect
          }
          handleCloseAndClear={handleCloseAndClear}
          handleClose={props.actions.handleClose}
          fullName={fullName}
          history={props.history}
        />
        <SubmissionFormPage1Wrap
          {...props}
          change={change}
          handleTab={handleTab}
          back={props.actions.setTab}
          handleError={props.handleError}
          handleCAPESubmit={handleCAPESubmit}
          verifyRecaptchaScore={verifyRecaptchaScore}
          handleEmployerChange={handleEmployerChange}
          closeDialog={closeDialog}
        />
      </div>
    );

}

const mapStateToProps = state => ({
  submission: state.submission,
  appState: state.appState,
  initialValues: state.submission.formPage1,
  formValues: getFormValues("submissionPage1")(state) || {},
  pristine: isPristine("submissionPage1")(state),
  submitting: isSubmitting("submissionPage1")(state),
  valid: isValid("submissionPage1")(state),
  submitErrors: getFormSubmitErrors("submissionPage1")(state),
  reset: reset
});

const mapDispatchToProps = dispatch => ({
  apiSubmission: bindActionCreators(apiSubmissionActions, dispatch),
  apiSF: bindActionCreators(apiSFActions, dispatch),
  actions: bindActionCreators(actions, dispatch),
  submitForm: () => dispatch(submit("submissionPage1"))
});

export const SubmissionFormPage1Connected = connect(
  mapStateToProps,
  mapDispatchToProps
)(SubmissionFormPage1Container);

export default withTranslation()(withRouter(SubmissionFormPage1Connected));
