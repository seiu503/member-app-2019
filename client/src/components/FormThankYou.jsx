import PropTypes from "prop-types";
import { Translate } from "react-localize-redux";

const FormThankYou = props => (
  <div className={props.classes.message} data-test="component-thankyou">
    {!props.paymentRequired && (
      <p>
        <Translate id="infoSubmitted">
          Your information has been submitted.
        </Translate>
        <br />
        <Translate id="thankYou" />
      </p>
    )}
    {props.paymentRequired && (
      <p className={props.classes.thankYouCopy}>
        <Translate id="directPayNextSteps_2022" />
      </p>
    )}
    <a href="https://www.seiu503.org">
      <Translate id="clickToVisit">Click Here to visit SEIU503.org</Translate>
    </a>
  </div>
);

FormThankYou.propTypes = {
  classes: PropTypes.object
};

export default FormThankYou;
