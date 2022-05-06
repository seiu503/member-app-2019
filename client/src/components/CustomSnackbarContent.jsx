import PropTypes from "prop-types";
import classNames from "classnames";

import { green, amber } from "@mui/material/colors";
import { SnackbarContent, IconButton } from "@mui/material";
import {
  CheckCircleIcon,
  WarningIcon,
  ErrorIcon,
  InfoIcon,
  CloseIcon
} from "@mui/icons-material";
import { withStyles } from "@mui/styles";

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
