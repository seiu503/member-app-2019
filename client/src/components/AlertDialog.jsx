import PropTypes from "prop-types";

import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  DialogContentText
} from "@mui/material";
import { theme } from "../styles/theme";
import { withStyles } from "@mui/styles";
import { Trans } from "react-i18next";
import withRouter from "./ComponentWithRouterProp";

const styles = theme => ({
  root: {
    margin: 0,
    padding: 20
  },
  danger: {
    backgroundColor: "#b71c1c", // theme.palette.danger.main
    color: "white",
    "&:hover": {
      backgroundColor: "#d32f2f" // theme.palette.danger.light
    }
  },
  primary: {
    backgroundColor: "#2c0940" // theme.palette.primary.main
  }
});

export const AlertDialog = props => {
  console.log('AlertDialog');
  return (
  <div data-testid="component-alert-dialog">
    <Dialog
      data-testid="dialog"
      id="dialog"
      open={props.open}
      onClose={props.handleClose}
      aria-labelledby={
        props.title ? "alert-dialog-title" : "alert-dialog-description"
      }
      aria-describedby="alert-dialog-description"
      PaperProps={{ style: { margin: 0 } }}
    >
      {props.title && (
        <DialogTitle id="alert-dialog-title" data-testid="dialog-title">
          {props.title}
        </DialogTitle>
      )}
      <DialogContent>
        <DialogContentText
          id="alert-dialog-description"
          data-testid="dialog-content"
        >
          {props.content}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={props.handleClose}
          variant="outlined"
          data-testid="button-cancel"
        >
          <Trans i18nKey="cancel" />
        </Button>
        <Button
          onClick={props.action}
          className={
            props.danger ? props.classes.danger : props.classes.primary
          }
          variant="contained"
          autoFocus
          data-testid="button-action"
        >
          {props.buttonText}
        </Button>
      </DialogActions>
    </Dialog>
  </div>
)
};

AlertDialog.propTypes = {
  open: PropTypes.bool,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  content: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  buttonText: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  handleClose: PropTypes.func,
  action: PropTypes.func,
  classes: PropTypes.object
};

const AlertDialogWrapper = withStyles(styles)(withRouter(AlertDialog));
export default AlertDialogWrapper;
// export default AlertDialog;
