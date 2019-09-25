import React from "react";
import { Field, reduxForm, getFormValues } from "redux-form";
import { connect } from "react-redux";
import Iframe from "react-iframe";
import { ReCaptcha } from "react-recaptcha-v3";
import { Translate } from "react-localize-redux";

import ButtonWithSpinner from "./ButtonWithSpinner";
import Button from "@material-ui/core/Button";
import * as formElements from "./SubmissionFormElements";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import FormLabel from "@material-ui/core/FormLabel";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormGroup from "@material-ui/core/FormGroup";
import withWidth, { isWidthUp } from "@material-ui/core/withWidth";
import FormatQuote from "@material-ui/icons/FormatQuote";

import headshot from "../img/deffo_mebrat_300.png";

import PropTypes from "prop-types";

import { capeValidate } from "../utils/validators";
import { scrollToFirstError } from "../utils";

// change to class component and add getDJRRate on componentDidMount for standalone prefills (only needed for prefill with contact id AND !checkoff)
// if standalone blank slate skip DJR call, just require payment by default if !checkoff

export const CAPE = props => {
  const {
    handleCAPESubmit,
    classes,
    loading,
    iFrameURL,
    back,
    checkoff,
    formValues,
    formPage1,
    payment,
    width,
    renderSelect,
    renderTextField,
    renderCheckbox,
    toggleCardAddingFrame,
    suggestedAmountOnChange,
    standAlone,
    verifyCallback,
    employerTypesList,
    updateEmployersPicklist,
    handleEmployerTypeChange,
    employerList,
    cape_legal,
    newCardNeeded
  } = props;

  const validMethod = !!payment.activeMethodLast4 && !payment.paymentErrorHold;
  console.log(`paymentMethodAdded: ${formPage1.paymentMethodAdded}`);

  return (
    <div data-test="component-cape" className={classes.sectionContainer}>
      <form
        onSubmit={props.handleSubmit(() => handleCAPESubmit(standAlone))}
        id="CAPE"
        className={classes.form}
      >
        <div className={classes.paymentCopy}>
          <Typography component="h2" className={classes.head}>
            <Translate id="capeHeadline">
              Contribute to CAPE: Citizen Action for Political Education
            </Translate>
          </Typography>
          <Typography component="p" className={classes.subhead}>
            <Translate id="capeSubhead">
              Collective political action to raise wages, protect benefits, fund
              public services, and build strong communities.
            </Translate>
          </Typography>
          <Typography component="p" className={classes.body}>
            <Translate id="capeBody1">
              When workers unite, legislators listen. In 2019, SEIU Local 503
              CAPE advocacy led to historic wins:
            </Translate>
          </Typography>
          <ul className={classes.ul}>
            <li className={classes.li}>
              <Translate id="capeBullet1">
                Funding for raises and benefits for state employees and homecare
                workers are double what they were in the last budget, setting
                members up for strong contracts
              </Translate>
            </li>
            <li className={classes.li}>
              <Translate id="capeBullet2">
                Oregon passed the strongest Paid Family and Medical Leave law in
                the nation
              </Translate>
            </li>
            <li className={classes.li}>
              <Translate id="capeBullet3">
                Our state became the first in the U.S. to pass statewide rent
                stabilization and ban no-cause evictions
              </Translate>
            </li>
          </ul>
          <Card className={classes.card}>
            <div className={classes.details}>
              <CardContent className={classes.content}>
                <Typography
                  component="h5"
                  variant="h5"
                  className={classes.cardHead}
                >
                  <Translate id="capeCardHead">Join us</Translate>
                </Typography>
                <div style={{ position: "relative" }}>
                  <FormatQuote
                    style={{
                      color: "#531078",
                      transform: "scaleX(-1)",
                      position: "absolute",
                      top: -3,
                      left: -5,
                      opacity: 0.8
                    }}
                  />
                  <Typography component="p" className={classes.pullQuote}>
                    <Translate id="capePullQuote">
                      I can’t write big checks. But I contribute what I can each
                      month to CAPE. And when we put all of our resources
                      together, we have shown we can elect legislators in Oregon
                      who will fight for working families and our clients.
                    </Translate>
                  </Typography>
                  <FormatQuote
                    style={{
                      color: "#531078",
                      position: "absolute",
                      bottom: 5,
                      right: -10,
                      opacity: 0.8
                    }}
                  />
                </div>
                <Typography component="p" className={classes.quoteAttr}>
                  <Translate id="capeQuoteAttr">
                    &mdash;Deffo Mebrat, Adult Foster Care Provider
                  </Translate>
                </Typography>
              </CardContent>
            </div>
            <CardMedia
              className={classes.cover}
              image={headshot}
              title="Deffo Mebrat"
            />
          </Card>
        </div>
        <div className={classes.paymentCopy}>
          <Typography component="h2" className={classes.head}>
            <Translate id="capePaymentHead">
              Make your contribution today
            </Translate>
          </Typography>
          <div className={classes.suggestedAmounts}>
            <div className={classes.suggestedAmountBoxes}>
              <Field
                data-test="radio-cape-amount"
                label="Monthly donation amount"
                name="capeAmount"
                formControlName="capeAmount"
                id="capeAmount"
                direction="horiz"
                className={classes.horizRadio}
                classes={classes}
                component={formElements.renderCAPERadioGroup}
                options={[10, 13, 15, "Other"]}
                additionalOnChange={suggestedAmountOnChange}
              />
            </div>
          </div>
        </div>
        {formValues.capeAmount === "Other" && (
          <Field
            data-test="field-other-amount"
            label="Monthly Donation Amount"
            name="capeAmountOther"
            id="capeAmountOther"
            type="number"
            inputProps={{ min: 1 }}
            classes={classes}
            component={renderTextField}
          />
        )}
        {standAlone && (
          <div data-test="form-contact-info">
            <FormGroup row classes={{ root: classes.formGroup2Col }}>
              <Field
                twocol
                mobile={!isWidthUp("sm", width)}
                label="First Name"
                name="firstName"
                id="firstName"
                type="text"
                classes={{ input2col: classes.input2col }}
                component={renderTextField}
              />

              <Field
                twocol
                mobile={!isWidthUp("sm", width)}
                name="lastName"
                id="lastName"
                label="Last Name"
                classes={{ input2col: classes.input2col }}
                component={renderTextField}
                type="text"
              />
            </FormGroup>

            <FormLabel className={classes.formLabel} component="legend">
              <Translate id="birthDate" />
            </FormLabel>
            <FormGroup row classes={{ root: classes.formGroup2ColShort }}>
              <Field
                label="Month"
                name="mm"
                id="mm"
                type="select"
                classes={classes}
                formControlName="formControlDate"
                component={renderSelect}
                labelWidth={41}
                options={formElements.monthList}
              />

              <Field
                label="Day"
                name="dd"
                id="dd"
                type="select"
                formControlName="formControlDate"
                classes={classes}
                component={renderSelect}
                labelWidth={24}
                options={formElements.dateOptions(props)}
              />

              <Field
                label="Year"
                name="yyyy"
                id="yyyy"
                type="select"
                formControlName="formControlDate"
                classes={classes}
                component={renderSelect}
                labelWidth={30}
                options={formElements.yearOptions()}
              />
            </FormGroup>

            <FormLabel className={classes.formLabel} component="legend">
              Address
            </FormLabel>

            <Field
              label="Home Street"
              name="homeStreet"
              id="homeStreet"
              type="text"
              classes={classes}
              component={renderTextField}
            />
            <FormGroup
              className={classes.formGroup}
              row
              classes={{ root: classes.formGroup2Col }}
            >
              <Field
                label="Home City"
                name="homeCity"
                id="homeCity"
                type="text"
                twocol
                mobile={!isWidthUp("sm", width)}
                classes={classes}
                component={renderTextField}
              />

              <Field
                label="Home State"
                name="homeState"
                id="homeState"
                type="select"
                short
                mobile={!isWidthUp("sm", width)}
                classes={classes}
                component={renderSelect}
                options={formElements.stateList}
                labelWidth={80}
              />

              <Field
                label="Home Zip"
                name="homeZip"
                id="homeZip"
                short
                mobile={!isWidthUp("sm", width)}
                type="text"
                classes={classes}
                component={renderTextField}
              />
            </FormGroup>

            <Field
              label="Home Email"
              name="homeEmail"
              id="homeEmail"
              type="email"
              classes={classes}
              component={renderTextField}
            />

            <FormHelperText className={classes.formHelperText}>
              <Translate id="homeEmailHint" />
            </FormHelperText>
            <FormGroup>
              <Field
                label="Mobile Phone†"
                name="mobilePhone"
                id="mobilePhone"
                type="tel"
                classes={classes}
                component={renderTextField}
              />

              <FormHelperText className={classes.formHelperText}>
                <Translate id="phoneLegalLanguage" />
              </FormHelperText>

              <Field
                label="Opt Out Of Receiving Mobile Alerts"
                name="textAuthOptOut"
                id="textAuthOptOut"
                type="checkbox"
                formControlName="controlCheckbox"
                classes={classes}
                component={renderCheckbox}
              />
            </FormGroup>

            <Field
              data-test="select-employer-type"
              label="Employer Type"
              name="employerType"
              id="employerType"
              type="select"
              classes={classes}
              component={renderSelect}
              options={employerTypesList}
              onChange={e => {
                updateEmployersPicklist(e);
                handleEmployerTypeChange(e.target.value).then(() => {
                  console.log(`checkoff: ${checkoff}`);
                });
              }}
              labelWidth={100}
            />
            {formValues.employerType !== "" && (
              <Field
                labelWidth={104}
                label="Employer Name"
                name="employerName"
                id="employerName"
                type="select"
                classes={classes}
                component={renderSelect}
                options={employerList}
              />
            )}
          </div>
        )}
        <Field
          label="Job Title"
          name="jobTitle"
          id="jobTitle"
          type="text"
          classes={classes}
          component={renderTextField}
        />
        {formPage1.paymentRequired &&
          formPage1.paymentType === "Card" &&
          validMethod && (
            <div data-test="component-choose-card">
              <Typography component="p" className={classes.body}>
                <Translate id="existingPaymentMethod">
                  Your existing payment method on file is the card ending in
                </Translate>{" "}
                {payment.activeMethodLast4}.
              </Typography>
              <Field
                data-test="radio-which-card"
                label="Do you want to use the existing card or add a new one?"
                name="whichCard"
                formControlName="whichCard"
                id="whichCard"
                direction="horiz"
                className={classes.horizRadio}
                legendClass={classes.horizRadioBold}
                classes={classes}
                defaultItem="Use existing"
                additionalOnChange={toggleCardAddingFrame}
                component={formElements.renderRadioGroup}
                options={["Use existing", "Add new card"]}
              />
            </div>
          )}
        {iFrameURL &&
          (formPage1.newCardNeeded || newCardNeeded) &&
          formPage1.paymentRequired && (
            <div data-test="component-iframe">
              <Typography component="h2" className={classes.head}>
                <Translate id="addPayment">Add a payment method</Translate>
              </Typography>
              <div className={classes.iframeWrap}>
                <Iframe
                  url={iFrameURL}
                  width="100%"
                  height="100px"
                  id="iFrame"
                  className={classes.iframe}
                  display="initial"
                  position="relative"
                />
              </div>
            </div>
          )}
        <div className={classes.legalCopy} ref={cape_legal}>
          <p>
            <Translate
              id={checkoff ? "capeLegalCheckoff1" : "capeLegalStripe1"}
            />
          </p>
          <p>
            <Translate id="capeLegal2" />
          </p>
          <p>
            <Translate id="capeLegal3" />
          </p>
          <p>
            <Translate id="capeLegal4" />
          </p>
          <p>
            <Translate id="capeLegal5" />
          </p>
          <p>
            <Translate id="capeLegal6" />
          </p>
        </div>
        {standAlone && (
          <ReCaptcha
            sitekey="6LdzULcUAAAAAJ37JEr5WQDpAj6dCcPUn1bIXq2O"
            action="standalone_cape_submit"
            verifyCallback={verifyCallback}
          />
        )}
        {!standAlone && (
          <div className={classes.buttonWrapTab3}>
            <Button
              type="button"
              data-test="button-back"
              onClick={() => back(1)}
              color="primary"
              className={classes.back}
              variant="contained"
            >
              <Translate id="back">Back</Translate>
            </Button>
          </div>
        )}
        <ButtonWithSpinner
          type="submit"
          color="primary"
          className={classes.formButton}
          variant="contained"
          loading={loading}
        >
          <Translate id="submitButton">Submit</Translate>
        </ButtonWithSpinner>
      </form>
    </div>
  );
};

CAPE.propTypes = {
  onSubmit: PropTypes.func,
  classes: PropTypes.object,
  verifyCallback: PropTypes.func,
  loading: PropTypes.bool,
  pristine: PropTypes.bool,
  invalid: PropTypes.bool
};

const mapStateToProps = state => ({
  submission: state.submission,
  initialValues: state.submission.formPage1,
  formValues: getFormValues("submissionPage1")(state) || {}
});

// add reduxForm to component
export const CAPEForm = reduxForm({
  form: "submissionPage1",
  validate: capeValidate,
  destroyOnUnmount: false,
  forceUnregisterOnUnmount: true, // <------ unregister fields on unmount
  enableReinitialize: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  onSubmitFail: errors => scrollToFirstError(errors)
})(CAPE);

// connect to redux store
export const CAPEConnected = connect(mapStateToProps)(CAPEForm);

export default withWidth()(CAPEConnected);
