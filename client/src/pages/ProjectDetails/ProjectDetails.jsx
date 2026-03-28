import React, { useState, useEffect } from "react";
import { Container, Typography, Box, IconButton, CircularProgress } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ProjectTabs from "./ProjectDetailsTabs/index";
import { apiService, commonService } from "../../services";

const ProjectDetails = () => {
   const { project_id } = useParams();
   const [project, setProject] = useState();
   const [loading, setLoading] = useState(true);

   const navigate = useNavigate();  // For navigation

   const handleGoBack = () => {
      navigate(-1);  // Go back to the previous page
   };

   useEffect(() => {
      // Fetch project details using the ID
      const fetchProjectDetails = async () => {
         try {
            const response = await apiService.GetAPICall("getProject", `${project_id}`);
            if (response.data) {
               setProject(response.data);
               commonService.resetAPIFlag("getProject", false);
            } else {
               commonService.resetAPIFlag("getProject", false);
               console.error("No Project Found");
            }
         } catch (err) {
            console.error(err);
            commonService.resetAPIFlag("getProject", false);
         } finally {
            commonService.resetAPIFlag("getProject", false);
            setLoading(false);
         }
      };

      fetchProjectDetails();
   }, [project_id]);

   if (loading) {
      return (
         <Container sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <CircularProgress />
         </Container>
      );
   }

   if (!project) {
      return <Typography>No project found.</Typography>;
   }

   return (
      <Container sx={{ backgroundColor: "white", padding: "1rem", borderRadius: "0.75rem", height: "100%" }}>
         <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "start", gap: "0.5rem", alignItems: "center" }}>
            <IconButton onClick={handleGoBack}>
               <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4">
               {project.project_name}
            </Typography>
         </Box>
         <ProjectTabs project_id={project_id} project={project} />
      </Container>
   );
};

export default ProjectDetails;