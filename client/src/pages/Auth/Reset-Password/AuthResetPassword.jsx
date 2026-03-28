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

const AuthResetPassword = ({ token, ...rest }) => {
   const theme = useTheme();
   const navigate = useNavigate();
   const handleResetPassword = async (values, actions) => {
      const loadingToast = toast.loading('Resetting password...');
      try {
         const body = {
            token : token, // The reset token from URL or props
            newPassword: values.newPassword,
            confirmPassword: values.confirmPassword,
         };

         const response = await apiService.PostAPICall("resetPassword", body);

         switch (response.status) {
            case 1:
               commonService.resetAPIFlag("resetPassword", false);
               toast.success("Password reset successful. Please log in.", { id: loadingToast });
               actions.resetForm();
               navigate(`/login`);
               break;
            case 0:
               commonService.resetAPIFlag("resetPassword", false);
               toast.error(response.message || "Invalid or expired token.", { id: loadingToast });
               break;
            default:
               commonService.resetAPIFlag("resetPassword", false);
               toast.error("Unexpected error occurred. Please try again.", { id: loadingToast });
               break;
         }
      } catch (error) {
         toast.error(error.response?.message || "An error occurred while resetting the password.", { id: loadingToast });
      } finally {
         actions.setSubmitting(false);
      }
   };

   return (
      <>
         <Toaster position="top-center" reverseOrder={false} />
         <Formik
            initialValues={{
               newPassword: '',
               confirmPassword: '',
            }}
            validationSchema={Yup.object().shape({
               newPassword: Yup.string()
                  .min(8, 'Password must be at least 8 characters long')
                  .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
                  .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
                  .matches(/\d/, 'Password must contain at least one number')
                  .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')
                  .required('Password is required'),
               confirmPassword: Yup.string()
                  .oneOf([Yup.ref('newPassword')], 'Passwords must match')
                  .required('Confirm password is required'),
            })}
            onSubmit={handleResetPassword}
         >
            {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
               <form noValidate onSubmit={handleSubmit} {...rest}>
                  <TextField
                     error={Boolean(touched.newPassword && errors.newPassword)}
                     fullWidth
                     helperText={touched.newPassword && errors.newPassword}
                     label="New Password"
                     margin="normal"
                     name="newPassword"
                     onBlur={handleBlur}
                     onChange={handleChange}
                     type="password"
                     value={values.newPassword}
                     variant="outlined"
                  />

                  <TextField
                     error={Boolean(touched.confirmPassword && errors.confirmPassword)}
                     fullWidth
                     helperText={touched.confirmPassword && errors.confirmPassword}
                     label="Confirm Password"
                     margin="normal"
                     name="confirmPassword"
                     onBlur={handleBlur}
                     onChange={handleChange}
                     type="password"
                     value={values.confirmPassword}
                     variant="outlined"
                  />

                  <Box mt={2}>
                     <Button color="primary" disabled={isSubmitting} fullWidth size="large" type="submit" variant="contained">
                        Reset Password
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

export default AuthResetPassword;
