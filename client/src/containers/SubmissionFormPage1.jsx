import React from "react";
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
import isoConv from "iso-language-converter";

import { withStyles } from "@material-ui/core/styles";

import { openSnackbar } from "./Notifier";
import SubmissionFormPage1Wrap from "../components/SubmissionFormPage1Component";
import * as utils from "../utils";
import * as apiSubmissionActions from "../store/actions/apiSubmissionActions";
import * as apiContentActions from "../store/actions/apiContentActions";
import * as apiSFActions from "../store/actions/apiSFActions";
import * as actions from "../store/actions";
import { withLocalize } from "react-localize-redux";

import {
  stylesPage1,
  blankSig,
  formatSFDate,
  formatBirthdate,
  findEmployerObject,
  handleError
} from "../components/SubmissionFormElements";
import Modal from "../components/Modal";
const uuid = require("uuid");

export class SubmissionFormPage1Container extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      capeOpen: false,
      legalLanguage: "",
      signatureType: "draw",
      displayCAPEPaymentFields: false
    };
    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
    this.toggleCardAddingFrame = this.toggleCardAddingFrame.bind(this);
    this.handleCAPESubmit = this.handleCAPESubmit.bind(this);
    this.suggestedAmountOnChange = this.suggestedAmountOnChange.bind(this);
    this.verifyRecaptchaScore = this.verifyRecaptchaScore.bind(this);
    this.handleEmployerTypeChange = this.handleEmployerTypeChange.bind(this);
    this.handleEmployerChange = this.handleEmployerChange.bind(this);
    this.handleDonationFrequencyChange = this.handleDonationFrequencyChange.bind(
      this
    );
    this.checkCAPEPaymentLogic = this.checkCAPEPaymentLogic.bind(this);
    this.handleCAPEOpen = this.handleCAPEOpen.bind(this);
    this.handleCAPEClose = this.handleCAPEClose.bind(this);
    this.closeDialog = this.closeDialog.bind(this);
    this.mobilePhoneOnBlur = this.mobilePhoneOnBlur.bind(this);
    this.handleCloseAndClear = this.handleCloseAndClear.bind(this);
    this.handleTab = this.handleTab.bind(this);
  }

  componentDidMount() {
    // check for contact & account ids in query string
    const params = queryString.parse(this.props.location.search);
    // if find both ids, call API to fetch contact info for prefill
    if (params.cId && params.aId) {
      const { cId, aId } = params;
      this.props.apiSF
        .getSFContactByDoubleId(cId, aId)
        .then(result => {
          // console.log(result);
          // open warning/confirmation modal if prefill successfully loaded
          if (
            this.props.submission.formPage1.firstName &&
            this.props.submission.formPage1.lastName
          ) {
            this.handleOpen();
            this.props.setCAPEOptions();
          } else {
            // if prefill lookup fails, remove ids from query params
            // and reset to blank form
            this.props.apiSubmission.clearForm();
            // remove cId & aId from route params if no match,
            // but preserve other params
            const cleanUrl1 = utils.removeURLParam(window.location.href, "cId");
            console.log(cleanUrl1);
            const cleanUrl2 = utils.removeURLParam(cleanUrl1, "aId");
            console.log(cleanUrl2);
            window.history.replaceState(null, null, cleanUrl2);
          }
        })
        .catch(err => {
          console.error(err);
          this.props.apiSubmission.clearForm();
          // remove cId & aId from route params if no match,
          // but preserve other params
          const cleanUrl1 = utils.removeURLParam(window.location.href, "cId");
          const cleanUrl2 = utils.removeURLParam(cleanUrl1, "aId");
          window.history.replaceState(null, null, cleanUrl2);
          return handleError(err);
        });
    }
  }

  handleOpen() {
    const newState = { ...this.state };
    newState.open = true;
    this.setState({ ...newState });
  }

  handleCAPEOpen() {
    const newState = { ...this.state };
    newState.capeOpen = true;
    this.setState({ ...newState });
  }

  handleClose() {
    const newState = { ...this.state };
    newState.open = false;
    this.setState({ ...newState });
  }

  handleCloseAndClear() {
    const newState = { ...this.state };
    newState.open = false;
    this.setState({ ...newState });
    this.props.apiSubmission.clearForm();
    // remove cId & aId from route params if no match
    window.history.replaceState(null, null, `${window.location.origin}/`);
  }

  handleCAPEClose() {
    const newState = { ...this.state };
    newState.capeOpen = false;
    this.setState({ ...newState });
  }

  closeDialog() {
    const params = queryString.parse(this.props.location.search);
    const embed = params.embed ? "&embed=true" : "";
    this.props.history.push(
      `/page2/?cId=${this.props.submission.salesforceId}&sId=${
        this.props.submission.submissionId
      }${embed}`
    );
    this.handleCAPEClose();
  }
  mobilePhoneOnBlur() {
    this.handleEmployerTypeChange(this.props.formValues.employerType);
  }

  handleUpload(firstName, lastName) {
    console.log("handleUpload");
    return new Promise((resolve, reject) => {
      let file = this.trimSignature();
      let filename = `${firstName}_${lastName}__signature__${formatSFDate(
        new Date()
      )}.jpg`;
      if (file instanceof Blob) {
        file.name = filename;
      }
      this.props.apiContent
        .uploadImage(file)
        .then(result => {
          if (
            result.type === "UPLOAD_IMAGE_FAILURE" ||
            this.props.content.error
          ) {
            resolve(handleError(this.props.translate("sigSaveError")));
          } else {
            // console.log(result.payload.content);
            resolve(result.payload.content);
          }
        })
        .catch(err => {
          console.error(err);
          resolve(handleError(err));
        });
    });
  }

  suggestedAmountOnChange = e => {
    // call getIframeURL for
    // standalone CAPE when donation amount is set and
    // member shortId does not yet exist
    // console.log("suggestedAmountOnChange");
    const { formValues } = this.props;
    if (e.target.value === "Other") {
      return;
    }
    const params = queryString.parse(this.props.location.search);

    if (
      (params.cape &&
        utils.isPaymentRequired(
          this.props.submission.formPage1.employerType
        )) ||
      formValues.donationFrequency === "One-Time"
    ) {
      this.props.apiSubmission.handleInput({
        target: "paymentRequired",
        value: true
      });
      this.getIframeURL(params.cape).catch(err => {
        console.log(err);
      });
    } else {
      this.props.apiSubmission.handleInput({
        target: "paymentRequired",
        value: false
      });
    }
  };

  async handleEmployerTypeChange(employerType) {
    console.log("handleEmployerTypeChange");
    console.log(employerType);
    // render iframe if payment required
    if (utils.isPaymentRequired(employerType)) {
      await this.props.apiSubmission.handleInput({
        target: { name: "paymentRequired", value: true }
      });
      await this.props.apiSubmission.handleInput({
        target: { name: "checkoff", value: false }
      });
      const params = queryString.parse(this.props.location.search);
      return this.getIframeURL(params.cape);
    } else {
      console.log("setting paymentRequired to false");
      // hide iframe if already rendered if change to checkoff
      await this.props.apiSubmission.handleInput({
        target: { name: "paymentRequired", value: false }
      });
      await this.props.apiSubmission.handleInput({
        target: { name: "checkoff", value: true }
      });
    }
  }

  handleEmployerChange() {
    // console.log("handleEmployerChange");
    // track that employer has been manually changed after prefill
    // to send the prefilled value back to SF on submit if no change
    this.props.apiSubmission.handleInput({
      target: { name: "prefillEmployerChanged", value: true }
    });
  }

  async handleDonationFrequencyChange(frequency) {
    const { formValues } = this.props;
    const { payment, cape } = this.props.submission;
    const activeMethodLast4 =
      payment.activeMethodLast4 || cape.activeMethodLast4;
    const paymentErrorHold = payment.paymentErrorHold || cape.paymentErrorHold;
    const validMethod = !!activeMethodLast4 && !paymentErrorHold;
    if (!formValues.capeAmount && !formValues.capeAmountOther) {
      return;
    }
    // render iframe if one-time donation and cape amount set

    if (validMethod) {
      await this.props.apiSubmission.handleInput({
        target: { name: "newCardNeeded", value: false }
      });
    }

    if (frequency === "One-Time") {
      await this.props.apiSubmission.handleInput({
        target: { name: "paymentRequired", value: true }
      });

      return this.getIframeURL(true);
    } else {
      const checkoff = this.props.submission.formPage1.checkoff;
      console.log(checkoff);
      if (frequency === "Monthly" && checkoff) {
        // hide iframe if already rendered
        // if change back to monthly and checkoff
        console.log("setting paymentRequired to false, hiding iframe");
        await this.props.apiSubmission.handleInput({
          target: { name: "paymentRequired", value: false }
        });
      }
    }
  }

  toggleSignatureInputType = () => {
    let type = this.state.signatureType === "draw" ? "write" : "draw";
    this.setState({ signatureType: type });
  };

  clearSignature = () => {
    this.props.sigBox.current.clear();
  };

  dataURItoBlob = dataURI => {
    let binary = atob(dataURI.split(",")[1]);
    let array = [];
    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], { type: "image/jpeg" });
  };

  trimSignature = () => {
    let dataURL = this.props.sigBox.current.toDataURL("image/jpeg");
    if (dataURL === blankSig) {
      return handleError(this.props.translate("sigSaveError2"));
    } else {
      let blobData = this.dataURItoBlob(dataURL);
      return blobData;
    }
  };

  async getCAPEBySFId() {
    const id = this.props.submission.salesforceId;
    if (id) {
      return new Promise(resolve => {
        this.props.apiSubmission
          .getCAPEBySFId(id)
          .then(result => {
            if (
              result.type === "GET_CAPE_BY_SFID_FAILURE" ||
              this.props.submission.error
            ) {
              // console.log(this.props.submission.error);
              // don't return this error to client
              // it's confusing if it's just 'no record found'...
              resolve(console.log(this.props.submission.error));
            }
            resolve(result);
          })
          .catch(err => {
            console.error(err);
            resolve(handleError(err));
          });
      });
    }
  }

  async getSFCAPEByContactId() {
    // console.log("getSFCAPEByContactId");
    const id = this.props.submission.salesforceId;
    // console.log(id);
    await this.props.apiSF
      .getSFCAPEByContactId(id)
      .then(result => {
        // console.log(result);
        if (
          result.type === "GET_SF_CAPE_BY_CONTACT_ID_FAILURE" ||
          this.props.submission.error
        ) {
          // console.log(this.props.submission.error);
          this.props.apiSubmission.handleInput({
            target: { name: "whichCard", value: "Add new card" }
          });
          return handleError(this.props.submission.error);
        }
        if (
          !!this.props.submission.cape.activeMethodLast4 &&
          !this.props.submission.cape.paymentErrorHold
        ) {
          this.props.apiSubmission.handleInput({
            target: { name: "whichCard", value: "Use existing" }
          });
        }
        return result;
      })
      .catch(err => {
        console.error(err);
        return handleError(err);
      });
  }

  getSFDJRById() {
    const id = this.props.submission.salesforceId;
    return new Promise(resolve => {
      this.props.apiSF
        .getSFDJRById(id)
        .then(result => {
          // console.log(result);
          if (
            result.type === "GET_SF_DJR_FAILURE" ||
            this.props.submission.error
          ) {
            // console.log(this.props.submission.error);
            this.props.apiSubmission.handleInput({
              target: { name: "whichCard", value: "Add new card" }
            });
            resolve(handleError(this.props.submission.error));
          }
          if (
            !!this.props.submission.payment.activeMethodLast4 &&
            !this.props.submission.payment.paymentErrorHold
          ) {
            this.props.apiSubmission.handleInput({
              target: { name: "whichCard", value: "Use existing" }
            });
          }
          resolve(result);
        })
        .catch(err => {
          console.error(err);
          resolve(handleError(err));
        });
    });
  }

  async createSFDJR() {
    const medicaidResidents =
      this.props.submission.formPage1.medicaidResidents || 0;
    console.log(`medicaidResidents: ${medicaidResidents}`);
    const body = {
      Worker__c: this.props.submission.salesforceId,
      Unioni_se_MemberID__c: this.props.submission.payment.memberShortId,
      Payment_Method__c: this.props.submission.formPage1.paymentType,
      AFH_Number_of_Residents__c: medicaidResidents,
      Unioni_se_ProviderID__c: this.props.submission.payment.memberProviderId
    };
    this.props.apiSF
      .createSFDJR(body)
      .then(result => {
        // console.log(result);
        if (
          result.type === "CREATE_SF_DJR_FAILURE" ||
          this.props.submission.error
        ) {
          return handleError(this.props.submission.error);
        }
      })
      .catch(err => {
        console.error(err);
        return handleError(err);
      });
  }

  async updateSFDJR() {
    const id = this.props.submission.salesforceId;
    const medicaidResidents =
      this.props.submission.formPage1.medicaidResidents || 0;
    console.log(`medicaidResidents: ${medicaidResidents}`);
    const updates = {
      Unioni_se_MemberID__c: this.props.submission.payment.memberShortId,
      Payment_Method__c: this.props.submission.formPage1.paymentType,
      AFH_Number_of_Residents__c: medicaidResidents,
      Active_Account_Last_4__c: this.props.submission.payment.activeMethodLast4,
      Card_Brand__c: this.props.submission.payment.cardBrand,
      Unioni_se_ProviderID__c: this.props.submission.payment.memberProviderId
    };
    // console.log("is Card_Brand__c populated here?");
    // console.log(updates);
    this.props.apiSF
      .updateSFDJR(id, updates)
      .then(result => {
        // console.log(result.payload);
        if (
          result.type === "UPDATE_SF_DJR_FAILURE" ||
          this.props.submission.error
        ) {
          // console.log(this.props.submission.error);
          return handleError(this.props.submission.error);
        }
      })
      .catch(err => {
        console.error(err);
        return handleError(err);
      });
  }

  async verifyRecaptchaScore() {
    // fetch token
    await this.props.recaptcha.execute();

    // then verify
    const token = this.props.submission.formPage1.reCaptchaValue;

    // check for token every 200ms until returned to avoid race condition
    (async () => {
      while (!token) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    })();
    if (token) {
      const result = await this.props.apiSubmission.verify(token).catch(err => {
        console.error(err);
        return handleError(this.props.translate("reCaptchaError"));
      });

      if (result) {
        // console.log(`recaptcha score: ${result.payload.score}`);
        return result.payload.score;
      }
    }
  }

  async getIframeExisting() {
    // console.log("getIframeExisting");
    const memberShortId =
      this.props.submission.payment.memberShortId ||
      this.props.submission.cape.memberShortId;
    const token = this.props.submission.payment.unioniseToken;
    return this.props.apiSF
      .getIframeExisting(token, memberShortId)
      .then(result => {
        // console.log(result);
        if (
          !result.payload.cardAddingUrl ||
          result.payload.message ||
          result.type === "GET_IFRAME_EXISTING_FAILURE"
        ) {
          // console.log(this.props.submission.error);
          return handleError(
            result.payload.message || this.props.submission.error
          );
        }
      })
      .catch(err => {
        console.error(err);
        return handleError(err);
      });
  }

  async getIframeNew(cape, capeAmount, capeAmountOther) {
    // console.log("getIframeNew");
    // console.log(capeAmount, capeAmountOther);
    const { formValues } = this.props;

    let birthdate;
    if (formValues.mm && formValues.dd && formValues.yyyy) {
      birthdate = formatBirthdate(formValues);
    }

    if (!formValues.preferredLanguage) {
      formValues.preferredLanguage = "English";
    }
    // convert language to ISO code for unioni.se
    let language = isoConv(formValues.preferredLanguage);
    if (language === "en") {
      language = "en-US";
    }
    if (language === "es") {
      language = "es-US";
    }

    // also make route for createPaymentRequest
    // writePaymentStatus back to our api

    let externalId;
    // console.log(`submissionId: ${this.props.submission.submissionId}`);
    if (this.props.submission.submissionId) {
      // console.log("found submission id");
      externalId = this.props.submission.submissionId;
    } else if (this.props.submission.cape.id) {
      // console.log("found cape id");
      externalId = this.props.submission.cape.id;
    } else {
      externalId = uuid();
    }

    // find employer object
    let employerObject = findEmployerObject(
      this.props.submission.employerObjects,
      formValues.employerName
    );
    if (employerObject) {
      console.log(`Agency #: ${employerObject.Agency_Number__c}`);
    } else if (formValues.employerName === "SEIU 503 Staff") {
      employerObject = findEmployerObject(
        this.props.submission.employerObjects,
        "SEIU LOCAL 503 OPEU"
      );
    } else {
      console.log(
        `no employerObject found for ${formValues.employerName}; no agency #`
      );
    }

    const employerExternalId =
      employerObject && employerObject.Agency_Number__c
        ? employerObject.Agency_Number__c.toString()
        : "SW001";

    const body = {
      firstName: formValues.firstName,
      lastName: formValues.lastName,
      address: {
        addressLine1: formValues.homeStreet,
        city: formValues.homeCity,
        state: formValues.homeState,
        zip: formValues.homeZip
      },
      email: formValues.homeEmail,
      cellPhone: formValues.mobilePhone,
      birthDate: birthdate,
      employerExternalId: employerExternalId,
      agreesToMessages: !formValues.textAuthOptOut,
      employeeExternalId: externalId
    };
    // console.log(body);

    if (!cape) {
      body.language = language;
    } else {
      // console.log("generating body for CAPE iFrame request");
      const donationAmount =
        capeAmount === "Other"
          ? parseFloat(capeAmountOther)
          : parseFloat(capeAmount);
      // console.log(donationAmount);
      body.deductionType = "CAPE";
      body.politicalType = "monthly";
      body.deductionAmount = donationAmount;
      body.deductionCurrency = "USD";
      body.deductionDayOfMonth = 10;
    }
    // console.log(JSON.stringify(body));

    this.props.apiSF
      .getIframeURL(body)
      .then(result => {
        // if unionise memberShortId already exists, then try again
        // and get existing
        // if (result.payload && result.payload.message.includes("Member with employeeExternalId")) {
        //   console.log('unionise acct already exists, trying again to fetch new');
        //   return this.getIframeURL(cape);
        // }
        console.log(`getIframeURL result:`);
        console.log(result.payload);
        console.log(
          `memberProviderId: ${this.props.submission.payment.memberProviderId}`
        );
        if (
          !result.payload.cardAddingUrl ||
          result.payload.message ||
          result.type === "GET_IFRAME_URL_FAILURE"
        ) {
          // console.log(this.props.submission.error);
          return handleError(
            result.payload.message || this.props.submission.error
          );
        }
      })
      .catch(err => {
        console.error(err);
        return handleError(err);
      });
  }

  async getUnioniseToken() {
    // console.log("getUnioniseToken");
    return this.props.apiSF
      .getUnioniseToken()
      .then(result => {
        // console.log(result.payload);
        if (
          !result.payload.access_token ||
          result.payload.message ||
          result.type === "GET_UNIONISE_TOKEN_FAILURE"
        ) {
          // console.log(this.props.submission.error);
          return handleError(
            result.payload.message || this.props.submission.error
          );
        }
        // return the access token to calling function
        return result.payload.access_token;
      })
      .catch(err => {
        console.error(err);
        return handleError(err);
      });
  }

  async getIframeURL(cape) {
    // console.log("getIframeURL");
    // first check if we have an existing unionise id
    // if so, we don't need to create a unionise member account; just fetch a
    // cardAddingURL from existing account
    let memberShortId =
      this.props.submission.payment.memberShortId ||
      this.props.submission.cape.memberShortId;
    console.log(`memberShortId: ${memberShortId}`);
    console.log(
      `memberProviderId: ${this.props.submission.payment.memberProviderId}`
    );
    const { formValues } = this.props;
    let capeAmount;
    if (cape) {
      capeAmount =
        formValues.capeAmount === "Other"
          ? parseFloat(formValues.capeAmountOther)
          : parseFloat(formValues.capeAmount);
    }
    if (!this.props.submission.salesforceId) {
      // console.log("lookup sf contact");
      await this.props.lookupSFContact(formValues);
    }
    if (!memberShortId && cape && this.props.submission.salesforceId) {
      // check if existing postgres CAPE OR SFDJR to fetch memberShortId
      console.log("FETCHING SFCAPE BY CONTACT ID");
      await this.getSFCAPEByContactId();
      await this.getSFDJRById();
      memberShortId =
        this.props.submission.payment.memberShortId ||
        this.props.submission.cape.memberShortId;
      console.log(`memberShortId: ${memberShortId}`);
      console.log(
        `memberProviderId: ${this.props.submission.payment.memberProviderId}`
      );
    }
    if (memberShortId) {
      // console.log("found memberShortId, getting unionise auth token");
      // first fetch an auth token to access secured unionise routes
      const access_token = await this.props.apiSF
        .getUnioniseToken()
        .catch(err => {
          console.error(err);
          return handleError(err);
        });
      // then get the card adding url for the existing account
      return this.getIframeExisting(access_token, memberShortId);
    } else {
      // console.log("########  no memberShortId found");
    }

    // if we don't have the memberShortId, then we need to create a new
    // unionise member record and return the cardAddingUrl
    return this.getIframeNew(cape, capeAmount).catch(err => {
      console.error(err);
    });
  }

  async saveLegalLanguage() {
    const { formValues } = this.props;
    // save legal_language to redux store before ref disappears
    let legalLanguage =
      this.props.legal_language.current.textContent ||
      this.props.legal_language.current.innerText ||
      "";
    // console.log(legalLanguage);
    if (formValues.directDepositAuth && this.props.direct_deposit.current) {
      console.log("directDepositAuth");
      legalLanguage = legalLanguage
        ? legalLanguage.concat(
            "<hr>",
            this.props.direct_deposit.current.innerHTML
          )
        : "";
    }
    if (formValues.directPayAuth && this.props.direct_pay.current) {
      console.log("directPayAuth");
      legalLanguage = legalLanguage.concat(
        "<hr>",
        this.props.direct_pay.current.innerHTML
      );
    }
    console.log(legalLanguage);
    this.props.apiSubmission.handleInput({
      target: { name: "legalLanguage", value: legalLanguage }
    });
  }

  async calculateAFHDuesRate(medicaidResidents) {
    // console.log("calculateAFHDuesRate");
    console.log(`medicaidResidents: ${medicaidResidents}`);
    let afhDuesRate = medicaidResidents * 14.84 + 2.75;
    // console.log(`afhDuesRate: ${afhDuesRate}`);
    this.props.apiSubmission.handleInput({
      target: { name: "afhDuesRate", value: afhDuesRate }
    });
  }

  async toggleCardAddingFrame(value) {
    // console.log("toggleCardAddingFrame");
    // console.log(value);
    const addCardArray = [
      "Add new card",
      "Agregar nueva tarjeta",
      "Добавить новую карту",
      "Thêm thẻ mới",
      "新增卡"
    ];
    const cardArray = [
      "Card",
      "Tarjeta de crédito",
      "Кредитная карта",
      "Thẻ tín dụng",
      "信用卡"
    ];
    const cardValues = [...addCardArray, ...cardArray];
    console.log(cardValues);
    if (cardValues.includes(value)) {
      await this.getIframeURL()
        // .then(() => console.log("got iFrameURL"))
        .catch(err => {
          console.error(err);
          return handleError(err);
        });
      this.props.apiSubmission.handleInput({
        target: { name: "paymentMethodAdded", value: false }
      });
      // console.log(
      //   `paymentMethodAdded 1058: ${
      //     this.props.submission.formPage1.paymentMethodAdded
      //   }`
      // );
      return this.props.apiSubmission.handleInput({
        target: { name: "newCardNeeded", value: true }
      });
    }
    this.props.apiSubmission.handleInput({
      target: { name: "paymentMethodAdded", value: true }
    });
    if (value === "Card" || value === "Check") {
      this.props.apiSubmission.handleInput({
        target: { name: "paymentType", value }
      });
    }
    if (value === "Use Existing" || value === "Check") {
      console.log("setting nCN to false, hiding iframe");
      return this.props.apiSubmission.handleInput({
        target: { name: "newCardNeeded", value: false }
      });
    }
  }

  // async saveSignature() {
  //   //   console.log("saveSignature");
  //   const { formValues } = this.props;
  //   // perform signature processing steps and save value to redux store
  //   // before ref disappears

  //   if (this.state.signatureType === "draw") {
  //     // console.log(`this.state.signagureType: ${this.state.signatureType}`);
  //     const sigUrl = await this.handleUpload(
  //       formValues.firstName,
  //       formValues.lastName
  //     ).catch(err => {
  //       console.error(err);
  //       return handleError(err);
  //     });
  //     // console.log(`signature url: ${sigUrl}`);
  //     this.props.apiSubmission.handleInput({
  //       target: { name: "signature", value: sigUrl }
  //     });
  //     return sigUrl;
  //   } else {
  //     // console.log(`this.state.signatureType: ${this.state.signatureType}`);
  //     // console.log(formValues.signature);
  //     return formValues.signature;
  //   }
  // }

  async postOneTimePayment() {
    // console.log("postOneTimePayment");
    const { formValues } = this.props;
    const donationAmount =
      formValues.capeAmount === "Other"
        ? parseFloat(formValues.capeAmountOther)
        : parseFloat(formValues.capeAmount);
    const memberShortId =
      this.props.submission.payment.memberShortId ||
      this.props.submission.cape.memberShortId;
    const body = {
      memberShortId,
      amount: {
        currency: "USD",
        amount: donationAmount
      },
      paymentPartType: "CAPE",
      description: "One-Time CAPE Contribution",
      plannedDatetime: new Date()
    };
    // console.log(body);

    const result = await this.props.apiSF.getUnioniseToken().catch(err => {
      console.error(err);
      return handleError(err);
    });

    // console.log(`access_token: ${!!result.payload.access_token}`);
    // console.log(result.payload.access_token);
    const oneTimePaymentResult = await this.props.apiSF
      .postOneTimePayment(result.payload.access_token, body)
      .catch(err => {
        console.error(err);
        return handleError(err);
      });

    if (
      oneTimePaymentResult.type !== "POST_ONE_TIME_PAYMENT_SUCCESS" ||
      this.props.submission.error
    ) {
      // console.log(this.props.submission.error);
      return handleError(this.props.submission.error);
    }
  }

  async checkCAPEPaymentLogic() {
    // console.log("checkCAPEPaymentLogic");
    const { formValues } = this.props;

    await this.handleEmployerTypeChange(formValues.employerType);
    await this.handleDonationFrequencyChange(formValues.donationFrequency);

    const newState = { ...this.state };
    newState.displayCAPEPaymentFields = true;
    this.setState(newState, () => {
      // console.log(this.state.displayCAPEPaymentFields);
    });
  }

  async generateCAPEBody(capeAmount, capeAmountOther) {
    // console.log("generateCAPEBody");
    // console.log(capeAmount, capeAmountOther);
    const { formValues } = this.props;

    // if no contact in prefill or from previous form tabs...
    if (!this.props.submission.salesforceId) {
      await this.props.lookupSFContact(formValues);
    }

    // find employer object
    let employerObject = findEmployerObject(
      this.props.submission.employerObjects,
      formValues.employerName
    );

    if (employerObject) {
      // console.log(`employerId: ${employerObject.Id}`);
    } else if (formValues.employerName === "SEIU 503 Staff") {
      employerObject = findEmployerObject(
        this.props.submission.employerObjects,
        "SEIU LOCAL 503 OPEU"
      );
    } else {
      console.log(
        `no employerObject found for ${formValues.employerName}; no agency #`
      );
    }
    // console.log(employerObject);
    // decide whether to use prefilled employer id (worksite level),
    // or user-chosen employer id (employer level)
    let employerId;
    if (
      this.props.submission.formPage1 &&
      this.props.submission.formPage1.prefillEmployerId
    ) {
      if (!this.props.submission.formPage1.prefillEmployerChanged) {
        // if this is a prefill and employer has not been changed manually,
        // return original prefilled employer Id
        // this will be a worksite-level account id in most cases
        employerId = this.props.submission.formPage1.prefillEmployerId;
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

    // set campaign source
    const q = queryString.parse(this.props.location.search);
    console.log(q);
    const campaignSource =
      q && q.s ? q.s : q && q.src ? q.src : "Direct seiu503signup";

    console.log(campaignSource);

    // set body fields
    const checkoff = this.props.submission.formPage1.checkoff;
    const oneTime = formValues.donationFrequency === "One-Time";
    const paymentMethod = checkoff && !oneTime ? "Checkoff" : "Unionise";
    let donationAmount =
      capeAmount === "Other"
        ? parseFloat(capeAmountOther)
        : parseFloat(capeAmount);
    // console.log(capeAmountOther);
    // console.log(capeAmount);
    // console.log(`donationAmount: ${donationAmount}`);

    if (!donationAmount || typeof donationAmount !== "number") {
      console.log("no donation amount chosen");
      const newState = { ...this.state };
      newState.displayCAPEPaymentFields = true;

      return this.setState(newState, () => {
        console.log(this.state.displayCAPEPaymentFields);
      });
    }

    // generate body
    const body = {
      submission_date: utils.formatDate(new Date()),
      contact_id: this.props.submission.salesforceId,
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
      cape_legal: this.props.cape_legal.current.innerHTML,
      cape_amount: donationAmount,
      cape_status: "Incomplete",
      donation_frequency: formValues.donationFrequency || "Monthly"
      // member_short_id: this.props.submission.payment.memberShortId
    };
    // console.log(body);
    return body;
  }

  // create an initial CAPE record in postgres to get returned ID
  // not finalized until payment method added and SFCAPE status updated
  async createCAPE(capeAmount, capeAmountOther) {
    // console.log("createCAPE");
    const body = await this.generateCAPEBody(capeAmount, capeAmountOther);
    // console.log(body);
    if (body) {
      const capeResult = await this.props.apiSubmission
        .createCAPE(body)
        .catch(err => {
          console.error(err);
          return handleError(err);
        });

      if (
        (capeResult && capeResult.type !== "CREATE_CAPE_SUCCESS") ||
        this.props.submission.error
      ) {
        console.log(this.props.submission.error);
        return handleError(this.props.submission.error);
      }
    } else {
      console.log("no CAPE body generated");
    }
  }

  async handleCAPESubmit(standAlone) {
    // console.log("handleCAPESubmit");
    const { formValues } = this.props;

    if (standAlone) {
      // verify recaptcha score
      await this.verifyRecaptchaScore()
        .then(score => {
          // console.log(`score: ${score}`);
          if (!score || score <= 0.5) {
            // console.log(`recaptcha failed: ${score}`);
            return handleError(this.props.translate("reCaptchaError"));
          }
        })
        .catch(err => {
          console.error(err);
        });
    }
    if (
      ((this.props.submission.formPage1.paymentRequired &&
        this.props.submission.formPage1.newCardNeeded) ||
        formValues.donationFrequency === "One-Time") &&
      !this.props.submission.formPage1.paymentMethodAdded
    ) {
      // console.log("No payment method added");
      return handleError(this.props.translate("addPaymentError"));
    }
    // if user clicks submit before the payment logic finishes loading,
    // they may not have donation amount fields visible
    // but will still get an error that the field is missing
    if (!formValues.capeAmount && !formValues.capeAmountOther) {
      // console.log("no donation amount chosen");
      const newState = { ...this.state };
      newState.displayCAPEPaymentFields = true;
      return this.setState(newState, () => {
        // console.log(this.state.displayCAPEPaymentFields);
      });
    }

    let cape_errors = "",
      cape_status = "Pending";
    const body = await this.generateCAPEBody(
      formValues.capeAmount,
      formValues.capeAmountOther
    );
    delete body.cape_status;
    body.member_short_id =
      this.props.submission.payment.memberShortId ||
      this.props.submission.cape.memberShortId;
    // write CAPE contribution to SF
    const sfCapeResult = await this.props.apiSF
      .createSFCAPE(body)
      .catch(err => {
        cape_errors += err;
        cape_status = "Error";
        console.error(err);
        handleError(err);
      });

    let sf_cape_id;

    if (
      (sfCapeResult && sfCapeResult.type !== "CREATE_SF_CAPE_SUCCESS") ||
      this.props.submission.error
    ) {
      cape_errors += this.props.submission.error;
      cape_status = "Error";
      // console.log(this.props.submission.error);
      return handleError(this.props.submission.error);
    } else if (sfCapeResult && sfCapeResult.type === "CREATE_SF_CAPE_SUCCESS") {
      cape_status = "Success";
      sf_cape_id = sfCapeResult.payload.sf_cape_id;
    } else {
      cape_status = "Error";
    }

    const member_short_id =
      this.props.submission.payment.memberShortId ||
      this.props.submission.cape.memberShortId;
    // console.log(`member_short_id: ${member_short_id}`);

    // if initial cape was not already created
    // in the process of generating the iframe url,
    // (checkoff use case), create it now
    if (!this.props.submission.cape.id) {
      await this.createCAPE(
        formValues.capeAmount,
        formValues.capeAmountOther
      ).catch(err => {
        console.error(err);
        return handleError(err);
      });
    }

    // if one-time payment, send API request to unioni.se to process it
    if (formValues.donationFrequency === "One-Time") {
      await this.postOneTimePayment().catch(err => {
        console.error(err);
        return handleError(err);
      });
    }

    // collect updates to cape record (values returned from other API calls,
    // amount and frequency if not captured in initial iframe request)
    const { id, oneTimePaymentId } = this.props.submission.cape;
    const donationAmount =
      formValues.capeAmount === "Other"
        ? parseFloat(formValues.capeAmountOther)
        : parseFloat(formValues.capeAmount);
    const updates = {
      cape_status,
      cape_errors,
      member_short_id,
      one_time_payment_id: oneTimePaymentId,
      cape_amount: donationAmount,
      donation_frequency: formValues.donationFrequency,
      active_method_last_four: this.props.submission.cape.activeMethodLast4,
      card_brand: this.props.submission.cape.cardBrand
    };

    // update CAPE record in postgres
    await this.props.apiSubmission.updateCAPE(id, updates).catch(err => {
      console.error(err);
      // return handleError(err); // don't return to client here
    });
    // console.log(capeResult);

    // if this was a unionise CAPE payment
    // then update the activeMethodLast4, card brand, and
    // payment id (if one-time payment) in SF
    if (
      oneTimePaymentId ||
      !!this.props.submission.cape.activeMethodLast4 ||
      !!this.props.submission.cape.cardBrand
    ) {
      // generate body for this call
      const sfCapeBody = {
        Id: sf_cape_id,
        One_Time_Payment_Id__c: oneTimePaymentId,
        Active_Account_Last_4__c: this.props.submission.cape.activeMethodLast4,
        Card_Brand__c: this.props.submission.cape.cardBrand
      };

      // console.log(sfCapeBody);

      const result = await this.props.apiSF
        .updateSFCAPE(sfCapeBody)
        .catch(err => {
          console.error(err);
          return handleError(err);
        });

      if (
        !result ||
        result.type !== "UPDATE_SF_CAPE_SUCCESS" ||
        this.props.submission.error
      ) {
        // console.log(this.props.submission.error);
        return handleError(this.props.submission.error);
      }
    }

    if (!standAlone) {
      const params = queryString.parse(this.props.location.search);
      const embed = params.embed ? "&embed=true" : "";
      this.props.history.push(
        `/page2/?cId=${this.props.submission.salesforceId}&sId=${
          this.props.submission.submissionId
        }${embed}`
      );
    } else {
      openSnackbar("success", "Thank you. Your CAPE submission was processed.");

      this.props.history.push(`/thankyou/?cape=true`);
    }
  }

  async handleTab2() {
    const { formValues } = this.props;
    // submit validation: signature
    // const signature = await this.saveSignature().catch(err => {
    //   // console.log(err);
    //   return handleError(err);
    // });
    if (!formValues.signature) {
      console.log(this.props.translate("provideSignatureError"));
      return handleError(this.props.translate("provideSignatureError"));
    }
    // for AFH, calculate dues rate:
    if (formValues.employerType.toLowerCase() === "adult foster home") {
      this.calculateAFHDuesRate(formValues.medicaidResidents);
    }

    // save legal language
    this.saveLegalLanguage();

    // save partial submission (need to do this before generating iframe URL)
    await this.props.createSubmission(formValues).catch(err => {
      console.error(err);
      return handleError(err);
    });

    // if payment required, check if existing payment method on file
    if (this.props.submission.formPage1.paymentRequired) {
      await this.getSFDJRById(this.props.submission.salesforceId)
        .then(result => {
          // console.log(result.type);
          // console.log("SFDJR record: existing");
          // console.log(result.payload);

          const validMethod =
            !!result.payload.Active_Account_Last_4__c &&
            !result.payload.Payment_Error_Hold__c;

          if (validMethod) {
            // console.log("newCardNeeded");
            this.props.apiSubmission.handleInput({
              target: { name: "newCardNeeded", value: false }
            });
          }

          // if payment required (and no existing payment method)
          // preload iframe url for next tab
          if (this.props.submission.formPage1.paymentRequired && !validMethod) {
            this.getIframeURL().catch(err => {
              console.error(err);
              return handleError(err);
            });
          }
        })
        .catch(err => {
          console.error(err);
          return handleError(err);
        });
    }

    // move to next tab
    return this.props.changeTab(2);
  }

  async handleTab1() {
    const { formValues } = this.props;
    // verify recaptcha score
    const score = await this.verifyRecaptchaScore();
    if (!score || score <= 0.3) {
      console.log(`recaptcha failed: ${score}`);
      return handleError(this.props.translate("reCaptchaError"));
    }
    // handle moving from tab 1 to tab 2:

    // check if payment is required and store this in redux store for later
    if (utils.isPaymentRequired(formValues.employerType)) {
      await this.props.apiSubmission.handleInput({
        target: { name: "paymentRequired", value: true }
      });
      this.props.apiSubmission.handleInput({
        target: { name: "howManyTabs", value: 4 }
      });
    } else {
      this.props.apiSubmission.handleInput({
        target: { name: "howManyTabs", value: 3 }
      });
    }

    // check if SF contact id already exists (prefill case)
    if (this.props.submission.salesforceId) {
      // update existing contact, move to next tab
      await this.props.updateSFContact(formValues).catch(err => {
        console.error(err);
        return handleError(err);
      });
      return this.props.changeTab(1);
    }

    // otherwise, lookup contact by first/last/email
    await this.props.lookupSFContact(formValues).catch(err => {
      console.error(err);
      return handleError(err);
    });

    // if lookup was successful, update existing contact and move to next tab
    if (this.props.submission.salesforceId) {
      await this.props.updateSFContact(formValues).catch(err => {
        console.error(err);
        return handleError(err);
      });
      return this.props.changeTab(1);
    }

    // otherwise, create new contact with submission data,
    // then move to next tab
    await this.props.createSFContact(formValues).catch(err => {
      console.error(err);
      return handleError(err);
    });
    return this.props.changeTab(1);
  }

  handleTab(newValue) {
    if (newValue === 1) {
      return this.handleTab1().catch(err => {
        console.error(err);
        return handleError(err);
      });
    }
    if (newValue === 2) {
      return this.handleTab2().catch(err => {
        console.error(err);
        return handleError(err);
      });
    } else {
      return this.props.changeTab(newValue);
    }
  }

  render() {
    const fullName = `${
      this.props.submission &&
      this.props.submission.formPage1 &&
      this.props.submission.formPage1.firstName
        ? this.props.submission.formPage1.firstName
        : ""
    } ${
      this.props.submission &&
      this.props.submission.formPage1 &&
      this.props.submission.formPage1.lastName
        ? this.props.submission.formPage1.lastName
        : ""
    }`;
    return (
      <div data-test="container-submission-form-page-1">
        <Modal
          open={
            this.state.open &&
            fullName.length &&
            !this.props.submission.redirect
          }
          handleCloseAndClear={this.handleCloseAndClear}
          handleClose={this.handleClose}
          fullName={fullName}
          history={this.props.history}
        />
        <SubmissionFormPage1Wrap
          {...this.props}
          change={change}
          tab={this.props.tab}
          howManyTabs={this.props.submission.formPage1.howManyTabs}
          handleTab={this.handleTab}
          back={this.props.changeTab}
          handleUpload={this.handleUpload}
          signatureType={this.state.signatureType}
          toggleSignatureInputType={this.toggleSignatureInputType}
          clearSignature={this.clearSignature}
          handleError={handleError}
          toggleCardAddingFrame={this.toggleCardAddingFrame}
          handleCAPESubmit={this.handleCAPESubmit}
          suggestedAmountOnChange={this.suggestedAmountOnChange}
          verifyRecaptchaScore={this.verifyRecaptchaScore}
          handleEmployerTypeChange={this.handleEmployerTypeChange}
          handleEmployerChange={this.handleEmployerChange}
          handleDonationFrequencyChange={this.handleDonationFrequencyChange}
          checkCAPEPaymentLogic={this.checkCAPEPaymentLogic}
          displayCAPEPaymentFields={this.state.displayCAPEPaymentFields}
          handleCAPEOpen={this.handleCAPEOpen}
          handleCAPEClose={this.handleCAPEClose}
          capeOpen={this.state.capeOpen}
          closeDialog={this.closeDialog}
          mobilePhoneOnBlur={this.mobilePhoneOnBlur}
        />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  submission: state.submission,
  appState: state.appState,
  content: state.content,
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
  apiContent: bindActionCreators(apiContentActions, dispatch),
  apiSF: bindActionCreators(apiSFActions, dispatch),
  actions: bindActionCreators(actions, dispatch),
  submitForm: () => dispatch(submit("submissionPage1"))
});

export const SubmissionFormPage1Connected = connect(
  mapStateToProps,
  mapDispatchToProps
)(SubmissionFormPage1Container);

export default withLocalize(
  withStyles(stylesPage1)(SubmissionFormPage1Connected)
);
