import PropTypes from "prop-types";
import { Translate } from "react-localize-redux";
import { Box } from "@mui/material";

const Footer = props => (
  <Box
    data-testid="component-footer"
    sx={{
      width: "100vw",
      margin: "auto",
      position: "fixed",
      backgroundColor: "#2c0940", // dark purple // theme.palette.primary.main,
      bottom: 0,
      padding: {
        xs: 0,
        sm: "25px"
      },
      height: {
        xs: "53px",
        sm: "73px"
      },
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "middle",
      boxShadow: "0 1px 5px 2px rgba(0,0,0,.2)",
      zIndex: 2,
      color: "white"
    }}
  >
    <a
      href="https://seiu503.tfaforms.net/490"
      rel="noopener noreferrer"
      target="_blank"
      style={{ color: "white", textAlign: "center" }}
    >
      <Translate id="reportProblem">Report a problem with this form</Translate>
    </a>
  </Box>
);

Footer.propTypes = {
  classes: PropTypes.object
};

export default Footer;
