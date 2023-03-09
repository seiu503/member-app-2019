import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import { green, amber } from "@mui/material/colors";
import { SnackbarContent, IconButton } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import CloseIcon from "@mui/icons-material/Close";

import { theme } from "../styles/theme";
import { withStyles } from "@mui/styles";

const variantIcon = {
  success: () => <CheckCircleIcon />,
  warning: () => <WarningIcon />,
  error: () => <ErrorIcon />,
  info: () => <InfoIcon />
};

const styles = theme => ({
  success: {
    backgroundColor: green[600]
  },
  error: {
    backgroundColor: theme.palette.error.dark
  },
  info: {
    backgroundColor: theme.palette.primary.dark
  },
  warning: {
    backgroundColor: amber[700]
  },
  icon: {
    fontSize: 20
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: 15
  },
  message: {
    display: "flex",
    alignItems: "center"
  },
  button: {
    background: "transparent"
  }
});

export const CustomSnackbarContent = React.forwardRef((props, ref) => {
  const {
    classes,
    className,
    message,
    onClose,
    variant,
    // action,
    ...other
  } = props;
  const Icon = variantIcon[variant];
  return (
    <SnackbarContent
      className={classNames(classes[variant], className)}
      data-testid="component-custom-snackbar"
      aria-describedby="client-snackbar"
      ref={ref}
      message={
        <span
          id="client-snackbar"
          className={classes.message}
          data-testid="message"
        >
          <Icon
            className={classNames(classes.icon, classes.iconVariant)}
            data-testid="message-icon"
            ref={ref}
          />
          {message}
        </span>
      }
      action={[
        // actionButton,
        <IconButton
          key="close"
          aria-label="Close"
          color="inherit"
          className={classes.close}
          onClick={onClose}
          data-testid="icon-button"
          ref={ref}
        >
          <CloseIcon className={classes.icon} data-testid="close-icon" />
        </IconButton>
      ]}
      {...other}
    />
  );
});

CustomSnackbarContent.propTypes = {
  classes: PropTypes.object.isRequired,
  className: PropTypes.string,
  message: PropTypes.node,
  onClose: PropTypes.func,
  variant: PropTypes.oneOf(["success", "warning", "error", "info"]).isRequired
};
const CustomSnackbarContentWrapper = withStyles(styles)(CustomSnackbarContent);
export default CustomSnackbarContentWrapper;
