import React, { useState, useEffect, useCallback } from "react";
import {
   Box,
   Container,
   TextField,
   Button,
   Chip,
   Select,
   MenuItem,
   Typography,
   FormControl,
   InputLabel,
   IconButton,
   CircularProgress,
   Snackbar,
   Alert,
   Avatar,
   ListItemAvatar,
   ListItemText,
   ListItem
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Close";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import FolderZipIcon from "@mui/icons-material/FolderZip";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from "react-router-dom";
import CommentSection from "../../components/CommentSection/CommentSection.component";
import { apiService, commonService } from "../../services";
import { useSelector } from "react-redux";

const CardDetails = () => {
   const { id } = useParams();
   const navigate = useNavigate();
   const [loading, setLoading] = useState(true);
   const [updating, setUpdating] = useState(false);
   const [usersLoading, setUsersLoading] = useState(true);

   // Snackbar state
   const [snackbarOpen, setSnackbarOpen] = useState(false);
   const [snackbarMessage, setSnackbarMessage] = useState("");
   const [snackbarSeverity, setSnackbarSeverity] = useState("info");

   // Assign To state
   const [allUsers, setAllUsers] = useState([]);
   const [assignedUser, setAssignedUser] = useState(null);
   const [selectedAssignee, setSelectedAssignee] = useState("");

   const [cardData, setCardData] = useState({
      project_id: "",
      title: "",
      description: "",
      due_date: "",
      priority: "High",
      status: "Pending",
      tags: [],
      assign_to: null,
      assign_by: null
   });

   const [newTag, setNewTag] = useState("");
   const [isAdding, setIsAdding] = useState(false);
   const [files, setFiles] = useState([]);

   // Permission state
   const { isAdmin } = useSelector((state) => state.login);
   const currentUserId = useSelector((state) => state.login.user_id);
   const [canEdit, setCanEdit] = useState(false);
   const [canAssign, setCanAssign] = useState(false);

   const showSnackbar = (message, severity) => {
      setSnackbarMessage(message);
      setSnackbarSeverity(severity);
      setSnackbarOpen(true);
   };

   const handleSnackbarClose = (event, reason) => {
      if (reason === 'clickaway') {
         return;
      }
      setSnackbarOpen(false);
   };

   const fetchUsers = async (projectId) => {
      try {
         setUsersLoading(true);
         const usersResponse = await apiService.GetAPICall("getProjectMembers", projectId);
         setAllUsers(usersResponse.data || []);

         // Find the assigned user from all users
         if (cardData.assign_to) {
            const assigned = usersResponse.data.find(user => user.user_id === cardData.assign_to);
            setAssignedUser(assigned || null);
         } else {
            setAssignedUser(null);
         }
      } catch (error) {
         console.error("Error fetching users:", error);
         showSnackbar("Error fetching users", "error");
      } finally {
         commonService.resetAPIFlag("getProjectMembers", false);
         setUsersLoading(false);
      }
   };

   const debounce = (func, delay) => {
      let timer;
      return function (...args) {
         clearTimeout(timer);
         timer = setTimeout(() => func.apply(this, args), delay);
      };
   };

   const debouncedUpdateTask = useCallback(
      debounce(async (updatedFields) => {
         try {
            setUpdating(true);
            const body = {
               ...updatedFields,
               task_id: id,
            };

            const response = await apiService.PutAPICall("updateTask", body);
            if (response.status === 1) {
               // showSnackbar("Task updated successfully", "success");
            } else {
               showSnackbar(response.message || "Failed to update task", "error");
            }
         } catch (error) {
            console.error("Error updating task:", error);
            showSnackbar("Error updating task", "error");
         } finally {
            commonService.resetAPIFlag("updateTask", false);
            setUpdating(false);
         }
      }, 1000), // 1 second delay
      [id]
   );

   // Update task automatically when any field changes
   const updateTask = async (updatedFields) => {
      try {
         setUpdating(true);
         const body = {
            ...updatedFields,
            task_id: id,
         };

         const response = await apiService.PutAPICall("updateTask", body);
         if (response.status === 1) {
            // showSnackbar("Task updated successfully", "success");
         } else {
            showSnackbar(response.message || "Failed to update task", "error");
         }
      } catch (error) {
         console.error("Error updating task:", error);
         showSnackbar("Error updating task", "error");
      } finally {
         commonService.resetAPIFlag("updateTask", false);
         setUpdating(false);
      }
   };

   useEffect(() => {
      const fetchCardDetails = async () => {
         try {
            setLoading(true);
            const response = await apiService.GetAPICall("getTaskDetails", id);
            if (response.status === 1) {
               const data = response.data;
               setCardData({
                  project_id: data.project_id,
                  title: data.title || "",
                  description: data.description || "",
                  due_date: data.due_date || "",
                  priority: data.priority || "High",
                  status: data.status || "Pending",
                  tags: data.tags || [],
                  assign_to: data.assign_to || null,
                  assign_by: data.assign_by || null
               });
               await fetchUsers(data.project_id);
            } else {
               showSnackbar(response.message || "Failed to fetch task details", "error");
            }
         } catch (error) {
            console.error("Error fetching task details:", error);
            showSnackbar("Error fetching task details", "error");
         } finally {
            commonService.resetAPIFlag("getTaskDetails", false);
            setLoading(false);
         }
      };

      fetchCardDetails();
   }, [id]);

   // Determine edit permissions after task data loads
   useEffect(() => {
      if (!cardData.title) return; // Not yet loaded

      if (isAdmin) {
         setCanEdit(true);
         setCanAssign(true);
         return;
      }

      const assigneeId = cardData.assign_to?.user_id || cardData.assign_to;

      // Allow claiming or delegating Unassigned Tasks (loose check for null/undefined/0)
      if (!assigneeId) {
         setCanEdit(true);
         setCanAssign(true);
         return;
      }

      const isSelf = String(assigneeId) === String(currentUserId);
      if (isSelf) {
         setCanEdit(true);
         setCanAssign(false); // Self can edit but not reassign
         return;
      }

      // Check if current user is a superior of the assignee
      const checkSuperior = async () => {
         try {
            const response = await apiService.GetAPICall("getMySubordinates");
            if (response.status === 1 && response.data) {
               const subordinateIds = response.data;
               if (assigneeId && subordinateIds.includes(assigneeId)) {
                  setCanEdit(true);
                  setCanAssign(true); // Superior can edit and reassign
               } else {
                  setCanEdit(false);
                  setCanAssign(false);
               }
            }
         } catch (err) {
            console.error("Failed to check permissions:", err);
            setCanEdit(false);
            setCanAssign(false);
         } finally {
            commonService.resetAPIFlag("getMySubordinates", false);
         }
      };
      checkSuperior();
   }, [cardData.assign_to, isAdmin, currentUserId]);

   const handleChange = (field, value) => {
      if (!canEdit) {
         showSnackbar("You don't have permission to edit this task", "error");
         return;
      }
      const updatedData = { ...cardData, [field]: value };
      setCardData(updatedData);

      // Use debounced update for description, regular for other fields
      if (field === "description" || field === "title") {
         debouncedUpdateTask({ [field]: value });
      } else {
         updateTask({ [field]: value });
      }
   };

   const handleFileChange = (event) => {
      const newFiles = Array.from(event.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
   };

   const handleRemoveFile = (index) => {
      setFiles(files.filter((_, i) => i !== index));
   };

   const getFileIcon = (fileType) => {
      if (fileType.includes("pdf")) return <PictureAsPdfIcon fontSize="large" color="error" />;
      if (fileType.includes("zip")) return <FolderZipIcon fontSize="large" color="primary" />;
      if (fileType.includes("word") || fileType.includes("msword") || fileType.includes("document"))
         return <DescriptionIcon fontSize="large" color="primary" />;
      return <InsertDriveFileIcon fontSize="large" color="action" />;
   };

   const handleRemoveTag = async (index) => {
      const newTags = [...cardData.tags];
      newTags.splice(index, 1);
      const updatedData = { ...cardData, tags: newTags };
      setCardData(updatedData);
      await updateTask({ tags: newTags });
   };

   const handleAddTag = async () => {
      if (newTag.trim() !== "") {
         const newTags = [...cardData.tags, newTag.trim()];
         const updatedData = { ...cardData, tags: newTags };
         setCardData(updatedData);
         setNewTag("");
         setIsAdding(false);
         await updateTask({ tags: newTags });
      }
   };

   const handleGoBack = () => {
      navigate(-1);
   };

   // Handle assigning a user to the task
   const handleAssignUser = async () => {
      if (!selectedAssignee) return;

      try {
         setUpdating(true);
         const userToAssign = allUsers.find(user => user.user_id === selectedAssignee);

         const response = await apiService.PutAPICall("updateTask", {
            task_id: id,
            assign_to_email: userToAssign.email
         });

         if (response.status === 1) {
            showSnackbar("User assigned successfully", "success");
            // Update local state with the full user object
            setCardData(prev => ({
               ...prev,
               assign_to: userToAssign,
               assign_by: prev.assign_by  // Keep the existing assign_by
            }));
            setSelectedAssignee("");
         } else {
            showSnackbar(response.message || "Failed to assign user", "error");
         }
      } catch (error) {
         console.error("Error assigning user:", error);
         showSnackbar("Error assigning user", "error");
      } finally {
         commonService.resetAPIFlag("updateTask", false);
         setUpdating(false);
      }
   };

   // Handle removing assigned user from the task
   const handleRemoveAssignee = async () => {
      try {
         setUpdating(true);
         const response = await apiService.PutAPICall("updateTask", {
            task_id: id,
            assign_to_email: null
         });

         if (response.status === 1) {
            showSnackbar("User removed successfully", "success");
            // Update local state
            setCardData(prev => ({
               ...prev,
               assign_to: null,
               // Keep assign_by as it is (the person who originally assigned)
               assign_by: prev.assign_by
            }));
         } else {
            showSnackbar(response.message || "Failed to remove user", "error");
         }
      } catch (error) {
         console.error("Error removing user:", error);
         showSnackbar("Error removing user", "error");
      } finally {
         commonService.resetAPIFlag("updateTask", false);
         setUpdating(false);
      }
   };

   // Helper functions for avatar generation
   function stringToColor(string) {
      let hash = 0;
      for (let i = 0; i < string.length; i++) {
         hash = string.charCodeAt(i) + ((hash << 5) - hash);
      }
      let color = '#';
      for (let i = 0; i < 3; i++) {
         const value = (hash >> (i * 8)) & 0xff;
         color += `00${value.toString(16)}`.slice(-2);
      }
      return color;
   }

   function getInitials(name) {
      return name.split(' ')
         .map(part => part[0])
         .join('')
         .toUpperCase();
   }

   // Filter out the currently assigned user from the dropdown
   const availableUsers = allUsers.filter(
      user => user.user_id !== cardData.assign_to
   );

   if (loading) {
      return (
         <Container sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
            <CircularProgress />
         </Container>
      );
   }

   return (
      <>
         <Container
            sx={{
               backgroundColor: "white",
               padding: "1.5rem",
               borderRadius: "0.75rem",
               display: "flex",
               flexDirection: { xs: "column", md: "row" },
               gap: 4,
            }}
         >
            {/* Left Section */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%", overflowY: "auto" }}>
               <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "start", gap: "0.5rem", alignItems: "center" }}>
                  <IconButton onClick={handleGoBack}>
                     <ArrowBackIcon />
                  </IconButton>
                  <TextField
                     fullWidth
                     variant="standard"
                     value={cardData.title}
                     onChange={(e) => handleChange("title", e.target.value)}
                     InputProps={{
                        style: {
                           fontSize: "1.5rem",
                           fontWeight: "bold",
                        },
                     }}
                  />
               </Box>

               {/* Status */}
               <Box>
                  <Typography sx={{ fontWeight: 500 }}>Status</Typography>
                  <FormControl fullWidth>
                     <Select
                        value={cardData.status}
                        onChange={(e) => handleChange("status", e.target.value)}
                        disabled={updating}
                     >
                        <MenuItem value="Pending">Pending</MenuItem>
                        <MenuItem value="In progress">In Progress</MenuItem>
                        <MenuItem value="To be verified">To Be Verified</MenuItem>
                        <MenuItem value="Completed">Completed</MenuItem>
                     </Select>
                  </FormControl>
               </Box>

               {/* Priority */}
               <Box>
                  <Typography sx={{ fontWeight: 500 }}>Priority</Typography>
                  <FormControl fullWidth>
                     <Select
                        value={cardData.priority}
                        onChange={(e) => handleChange("priority", e.target.value)}
                        disabled={updating}
                     >
                        <MenuItem value="High">High</MenuItem>
                        <MenuItem value="Medium">Medium</MenuItem>
                        <MenuItem value="Low">Low</MenuItem>
                     </Select>
                  </FormControl>
               </Box>

               {/* Due Date */}
               <Box>
                  <Typography sx={{ fontWeight: 500 }}>Due Date</Typography>
                  <TextField
                     type="date"
                     fullWidth
                     value={cardData.due_date ? cardData.due_date.split('T')[0] : ''}
                     onChange={(e) => handleChange("due_date", e.target.value)}
                     InputLabelProps={{
                        shrink: true,
                     }}
                     disabled={updating}
                  />
               </Box>

               {/* Assign To Section */}
               <Box>
                  <Typography sx={{ fontWeight: 500, mb: 1 }}>Assigned To</Typography>

                  {/* Current assigned user */}
                  {cardData.assign_to ? (
                     <ListItem
                        sx={{
                           backgroundColor: '#f9f9f9',
                           borderRadius: 1,
                           mb: 2,
                           boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                           '&:hover': { backgroundColor: '#f0f0f0' }
                        }}
                        secondaryAction={
                           <IconButton
                              edge="end"
                              onClick={handleRemoveAssignee}
                              color="error"
                              disabled={updating}
                           >
                              <DeleteIcon />
                           </IconButton>
                        }
                     >
                        <ListItemAvatar>
                           <Avatar sx={{ bgcolor: stringToColor(cardData.assign_to.name) }}>
                              {getInitials(cardData.assign_to.name)}
                           </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                           primary={cardData.assign_to.name}
                           secondary={cardData.assign_to.email}
                        />
                     </ListItem>
                  ) : (
                     <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                        No user assigned yet
                     </Typography>
                  )}

                  {/* Assign new user */}
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                     <FormControl fullWidth>
                        <InputLabel>Assign to</InputLabel>
                        {usersLoading ? (
                           <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                              <CircularProgress size={24} />
                           </Box>
                        ) : (
                           <Select
                              value={selectedAssignee}
                              onChange={(e) => setSelectedAssignee(e.target.value)}
                              disabled={updating || availableUsers.length === 0}
                              label="Assign to"
                           >
                              {availableUsers.length > 0 ? (
                                 availableUsers.map((user) => (
                                    <MenuItem key={user.user_id} value={user.user_id}>
                                       {user.name} ({user.email})
                                    </MenuItem>
                                 ))
                              ) : (
                                 <MenuItem disabled>All users are already assigned</MenuItem>
                              )}
                           </Select>
                        )}
                     </FormControl>
                     <Button
                        variant="contained"
                        onClick={handleAssignUser}
                        disabled={!selectedAssignee || updating || usersLoading}
                        sx={{ height: '56px' }}
                     >
                        {updating ? <CircularProgress size={24} /> : "Assign"}
                     </Button>
                  </Box>
               </Box>

               {/* Tags */}
               <Typography sx={{ fontWeight: 500 }}>Tags</Typography>
               <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                  {cardData.tags.map((tag, index) => (
                     <Chip
                        key={index}
                        label={tag}
                        color="primary"
                        onDelete={() => handleRemoveTag(index)}
                        disabled={updating}
                     />
                  ))}

                  {isAdding ? (
                     <TextField
                        autoFocus
                        size="small"
                        variant="outlined"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onBlur={() => {
                           setIsAdding(false);
                           handleAddTag();
                        }}
                        onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                        sx={{ width: "120px" }}
                        disabled={updating}
                     />
                  ) : (
                     <IconButton
                        size="small"
                        onClick={() => setIsAdding(true)}
                        disabled={updating}
                     >
                        <AddIcon />
                     </IconButton>
                  )}
               </Box>

               {/* Description */}
               <Box>
                  <Typography sx={{ fontWeight: 500 }}>Description</Typography>
                  <TextField
                     variant="outlined"
                     fullWidth
                     multiline
                     rows={3}
                     value={cardData.description}
                     onChange={(e) => handleChange("description", e.target.value)}
                     disabled={updating}
                  />
               </Box>


            </Box>

            {/* Right Section - Comments */}
            <CommentSection task_id={id} />
         </Container>

         {/* Snackbar for displaying messages */}
         <Snackbar
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={handleSnackbarClose}
         >
            <Alert
               onClose={handleSnackbarClose}
               severity={snackbarSeverity}
               sx={{ width: '100%' }}
            >
               {snackbarMessage}
            </Alert>
         </Snackbar>
      </>
   );
};

export default CardDetails;