import React from "react";
import PropTypes from "prop-types";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import { withStyles } from "@material-ui/core/styles";

export const styles = theme => ({
  root: {
    margin: 0,
    padding: 20
  },
  danger: {
    backgroundColor: theme.palette.danger.main,
    color: "white",
    "&:hover": {
      backgroundColor: theme.palette.danger.light
    }
  },
  primary: {
    backgroundColor: theme.palette.primary.main
  }
});

export const AlertDialogUnwrapped = props => (
  <div data-test="component-alert-dialog">
    <Dialog
      data-test="dialog"
      open={props.open}
      onClose={props.handleClose}
      aria-labelledby={
        props.title ? "alert-dialog-title" : "alert-dialog-description"
      }
      aria-describedby="alert-dialog-description"
      PaperProps={{ style: { margin: 0 } }}
    >
      {props.title && (
        <DialogTitle id="alert-dialog-title" data-test="dialog-title">
          {props.title}
        </DialogTitle>
      )}
      <DialogContent>
        <DialogContentText
          id="alert-dialog-description"
          data-test="dialog-content"
        >
          {props.content}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={props.handleClose}
          variant="outlined"
          color="default"
          data-test="button-cancel"
        >
          Cancel
        </Button>
        <Button
          onClick={props.action}
          className={
            props.danger ? props.classes.danger : props.classes.primary
          }
          variant="contained"
          autoFocus
          data-test="button-action"
        >
          {props.buttonText}
        </Button>
      </DialogActions>
    </Dialog>
  </div>
);

AlertDialogUnwrapped.propTypes = {
  open: PropTypes.bool,
  title: PropTypes.string,
  content: PropTypes.string,
  buttonText: PropTypes.string,
  handleClose: PropTypes.func,
  action: PropTypes.func,
  classes: PropTypes.object
};

export default withStyles(styles)(AlertDialogUnwrapped);
