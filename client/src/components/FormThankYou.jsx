import PropTypes from "prop-types";
import { Translate } from "react-localize-redux";

const FormThankYou = props => (
  <div className={props.classes.message} data-test="component-thankyou">
    <p>
      <Translate id="infoSubmitted">
        Your information has been submitted.
      </Translate>
      <br />
      <Translate id="thankYou" />
    </p>
    <a href="https://www.seiu503.org">
      <Translate id="clickToVisit">Click Here to visit SEIU503.org</Translate>
    </a>
  </div>
);

FormThankYou.propTypes = {
  classes: PropTypes.object
};

export default FormThankYou;
