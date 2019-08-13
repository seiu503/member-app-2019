import React from "react";
import { Field } from "redux-form";
import { reduxForm } from "redux-form";
import SignatureCanvas from "react-signature-canvas";

import FormLabel from "@material-ui/core/FormLabel";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import RadioGroup from "@material-ui/core/RadioGroup";
import Radio from "@material-ui/core/Radio";
import FormHelperText from "@material-ui/core/FormHelperText";
import Button from "@material-ui/core/Button";
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
    sigBox,
    clearSignature,
    handleInput,
    formPage1
  } = props;
  return (
    <div data-test="component-tab2" className={classes.sectionContainer}>
      <form
        onSubmit={props.handleSubmit(onSubmit)}
        id="tab2"
        className={classes.form}
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
        <FormHelperText
          className={classes.formHelperTextLegal}
          id="termsOfServiceLegalLanguage"
          ref={legal_language}
        >
          Your full name, the network address you are accessing this page from,
          and the timestamp of submission will serve as signature indicating: I
          hereby designate SEIU Local 503, OPEU (or any successor Union entity)
          as my desired collective bargaining agent. I also hereby authorize my
          employer to deduct from my wages, commencing with the next payroll
          period, all Union dues and other fees or assessments as shall be
          certified by SEIU Local 503, OPEU (or any successor Union entity) and
          to remit those amounts to such Union. This authorization/delegation is
          unconditional, made in consideration for the cost of representation
          and other actions in my behalf by the Union and is made irrespective
          of my membership in the Union. This authorization is irrevocable for a
          period of one year from the date of execution and from year to year
          thereafter unless not less than thirty (30) and not more than
          forty-five (45) days prior to the end of any annual period or the
          termination of the contract between my employer and the Union,
          whichever occurs first, I notify the Union and my employer in writing,
          with my valid signature, of my desire to revoke this authorization.
        </FormHelperText>
        <FormControl component="fieldset" className={classes.formControl}>
          <FormLabel component="legend" className={classes.radioLabel}>
            Signature Type
          </FormLabel>
          <RadioGroup
            aria-label="Signature Type"
            name="signatureType"
            className={classes.groupLeft}
            value={formPage1.signatureType}
            onChange={handleInput}
          >
            <FormControlLabel value="write" control={<Radio />} label="Write" />
            <FormControlLabel value="draw" control={<Radio />} label="Draw" />
          </RadioGroup>
        </FormControl>
        {formPage1.signatureType === "write" && (
          <Field
            label="Signature"
            name="signature"
            id="signature"
            type="text"
            classes={classes}
            component={renderTextField}
          />
        )}
        {formPage1.signatureType === "write" && (
          <FormHelperText className={classes.formHelperText}>
            Enter your full legal name. This will act as your signature.
          </FormHelperText>
        )}
        {formPage1.signatureType === "draw" && (
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
        )}
        {formPage1.signatureType === "draw" && (
          <FormHelperText className={classes.formHelperText}>
            Draw your signature in the box above.
          </FormHelperText>
        )}
        <div className={classes.buttonWrap}>
          <Button
            type="button"
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
  formPage1: PropTypes.object
};

// add reduxForm to component
export const Tab2Form = reduxForm({
  form: "submissionPage1",
  validate,
  destroyOnUnmount: false, // <------ preserve form data
  forceUnregisterOnUnmount: true,
  enableReinitialize: true,
  keepDirtyOnReinitialize: true
})(Tab2);

export default Tab2Form;
