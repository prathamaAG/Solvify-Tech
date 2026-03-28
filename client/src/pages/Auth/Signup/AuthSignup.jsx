import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
    Box,
    Button,
    Divider,
    FormHelperText,
    Grid,
    TextField,
    Typography,
    FormControl,
    InputLabel,
    OutlinedInput,
    InputAdornment,
    IconButton,
    FormControlLabel,
    Checkbox
} from '@mui/material';
import toast, { Toaster } from 'react-hot-toast';
import { apiService, commonService } from "../../../services";


// third party
import * as Yup from 'yup';
import { Formik } from 'formik';

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const AuthSignup = ({ ...rest }) => {
    const theme = useTheme();
    const [showPassword, setShowPassword] = React.useState(false);
    const [checked, setChecked] = React.useState(false);
    const navigate = useNavigate();
    ;
    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const handleSignup = async (values, actions) => {
        const loadingToast = toast.loading('Signing up...');
        try {
            const body = {
                name: values.name,
                email: values.email,
                mobile_no: values.mobile_no,
                password: values.password,
            };

            const response = await (apiService.PostAPICall("userSignUp", body));

            switch (response.status) {
                case 1:
                    commonService.resetAPIFlag("userSignUp", false);
                    toast.success("Sign-up successful! Please verify your email.", { id: loadingToast });
                    actions.resetForm();
                    navigate(`/verify-email-notification?email=${values.email}`);
                    break;
                case 0:
                    commonService.resetAPIFlag("userSignUp", false);
                    toast.error(response.message || "Email already in use.", { id: loadingToast });
                    actions.resetForm();
                    break;
                default:
                    commonService.resetAPIFlag("userSignUp", false);
                    toast.error("Unexpected error occurred. Please try again.", { id: loadingToast });
                    break;
            }
        } catch (error) {
            toast.error(error.response?.message || "An error occurred during sign-up.", { id: loadingToast });
        } finally {
            actions.setSubmitting(false);
        }
    };


    return (
        <>
            <Toaster position="top-center" reverseOrder={false} />
            <Formik
                initialValues={{
                    name: '',
                    email: '',
                    mobile_no: '',
                    password: '',
                    submit: null
                }}
                validationSchema={Yup.object().shape({
                    name: Yup.string().max(255).required('Name is required'),
                    email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
                    mobile_no: Yup.string()
                        .matches(/^[6-9]\d{9}$/, 'Mobile number must be valid')
                        .required('Mobile number is required'),
                    password: Yup.string()
                        .min(8, 'Password must be at least 8 characters long')
                        .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
                        .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
                        .matches(/\d/, 'Password must contain at least one number')
                        .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')
                        .required('Password is required'),
                })}
                onSubmit={handleSignup}
            >
                {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
                    <form noValidate onSubmit={handleSubmit} {...rest}>
                        <TextField
                            error={Boolean(touched.name && errors.name)}
                            fullWidth
                            helperText={touched.name && errors.name}
                            label="Full Name"
                            margin="normal"
                            name="name"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            type="text"
                            value={values.name}
                            variant="outlined"
                        />

                        <TextField
                            error={Boolean(touched.email && errors.email)}
                            fullWidth
                            helperText={touched.email && errors.email}
                            label="Email Address"
                            margin="normal"
                            name="email"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            type="email"
                            value={values.email}
                            variant="outlined"
                        />

                        <TextField
                            error={Boolean(touched.mobile_no && errors.mobile_no)}
                            fullWidth
                            helperText={touched.mobile_no && errors.mobile_no}
                            label="Mobile Number"
                            margin="normal"
                            name="mobile_no"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            type="text"
                            value={values.mobile_no}
                            variant="outlined"
                        />

                        <FormControl
                            fullWidth
                            error={Boolean(touched.password && errors.password)}
                            sx={{ mt: theme.spacing(3), mb: theme.spacing(1) }}
                            variant="outlined"
                        >
                            <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                            <OutlinedInput
                                id="outlined-adornment-password"
                                type={showPassword ? 'text' : 'password'}
                                value={values.password}
                                name="password"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                label="Password"
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleClickShowPassword}
                                            onMouseDown={handleMouseDownPassword}
                                            edge="end"
                                            size="large"
                                        >
                                            {showPassword ? <Visibility /> : <VisibilityOff />}
                                        </IconButton>
                                    </InputAdornment>
                                }
                            />
                            {touched.password && errors.password && (
                                <FormHelperText error id="standard-weight-helper-text">
                                    {errors.password}
                                </FormHelperText>
                            )}
                        </FormControl>

                        {errors.submit && (
                            <Box mt={3}>
                                <FormHelperText error>{errors.submit}</FormHelperText>
                            </Box>
                        )}

                        <Box my={2}>
                            <FormControlLabel
                                control={
                                    <Checkbox checked={checked} onChange={(event) => setChecked(event.target.checked)} name="checked" color="primary" />
                                }
                                label={
                                    <>
                                        I have read the &nbsp;
                                        <Link to="#">Terms and Conditions</Link>
                                    </>
                                }
                            />
                        </Box>
                        <Box mt={2}>
                            <Button color="primary" disabled={isSubmitting} fullWidth size="large" type="submit" variant="contained">
                                Sign Up
                            </Button>
                        </Box>
                    </form>
                )}
            </Formik>
        </>
    );
};

export default AuthSignup;
