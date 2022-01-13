import PropTypes from "prop-types";
import { Translate } from "react-localize-redux";

const FormThankYou = props => (
  <div className={props.classes.message} data-test="component-thankyou">
    {!props.paymentRequired && (
      <p>
        <Translate id="infoSubmitted" />
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
      <Translate id="clickToVisit" />
    </a>
  </div>
);

FormThankYou.propTypes = {
  classes: PropTypes.object
};

export default FormThankYou;
