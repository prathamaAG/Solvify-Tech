import React from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { TextField, MenuItem, Button, Stack } from "@mui/material";
import CommonModal from "./Modal.component";
import dayjs from "dayjs";

const statusOptions = [
    { label: "Pending", value: "pending" },
    { label: "In Progress", value: "in progress" },
    { label: "Completed", value: "completed" },
];

// Validation Schema using Yup
const validationSchema = Yup.object().shape({
    project_name: Yup.string().required("Project name is required"),
    description: Yup.string(),
    start_date: Yup.string().required("Start date is required"),
    due_date: Yup.string().required("Due date is required"),
    status: Yup.string().required("Status is required"),
    technology: Yup.string().required("Technology is required"),
});

const EditProjectForm = ({ open, onClose, onSubmit, initialValues }) => {
    // Format dates for the form inputs
    const formattedInitialValues = {
        ...initialValues,
        start_date: initialValues.start_date.format("YYYY-MM-DD"),
        due_date: initialValues.due_date.format("YYYY-MM-DD")
    };

    return (
        <CommonModal open={open} onClose={onClose} title="Edit Project">
            <Formik
                initialValues={formattedInitialValues}
                validationSchema={validationSchema}
                onSubmit={(values) => {
                    onSubmit({
                        ...values,
                        start_date: dayjs(values.start_date).format("YYYY-MM-DD"),
                        due_date: dayjs(values.due_date).format("YYYY-MM-DD")
                    });
                    onClose();
                }}
                enableReinitialize
            >
                {({ values, handleChange, errors, touched }) => (
                    <Form>
                        <Stack spacing={2}>
                            {/* Project Name */}
                            <TextField
                                name="project_name"
                                label="Project Name"
                                value={values.project_name}
                                onChange={handleChange}
                                error={touched.project_name && Boolean(errors.project_name)}
                                helperText={touched.project_name && errors.project_name}
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

                            {/* Start Date */}
                            <TextField
                                name="start_date"
                                label="Start Date"
                                type="date"
                                value={values.start_date}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                                error={touched.start_date && Boolean(errors.start_date)}
                                helperText={touched.start_date && errors.start_date}
                                required
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

                            {/* Status Dropdown */}
                            <TextField
                                name="status"
                                label="Status"
                                select
                                value={values.status}
                                onChange={handleChange}
                                error={touched.status && Boolean(errors.status)}
                                helperText={touched.status && errors.status}
                                required
                            >
                                {statusOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>

                            {/* Technology */}
                            <TextField
                                name="technology"
                                label="Technology"
                                value={values.technology}
                                onChange={handleChange}
                                error={touched.technology && Boolean(errors.technology)}
                                helperText={touched.technology && errors.technology}
                                required
                            />

                            {/* Submit Button */}
                            <Button type="submit" variant="contained" color="primary">
                                Update Project
                            </Button>
                        </Stack>
                    </Form>
                )}
            </Formik>
        </CommonModal>
    );
};

export default EditProjectForm;