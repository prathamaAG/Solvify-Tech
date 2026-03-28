import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";

const CommonModal = ({ open, onClose, title, children }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {title}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>{children}</DialogContent>
      {/* <DialogActions>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        {onSubmit && <Button onClick={onSubmit} variant="contained" color="primary">Submit</Button>} 
      </DialogActions> */}
    </Dialog>
  );
};

export default CommonModal;