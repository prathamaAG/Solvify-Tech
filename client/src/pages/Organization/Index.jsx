import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Alert, Container, Typography } from "@mui/material";
import OrgTree from "../../components/OrganizationChart/OrganizationTree";
import { apiService, commonService } from "../../services";

const OrganizationTree = () => {
   const [orgData, setOrgData] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   useEffect(() => {
      const fetchOrgData = async () => {
         try {
            setLoading(true);
            // ✅ Use correct API key
            const response = await apiService.GetAPICall("getOrganizationTree");
            commonService.resetAPIFlag("getOrganizationTree", false);
            
            if (response?.data) {
               setOrgData(response.data);
            } else {
               throw new Error("No organization data received");
            }
         } catch (err) {
            console.error("Error fetching organization data:", err);
            setError("Failed to load organization hierarchy");
            setOrgData([]);
         } finally {
            setLoading(false);
         }
      };

      fetchOrgData();
   }, []);

   if (loading) {
      return (
         <Container sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <CircularProgress />
         </Container>
      );
   }

   if (error) {
      return (
         <Container sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <Alert severity="error">{error}</Alert>
         </Container>
      );
   }

   return (
      <Container sx={{ py: 4 }}>
         <Typography variant="h4" sx={{ mb: 3 }}>
            Organization Hierarchy
         </Typography>
         <Box sx={{ overflowX: "auto" }}>
            <OrgTree data={orgData} />
         </Box>
      </Container>
   );
};

export default OrganizationTree;
