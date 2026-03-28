import React, { useState, useEffect } from "react";
import {
  List,
  ListItem,
  ListItemText,
  Button,
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  DialogActions,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Avatar,
  ListItemAvatar,
  Chip,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import CommonModal from "../../../../components/Modal/Modal.component";
import { apiService, commonService } from "../../../../services";


const MembersTab = ({ project_id }) => {
  const [members, setMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch all users and current project members
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all available users
        const usersResponse = await apiService.GetAPICall("getUsersForMember");
        commonService.resetAPIFlag("getUsersForMember", false);
        setAllUsers(usersResponse.data || []); // Ensure array

        // Fetch current project members
        const membersResponse = await apiService.GetAPICall("getProjectMembers", project_id);
        commonService.resetAPIFlag("getProjectMembers", false);
        setMembers(membersResponse.data || []); // Ensure array
      } catch (err) {
        setError("Failed to fetch members");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [project_id]);


  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setSelectedMembers([]);
    setOpen(false);
  };

  const handleSelectChange = (event) => {
    setSelectedMembers(event.target.value);
  };

  const handleAddMembers = async () => {
    setLoading(true);
    try {
      const response = await apiService.PostAPICall("addProjectMembers", {
        project_id,
        userIds: selectedMembers
      });
      commonService.resetAPIFlag("addProjectMembers", false);

      if (response.data.existingUserIds?.length > 0) {
        commonService.resetAPIFlag("addProjectMembers", false);
        setSuccess(`Added ${response.data.addedCount} members`);
        setError(
          `${response.data.existingUserIds.length} users were already members`
        );
      } else {
        commonService.resetAPIFlag("addProjectMembers", false);
        setSuccess(`Added ${response.data.addedCount} members successfully`);
      }

      // Refresh members list
      const membersResponse = await apiService.GetAPICall(
        "getProjectMembers",
        project_id
      );
      commonService.resetAPIFlag("getProjectMembers", false);
      setMembers(membersResponse.data);
      setSelectedMembers([]);
      handleClose();
    } catch (err) {
      commonService.resetAPIFlag("getProjectMembers", false);
      commonService.resetAPIFlag("addProjectMembers", false);
      setError(err.response?.data?.message || "Failed to add members");
    } finally {
      commonService.resetAPIFlag("getProjectMembers", false);
      commonService.resetAPIFlag("addProjectMembers", false);
      setLoading(false);
    }
  };

  const handleRemoveMember = async (user_id) => {
    setLoading(true);
    try {
      // API call to remove member from project
      await apiService.PostAPICall("removerProjectMembers", {
        project_id,
        user_id,
      });
      commonService.resetAPIFlag("removerProjectMembers", false);

      // Update local state
      setMembers(members.filter((member) => member.user_id !== user_id));
      setSuccess("Member removed successfully");
    } catch (err) {
      commonService.resetAPIFlag("removerProjectMembers", false);
      setError("Failed to remove member");
      console.error(err);
    } finally {
      commonService.resetAPIFlag("removerProjectMembers", false);
      setLoading(false);
    }
  };

  // Filter out already added members from the dropdown list
  const availableMembers = allUsers.filter(
    (user) => !(members || []).some((member) => member.user_id === user.user_id)
  );


  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(null);
  };

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

  if (loading && members.length === 0) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpen}
        sx={{ marginLeft: "16px", mb: 2 }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : "+ Add Member"}
      </Button>

      {(members || []).length === 0 ? (
        <Typography variant="body1" sx={{ p: 2 }}>
          No members added yet
        </Typography>
      ) : <List sx={{ maxWidth: 600 }}>
        {(members || []).map((member) => (
          <ListItem
            key={member.user_id}
            sx={{
              backgroundColor: '#f9f9f9',
              borderRadius: 1,
              mb: 1,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              '&:hover': {
                backgroundColor: '#f0f0f0',
              }
            }}
            secondaryAction={
              <IconButton
                edge="end"
                onClick={() => handleRemoveMember(member.user_id)}
                color="error"
                disabled={loading}
              >
                <CloseIcon />
              </IconButton>
            }
          >
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: stringToColor(member.name) }}>
                {getInitials(member.name)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="subtitle1" fontWeight="medium">
                    {member.name}
                  </Typography>
                  <Chip
                    label={member.role}
                    size="small"
                    color={member.role == 'admin' ? 'primary' : 'default'}
                    sx={{ textTransform: 'capitalize' }}
                  />
                </Box>
              }
              secondary={
                <Typography variant="body2" color="text.secondary">
                  {member.email}
                </Typography>
              }
              sx={{
                '.MuiListItemText-primary': { mb: 0.5 },
                '.MuiListItemText-secondary': {
                  fontFamily: 'monospace',
                  fontSize: '0.8rem'
                }
              }}
            />
          </ListItem>
        ))}
      </List>}


      {/* Modal for adding members */}
      <CommonModal open={open} onClose={handleClose} title="Add Team Members">
        <Box sx={{ minWidth: 400 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Select Members</InputLabel>
            <Select
              multiple
              value={selectedMembers}
              onChange={handleSelectChange}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((id) => {
                    const user = allUsers.find(u => u.user_id === id);
                    return (
                      <Chip
                        key={id}
                        label={`${user?.name} (${user?.email})`}
                        size="small"
                      />
                    );
                  })}
                </Box>
              )}
              disabled={loading || availableMembers.length === 0}
            >
              {availableMembers.length > 0 ? (
                availableMembers.map((user) => (
                  <MenuItem key={user.user_id} value={user.user_id}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="subtitle1">{user.name}</Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontFamily: 'monospace' }}
                      >
                        {user.email}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>All available members are already added</MenuItem>
              )}
            </Select>
          </FormControl>
        </Box>
        <DialogActions>
          <Button onClick={handleClose} color="secondary" disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddMembers}
            disabled={selectedMembers.length === 0 || loading}
          >
            {loading ? <CircularProgress size={24} /> : "Add Selected"}
          </Button>
        </DialogActions>
      </CommonModal>

      {/* Error/Success notifications */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="error">
          {error}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </>
  );
};

export default MembersTab;