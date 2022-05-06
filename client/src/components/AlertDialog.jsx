import PropTypes from "prop-types";

import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  DialogContentText
} from "@mui/material";
import { withStyles } from "@mui/styles";
import { Translate } from "react-localize-redux";

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
          <Translate id="cancel" />
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
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  content: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  buttonText: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  handleClose: PropTypes.func,
  action: PropTypes.func,
  classes: PropTypes.object
};

export default withStyles(styles)(AlertDialogUnwrapped);
