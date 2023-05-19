import React from "react";
import PropTypes from "prop-types";
import { Translate } from "react-localize-redux";
import { Box } from "@mui/material";

const FormThankYou = React.forwardRef((props, ref) => {
  return (
    <Box
      data-testid="component-thankyou"
      sx={{
        margin: "auto",
        width: {
          xs: "100%",
          md: "50%"
        },
        textAlign: "center",
        height: {
          xs: "100%",
          md: "50%"
        },
        lineHeight: "2em",
        background: "white",
        borderRadius: "4px",
        padding: "60px",
        fontSize: "1.2em"
      }}
    >
      <p>
        <Translate id="infoSubmitted" />
        <br />
        <Translate id="thankYou" />
      </p>

      <a href="https://www.seiu503.org">
        <Translate id="clickToVisit" />
      </a>
    </Box>
  );
});

FormThankYou.propTypes = {
  classes: PropTypes.object
};

export default FormThankYou;
