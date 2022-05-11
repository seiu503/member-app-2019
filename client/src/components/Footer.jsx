import PropTypes from "prop-types";
import { Translate } from "react-localize-redux";

const Footer = props => (
  <div className={props.classes.footer} data-testid="component-footer">
    <a
      href="https://seiu503.tfaforms.net/490"
      rel="noopener noreferrer"
      target="_blank"
      style={{ color: "white" }}
    >
      <Translate id="reportProblem">Report a problem with this form</Translate>
    </a>
  </div>
);

Footer.propTypes = {
  classes: PropTypes.object
};

export default Footer;
