import React from "react";
import {
    Modal,
    Box,
    TextField,
    Button,
    MenuItem,
    Typography,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    Stack
} from "@mui/material";

const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 450,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 3,
    borderRadius: "12px",
    outline: "none",
};

const EditCardForm = ({ open, onClose, onSubmit, onDelete, card }) => {
    const [title, setTitle] = React.useState(card?.title || "");
    const [description, setDescription] = React.useState(card?.description || "");
    const [priority, setPriority] = React.useState(card?.priority || "low");
    const [confirmOpen, setConfirmOpen] = React.useState(false);
    const [errors, setErrors] = React.useState({});

    React.useEffect(() => {
        if (card) {
            setTitle(card.title);
            setDescription(card.description || "");
            setPriority(card.priority || "low");
        }
    }, [card]);

    const validate = () => {
        const newErrors = {};
        if (!title.trim()) newErrors.title = "Title is required";
        if (title.length > 50) newErrors.title = "Title must be less than 50 characters";
        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        onSubmit({
            card_id: card.card_id,
            title,
            description,
            priority,
        });
    };

    const handleDeleteConfirm = () => {
        onDelete(card.card_id);
        setConfirmOpen(false);
        onClose();
    };

    const handleClose = () => {
        setErrors({});
        onClose();
    };

    return (
        <>
            <Modal open={open} onClose={handleClose}>
                <Box sx={modalStyle}>
                    <Typography variant="h6" component="h2" fontWeight={600} mb={2}>
                        Edit Card
                    </Typography>
                    <Divider sx={{ mb: 3 }} />

                    <form onSubmit={handleSubmit}>
                        <Stack spacing={3}>
                            <TextField
                                label="Card Title"
                                fullWidth
                                variant="outlined"
                                size="small"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                error={!!errors.title}
                                helperText={errors.title}
                                required
                                inputProps={{ maxLength: 50 }}
                            />

                            <TextField
                                label="Description"
                                fullWidth
                                variant="outlined"
                                size="small"
                                multiline
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                inputProps={{ maxLength: 200 }}
                            />

                            <TextField
                                select
                                label="Priority"
                                fullWidth
                                variant="outlined"
                                size="small"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                            >
                                <MenuItem value="low">Low</MenuItem>
                                <MenuItem value="medium">Medium</MenuItem>
                                <MenuItem value="high">High</MenuItem>
                            </TextField>
                        </Stack>

                        <Box sx={{
                            mt: 4,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}>
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={() => setConfirmOpen(true)}
                                sx={{
                                    textTransform: 'none',
                                    borderRadius: '6px',
                                    px: 2
                                }}
                            >
                                Delete Card
                            </Button>

                            <Stack direction="row" spacing={1}>
                                <Button
                                    onClick={handleClose}
                                    sx={{
                                        textTransform: 'none',
                                        borderRadius: '6px',
                                        px: 2
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    sx={{
                                        textTransform: 'none',
                                        borderRadius: '6px',
                                        px: 2.5,
                                        fontWeight: 500
                                    }}
                                >
                                    Save Changes
                                </Button>
                            </Stack>
                        </Box>
                    </form>
                </Box>
            </Modal>

            <Dialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                PaperProps={{
                    sx: {
                        borderRadius: '12px',
                        padding: 1
                    }
                }}
            >
                <DialogTitle fontWeight={600}>Delete Card</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this Card? All tasks in this Card will also be permanently deleted.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() => setConfirmOpen(false)}
                        sx={{
                            textTransform: 'none',
                            borderRadius: '6px',
                            px: 2
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        color="error"
                        variant="contained"
                        sx={{
                            textTransform: 'none',
                            borderRadius: '6px',
                            px: 2.5,
                            fontWeight: 500
                        }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default EditCardForm;