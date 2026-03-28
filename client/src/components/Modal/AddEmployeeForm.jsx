import React, { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Grid,
    FormControl,
    InputLabel,
    Select,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";

const AddEmployeeForm = ({ open, onClose, onSubmit }) => {
    const [loading, setLoading] = useState(false);

    const validationSchema = Yup.object().shape({
        name: Yup.string().required("Full name is required"),
        email: Yup.string().email("Invalid email").required("Email is required"),
        mobile_no: Yup.string()
            .matches(/^[0-9]{10}$/, "Mobile number must be 10 digits")
            .required("Mobile number is required"),
        role: Yup.string().required("Role is required"),
        password: Yup.string()
            .min(8, "Password must be at least 8 characters")
            .optional(),
    });

    const formik = useFormik({
        initialValues: {
            name: "",
            email: "",
            mobile_no: "",
            role: "user",
            password: "",
        },
        validationSchema,
        onSubmit: async (values) => {
            setLoading(true);
            try {
                await onSubmit(values);
                onClose();
            } catch (error) {
                console.error("Error submitting form:", error);
            } finally {
                setLoading(false);
            }
        },
    });

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Add New Employee</DialogTitle>
            <form onSubmit={formik.handleSubmit}>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Full Name"
                                name="name"
                                value={formik.values.name}
                                onChange={formik.handleChange}
                                error={formik.touched.name && Boolean(formik.errors.name)}
                                helperText={formik.touched.name && formik.errors.name}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                type="email"
                                value={formik.values.email}
                                onChange={formik.handleChange}
                                error={formik.touched.email && Boolean(formik.errors.email)}
                                helperText={formik.touched.email && formik.errors.email}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Mobile Number"
                                name="mobile_no"
                                value={formik.values.mobile_no}
                                onChange={formik.handleChange}
                                error={
                                    formik.touched.mobile_no && Boolean(formik.errors.mobile_no)
                                }
                                helperText={
                                    formik.touched.mobile_no && formik.errors.mobile_no
                                }
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Role</InputLabel>
                                <Select
                                    name="role"
                                    value={formik.values.role}
                                    onChange={formik.handleChange}
                                    label="Role"
                                    error={formik.touched.role && Boolean(formik.errors.role)}
                                >
                                    <MenuItem value="user">User</MenuItem>
                                    <MenuItem value="admin">Admin</MenuItem>
                                    <MenuItem value="manager">Manager</MenuItem>
                                    <MenuItem value="senior developer">Senior Developer</MenuItem>
                                    <MenuItem value="developer">Developer</MenuItem>
                                    <MenuItem value="hr">HR</MenuItem>
                                    <MenuItem value="qa">QA</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Password (Leave blank to generate random)"
                                name="password"
                                type="password"
                                value={formik.values.password}
                                onChange={formik.handleChange}
                                error={
                                    formik.touched.password && Boolean(formik.errors.password)
                                }
                                helperText={formik.touched.password && formik.errors.password}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="contained" color="primary" disabled={loading}>
                        {loading ? "Saving..." : "Save"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default AddEmployeeForm;