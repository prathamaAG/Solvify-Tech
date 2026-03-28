import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { apiService, commonService } from "../services";
import toast, { Toaster } from "react-hot-toast";

const ForgotPasswordEmailNotification = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const email = params.get("email"); // Get email from URL

    const handleResendEmail = async () => {
        try {
            const loadingToast = toast.loading("Sending password reset email...");
            const response = await apiService.PostAPICall("resendPasswordResetEmail", { email });

            switch (response.status) {
                case 1:
                    commonService.resetAPIFlag("resendPasswordResetEmail", false);
                    toast.success(response.message || "Password reset email sent again.", { id: loadingToast });
                    break;
                case 0:
                    commonService.resetAPIFlag("resendPasswordResetEmail", false);
                    toast.error(response.message || "Email not found or already used.", { id: loadingToast });
                    break;
                default:
                    commonService.resetAPIFlag("resendPasswordResetEmail", false);
                    toast.error(response.message || "Unexpected error occurred. Please try again.", { id: loadingToast });
                    break;
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.message || "An error occurred while sending the email.");
        }
    };

    return (
        <>
            <Toaster position="top-center" reverseOrder={false} />

            <Box
                sx={{
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                    gap: 2,
                    px: 3,
                }}
            >
                <Typography variant="h4" gutterBottom>
                    Password Reset Email Sent
                </Typography>
                <Typography>
                    We have sent a password reset link to your email. Please check your inbox to reset your password.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Didn’t get the email? Check your spam folder or{" "}
                    <Button onClick={handleResendEmail}>Resend Email</Button>.
                </Typography>
                <Button variant="contained" onClick={() => navigate("/login")}>
                    Go to Login
                </Button>
            </Box>
        </>
    );
};

export default ForgotPasswordEmailNotification;
