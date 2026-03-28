import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Button } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { apiService, commonService } from "../services";
import toast, { Toaster } from 'react-hot-toast';

const VerifyEmail = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setLoading(false);
                navigate("/verify-failed");
                return;
            }

            try {

                const response = await apiService.GetAPICall("verifyEmail", `?token=${token}`);

                if (response.status === 1) {
                    toast.success("Email verified successfully!");
                    commonService.resetAPIFlag("verifyEmail", false);
                    navigate("/email-verified");
                } else {
                    commonService.resetAPIFlag("verifyEmail", false);
                    navigate("/verify-failed");

                }
            } catch (error) {
                console.error(error);
                commonService.resetAPIFlag("verifyEmail", false);
                navigate("/verify-failed");
            } finally {
                commonService.resetAPIFlag("verifyEmail", false);
                setLoading(false);
            }
        };

        verifyToken();
    }, [token, navigate]);

    return (
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
            <Toaster position="top-center" />
            {loading ? (
                <>
                    <CircularProgress />
                    <Typography>Verifying email...</Typography>
                </>
            ) : null}
        </Box>
    );
};

export default VerifyEmail;
