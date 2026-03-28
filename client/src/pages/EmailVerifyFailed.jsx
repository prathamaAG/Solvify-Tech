import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const EmailVerifyFailed = () => {
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
                Verification Failed
            </Typography>
            <Typography>
                The verification link is invalid or has expired. Please sign up again or contact support.
            </Typography>
            <Button variant="contained" onClick={() => navigate("/signup")}>
                Go to Signup
            </Button>
        </Box>
    );
};

export default EmailVerifyFailed;
