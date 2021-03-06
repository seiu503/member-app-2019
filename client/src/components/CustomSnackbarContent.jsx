import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import CloseIcon from "@material-ui/icons/Close";
import green from "@material-ui/core/colors/green";
import amber from "@material-ui/core/colors/amber";
import IconButton from "@material-ui/core/IconButton";
import SnackbarContent from "@material-ui/core/SnackbarContent";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import WarningIcon from "@material-ui/icons/Warning";
import ErrorIcon from "@material-ui/icons/Error";
import InfoIcon from "@material-ui/icons/Info";
import { withStyles } from "@material-ui/core/styles";

const variantIcon = {
  success: CheckCircleIcon,
  warning: WarningIcon,
  error: ErrorIcon,
  info: InfoIcon
};

const styles1 = theme => ({
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

export const CustomSnackbarContent = props => {
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
  // let actionButton = null;
  // if (action) {
  //   actionButton = action(props);
  // }
  return (
    <SnackbarContent
      className={classNames(classes[variant], className)}
      data-test="component-custom-snackbar"
      aria-describedby="client-snackbar"
      message={
        <span
          id="client-snackbar"
          className={classes.message}
          data-test="message"
        >
          <Icon
            className={classNames(classes.icon, classes.iconVariant)}
            data-test="message-icon"
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
          data-test="icon-button"
        >
          <CloseIcon className={classes.icon} data-test="close-icon" />
        </IconButton>
      ]}
      {...other}
    />
  );
};

CustomSnackbarContent.propTypes = {
  classes: PropTypes.object.isRequired,
  className: PropTypes.string,
  message: PropTypes.node,
  onClose: PropTypes.func,
  variant: PropTypes.oneOf(["success", "warning", "error", "info"]).isRequired
};
const CustomSnackbarContentWrapper = withStyles(styles1)(CustomSnackbarContent);
export default CustomSnackbarContentWrapper;
