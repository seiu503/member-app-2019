import React from "react";
import { Field } from "redux-form";
import { reduxForm } from "redux-form";
import SignatureCanvas from "react-signature-canvas";

import FormHelperText from "@material-ui/core/FormHelperText";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import PropTypes from "prop-types";

import validate from "../utils/validators";

export const Tab2 = props => {
  const {
    onSubmit,
    classes,
    renderTextField,
    renderCheckbox,
    handleTab,
    legal_language,
    direct_pay,
    direct_deposit,
    sigBox,
    clearSignature,
    handleInput,
    signatureType,
    toggleSignatureInputType,
    formValues
  } = props;
  return (
    <div data-test="component-tab2" className={classes.sectionContainer}>
      <form
        onSubmit={props.handleSubmit(onSubmit)}
        id="tab2"
        className={classes.form}
        style={{ paddingTop: 40 }}
      >
        <Field
          formControlName="controlCheckbox"
          label="Agree to Terms of Membership"
          name="termsAgree"
          id="termsAgree"
          type="checkbox"
          classes={classes}
          component={renderCheckbox}
        />
        <div
          className={classes.formHelperTextLegal}
          id="termsOfServiceLegalLanguage"
          ref={legal_language}
        >
          <p>
            Your full name, the network address you are accessing this page
            from, and the timestamp of submission will serve as signature
            indicating:
          </p>
          <p>
            I hereby designate SEIU Local 503, OPEU (or any successor Union
            entity) as my desired collective bargaining agent. I also hereby
            authorize my employer to deduct from my wages, commencing with the
            next payroll period, all Union dues and other fees or assessments as
            shall be certified by SEIU Local 503, OPEU (or any successor Union
            entity) and to remit those amounts to such Union. This
            authorization/delegation is unconditional, made in consideration for
            the cost of representation and other actions in my behalf by the
            Union and is made irrespective of my membership in the Union.
          </p>
          <p>
            This authorization is irrevocable for a period of one year from the
            date of execution and from year to year thereafter unless not less
            than thirty (30) and not more than forty-five (45) days prior to the
            end of any annual period or the termination of the contract between
            my employer and the Union, whichever occurs first, I notify the
            Union and my employer in writing, with my valid signature, of my
            desire to revoke this authorization.
          </p>
        </div>

        {formValues.employerType.toLowerCase() ===
          "state homecare or personal support" && (
          <React.Fragment>
            <Field
              formControlName="controlCheckbox"
              label="Direct Pay Authorization"
              name="directPayAuth"
              id="directPayAuth"
              type="checkbox"
              classes={classes}
              component={renderCheckbox}
            />
            <div
              className={classes.formHelperTextLegal}
              id="directPayAuthLegalLanguage"
              ref={direct_pay}
            >
              <p>
                Your full name, the network address you are accessing this page
                from, and the timestamp of submission will serve as signature
                indicating:
              </p>
              <p>
                In the event payroll deduction from my employer is not available
                or is not deemed practical by the Union, I authorize SEIU Local
                503 to make withdrawals from my checking or savings account, in
                accordance with the authorization provided below or to another
                account I provide and authorize separately. I am authorized to
                make decisions about the account provided to the Union. SEIU
                will notify me of the transition to direct pay at the current
                mailing address on file with SEIU prior to initiating the first
                payment via debit card, credit card, checking, or savings
                account, as authorized below.
              </p>
              <p>
                I hereby authorize SEIU to initiate a recurring, automatic
                electronic funds transfer with my financial institution
                beginning on the date listed in the transition notice provided
                to me in order to deduct from the account listed below (or
                separately provided) amount of 1.7% of my gross earnings, and
                issue fund payments at a prorated amount up to $2.75 per month,
                except that the total minimum deduction shall be no less than
                $2.30 per pay period and the maximum deduction shall be no more
                than $150 per pay period. Because the dues deduction is based on
                a percentage of gross earnings, the dollar amount deducted may
                change each month based on payroll dates and if my hours of work
                or rate of pay changes, and I agree to not receive any advance
                notice before the dues payment is deducted as long as the amount
                is between $2.30 and $150 per pay period. My authorized
                deductions shall be made based on the gross pay amount in the
                paycheck immediately preceding the pay processing date of the
                current transaction and shall be made one (1) business day after
                each pay processing date designated by my employer.
              </p>
              <p>
                The dues amount may change if authorized according to the
                requirements of the SEIU Local 503 Union Bylaws or the Service
                Employees International Union Constitution and Bylaws. If this
                happens, I authorize SEIU to initiate a recurring, automatic
                electronic funds transfer in the amount of the new dues amount
                when notified by SEIU in writing of the new amount and with at
                least ten (10) days’ notice before the next funds transfer date.
                In the case of checking and savings accounts, adjusting entries
                to correct errors are also authorized. I agree that these
                withdrawals and adjustments may be made electronically and under
                the Rules of the National Automated Clearing House Association.
                This authorization shall remain in effect until I revoke my
                authorization in writing or with another permitted method.
              </p>
              <p>
                I acknowledge that failure to pay my dues on a timely basis may
                affect my membership standing in the Union, as set forth in the
                SEIU Local 503 Bylaws. Contributions to SEIU are not tax
                deductible as charitable contributions. However, they may be tax
                deductible as ordinary and necessary business expenses.
              </p>
            </div>

            <Field
              formControlName="controlCheckbox"
              label="Direct Deposit Authorization"
              name="directDepositAuth"
              id="directDepositAuth"
              type="checkbox"
              classes={classes}
              component={renderCheckbox}
            />
            <div
              className={classes.formHelperTextLegal}
              id="directDepositAuthLegalLanguage"
              ref={direct_deposit}
            >
              <p>
                Your full name, the network address you are accessing this page
                from, and the timestamp of submission will serve as signature
                indicating:
              </p>
              <p>
                I authorize the State of Oregon, or its fiscal agents, to
                provide SEIU Local 503’s Designated Secure Payment Processor
                (DSPP), my HCW/PSW UID, and the information for the bank account
                (bank account number, account holder’s name and routing number)
                on file with my employer (“Account”) that I have designated to
                receive the proceeds of my paycheck via direct deposit, and for
                my dues and/or other contributions to be deducted from this
                account one (1) business day after each pay processing date
                designated by my employer. If my employer makes direct deposit
                of my paycheck to a checking account and a savings account, I
                hereby authorize my employer to provide to Local 503’s DSPP the
                information for the checking account and for my dues and/or
                other contributions to be deducted from this account one (1)
                business day after each pay processing date designated by my
                employer.
              </p>
              <p>
                I understand that after the DSPP receives my Account
                information, SEIU or its designee will make reasonable efforts
                to contact me to confirm the accuracy of the Account information
                provided by my employer at least 10 days in advance of making
                the first electronic funds transfer from my Account.
              </p>
              <p>
                I understand it is my responsibility to notify the Union of any
                changes to my Account information.
              </p>
            </div>
          </React.Fragment>
        )}
        <Typography component="h3" className={classes.fieldLabel}>
          Signature
        </Typography>
        {signatureType === "write" && (
          <React.Fragment>
            <Field
              label="Signature"
              name="signature"
              id="signature"
              type="text"
              classes={classes}
              component={renderTextField}
            />
            <FormHelperText className={classes.formHelperText}>
              Enter your full legal name. This will act as your signature.
            </FormHelperText>
          </React.Fragment>
        )}
        {signatureType === "draw" && (
          <React.Fragment>
            <div className={classes.sigBox}>
              <SignatureCanvas
                ref={sigBox}
                penColor="black"
                canvasProps={{
                  width: 594,
                  height: 100,
                  className: "sigCanvas"
                }}
                backgroundColor="rgb(255,255,255)"
                label="Signature"
                name="signature"
                id="signature"
                onChange={handleInput}
              />
              <Button
                type="button"
                onClick={clearSignature}
                color="secondary"
                className={classes.clearButton}
                variant="contained"
              >
                Clear Signature
              </Button>
            </div>
            <FormHelperText className={classes.formHelperText}>
              Draw your signature in the box above.&nbsp;
              <button
                type="button"
                data-test="button-sig-toggle"
                className={classes.buttonLink}
                aria-label="Change Signature Input Method"
                name="signatureType"
                onClick={() => toggleSignatureInputType()}
              >
                Click here to type your signature
              </button>
            </FormHelperText>
          </React.Fragment>
        )}
        <div className={classes.buttonWrap}>
          <Button
            type="button"
            data-test="button-back"
            onClick={e => handleTab(e, 0)}
            color="primary"
            className={classes.back}
            variant="contained"
          >
            Back
          </Button>
          <Button
            type="submit"
            color="primary"
            className={classes.next}
            variant="contained"
          >
            Next
          </Button>
        </div>
      </form>
    </div>
  );
};

Tab2.propTypes = {
  onSubmit: PropTypes.func,
  classes: PropTypes.object,
  renderTextField: PropTypes.func,
  renderCheckbox: PropTypes.func,
  handleTab: PropTypes.func,
  legal_language: PropTypes.object,
  sigBox: PropTypes.object,
  clearSignature: PropTypes.func,
  handleInput: PropTypes.func,
  formPage1: PropTypes.object,
  signatureType: PropTypes.string,
  toggleSignatureInputType: PropTypes.func
};

// add reduxForm to component
export const Tab2Form = reduxForm({
  form: "submissionPage1",
  validate,
  destroyOnUnmount: false, // <------ preserve form data
  forceUnregisterOnUnmount: true,
  enableReinitialize: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true
})(Tab2);

export default Tab2Form;
