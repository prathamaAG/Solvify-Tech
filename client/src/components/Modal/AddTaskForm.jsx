import React from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { TextField, Button, Stack, MenuItem, InputLabel, Select, FormControl } from "@mui/material";
import CommonModal from "./Modal.component";

// **Validation Schema using Yup**
const validationSchema = Yup.object().shape({
    title: Yup.string().required("Title is required"),
    description: Yup.string(),
    due_date: Yup.string().required("Due date is required"),
    priority: Yup.string().required("Priority is required"),
});

const AddTaskForm = ({ open, onClose, onSubmit, card_id, position }) => {
    return (
        <CommonModal open={open} onClose={onClose} title="Add Task">
            <Formik
                initialValues={{
                    title: "",
                    description: "",
                    due_date: "",
                    priority: "", // Add priority to initial values
                }}
                validationSchema={validationSchema}
                onSubmit={(values, { resetForm }) => {
                    // Add card_id and position to the task data
                    const taskData = {
                        ...values,
                        card_id: card_id, // Automatically fetched from props
                        position: position, // Set to the last position
                    };
                    onSubmit(taskData); // Submit the task data
                    resetForm();
                    onClose();
                }}
            >
                {({ values, handleChange, errors, touched }) => (
                    <Form>
                        <Stack spacing={2}>
                            {/* Title */}
                            <TextField
                                name="title"
                                label="Title"
                                value={values.title}
                                onChange={handleChange}
                                error={touched.title && Boolean(errors.title)}
                                helperText={touched.title && errors.title}
                                required
                            />

                            {/* Description */}
                            <TextField
                                name="description"
                                label="Description"
                                value={values.description}
                                onChange={handleChange}
                                multiline
                                rows={3}
                            />

                            {/* Due Date */}
                            <TextField
                                name="due_date"
                                label="Due Date"
                                type="date"
                                value={values.due_date}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                                error={touched.due_date && Boolean(errors.due_date)}
                                helperText={touched.due_date && errors.due_date}
                                required
                            />

                            {/* Priority Dropdown */}
                            <FormControl fullWidth>
                                <InputLabel id="priority-label">Priority *</InputLabel>
                                <Select
                                    name="priority"
                                    labelId="priority-label"
                                    label="Priority *"
                                    value={values.priority}
                                    onChange={handleChange}
                                    error={touched.priority && Boolean(errors.priority)}
                                >
                                    <MenuItem value="High">High</MenuItem>
                                    <MenuItem value="Medium">Medium</MenuItem>
                                    <MenuItem value="Low">Low</MenuItem>
                                </Select>
                                {touched.priority && errors.priority && (
                                    <div style={{ color: '#f44336', fontSize: '0.75rem', margin: '3px 14px 0' }}>
                                        {errors.priority}
                                    </div>
                                )}
                            </FormControl>

                            {/* Submit Button */}
                            <Button type="submit" variant="contained" color="primary">
                                Submit
                            </Button>
                        </Stack>
                    </Form>
                )}
            </Formik>
        </CommonModal>
    );
};

export default AddTaskForm;