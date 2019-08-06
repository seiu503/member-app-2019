import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

const styles = theme => ({
  modalButtonRed: {
    backgroundColor: theme.palette.danger.main,
    display: "block",
    textTransform: "none",
    width: "100%",
    marginBottom: 20,
    padding: 15,
    color: "white",
    fontSize: "1.2em",
    "&:hover": {
      backgroundColor: theme.palette.danger.light
    }
  },
  modalButtonGreen: {
    backgroundColor: theme.palette.success.main,
    display: "block",
    textTransform: "none",
    width: "100%",
    marginLeft: 0,
    color: "white",
    fontSize: "1.2em",
    padding: 15,
    "&:hover": {
      backgroundColor: theme.palette.success.light
    }
  },
  dialogActionsOverride: {
    display: "block",
    padding: 15
  }
});

function Modal(props) {
  const { classes } = props;
  return (
    <div>
      <Dialog
        open={props.open}
        onClose={props.handleModalClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        data-test="component-modal"
      >
        <DialogTitle id="alert-dialog-title">{`Are you ${
          props.fullName
        }?`}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {`This form is customized especially for ${props.fullName}.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions className={classes.dialogActionsOverride}>
          <Button
            onClick={props.handleModalClose}
            className={classes.modalButtonRed}
          >
            {`I'm not ${props.fullName}, get me my own link.`}
          </Button>
          <Button
            onClick={props.handleModalClose}
            className={classes.modalButtonGreen}
            autoFocus
          >
            {`Yes, I'm ${props.fullName}`}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

Modal.propTypes = {
  open: PropTypes.bool,
  fullName: PropTypes.string,
  handleModalClose: PropTypes.func,
  classes: PropTypes.object
};

export default withStyles(styles)(Modal);
