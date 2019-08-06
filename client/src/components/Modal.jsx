import React from "react";
import PropTypes from "prop-types";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

export default function Modal(props) {
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
        <DialogActions>
          <Button onClick={props.handleModalClose} color="error">
            {`I'm not ${props.fullName}, get me my own link.`}
          </Button>
          <Button onClick={props.handleModalClose} color="primary" autoFocus>
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
  handleModalClose: PropTypes.func
};
