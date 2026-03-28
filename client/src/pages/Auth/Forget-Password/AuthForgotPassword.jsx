import React from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Button,
  FormHelperText,
  Grid,
  TextField,
  Typography,
} from '@mui/material';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';

// services
import { apiService, commonService } from "../../../services";

import toast, { Toaster } from 'react-hot-toast';

const AuthForgotPassword = ({ ...rest }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleForgotPassword = async (values, actions) => {
    const loadingToast = toast.loading('Sending reset link...');
    try {
      const body = {
        email: values.email,
      };

      const response = await apiService.PostAPICall("forgotPassword", body);

      switch (response.status) {
        case 1:
          commonService.resetAPIFlag("forgotPassword", false);
          toast.success("Password reset link sent to your email.", { id: loadingToast });
          actions.resetForm();
          navigate(`/forgot-password-email-notification?email=${values.email}`);
          break;
        case 0:
          commonService.resetAPIFlag("forgotPassword", false);
          toast.error(response.message || "Email not found.", { id: loadingToast });
          actions.resetForm();
          break;
        default:
          commonService.resetAPIFlag("forgotPassword", false);
          toast.error("Unexpected error occurred. Please try again.", { id: loadingToast });
          break;
      }
    } catch (error) {
      toast.error(error.response?.message || "An error occurred while sending the reset link.", { id: loadingToast });
    } finally {
      actions.setSubmitting(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Formik
        initialValues={{
          email: '',
          submit: null,
        }}
        validationSchema={Yup.object().shape({
          email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
        })}
        onSubmit={handleForgotPassword}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
          <form noValidate onSubmit={handleSubmit} {...rest}>
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

            {errors.submit && (
              <Box mt={3}>
                <FormHelperText error>{errors.submit}</FormHelperText>
              </Box>
            )}

            <Box mt={2}>
              <Button color="primary" disabled={isSubmitting} fullWidth size="large" type="submit" variant="contained">
                Send Reset Link
              </Button>
            </Box>

            <Grid container justifyContent="flex-end" sx={{ mt: theme.spacing(2) }}>
              <Grid item>
                <Typography variant="subtitle2" color="primary" component="a" href="/login" sx={{ textDecoration: 'none' }}>
                  Back to Login
                </Typography>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    </>
  );
};

export default AuthForgotPassword;