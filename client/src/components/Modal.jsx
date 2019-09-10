import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import { Translate } from "react-localize-redux";

const styles = theme => ({
  modalButtonRed: {
    backgroundColor: "#b71c1c", // theme.palette.danger.main
    display: "block",
    textTransform: "none",
    width: "100%",
    marginBottom: 20,
    padding: 15,
    color: "white",
    fontSize: "1.2em",
    "&:hover": {
      backgroundColor: "#d32f2f" // theme.palette.danger.light
    }
  },
  modalButtonGreen: {
    backgroundColor: "#43A047", // theme.palette.success.main,
    display: "block",
    textTransform: "none",
    width: "100%",
    marginLeft: 0,
    color: "white",
    fontSize: "1.2em",
    padding: 15,
    "&:hover": {
      backgroundColor: "#66BB6A" // theme.palette.success.light
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
        data-test="component-modal"
        open={props.open}
        onClose={props.handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          <Translate id="modalTitle" /> {`${props.fullName}?`}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <Translate id="modalDescription" /> {`${props.fullName}.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions className={classes.dialogActionsOverride}>
          <Button
            data-test="button-link-request"
            onClick={() => props.history.push("/linkrequest")}
            className={classes.modalButtonRed}
          >
            <Translate id="modalErrorButtonPreName" />
            {`${props.fullName}`}
            <Translate id="modalErrorButtonPostName" />
          </Button>
          <Button
            onClick={props.handleClose}
            className={classes.modalButtonGreen}
            autoFocus
          >
            <Translate id="modalConfirmButton" /> {`${props.fullName}`}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

Modal.propTypes = {
  open: PropTypes.bool,
  fullName: PropTypes.string,
  handleClose: PropTypes.func,
  classes: PropTypes.object,
  history: PropTypes.shape({
    push: PropTypes.func
  })
};

export default withStyles(styles)(Modal);
