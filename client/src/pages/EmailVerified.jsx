import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const EmailVerified = () => {
    const navigate = useNavigate();

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
            <Typography variant="h4" gutterBottom>
                Email Verified Successfully!
            </Typography>
            <Typography>
                Your email has been verified. You can now log in to your account.
            </Typography>
            <Button variant="contained" onClick={() => navigate("/login")}>
                Go to Login
            </Button>
        </Box>
    );
};

export default EmailVerified;
