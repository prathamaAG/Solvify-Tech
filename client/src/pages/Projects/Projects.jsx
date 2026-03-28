import React, { useState, useEffect } from "react";
import { Button, Container, CircularProgress, Alert, Snackbar, IconButton, Tooltip, Typography, Box, Paper } from "@mui/material";
import TableComponent from "../../components/Table/table.compoenent";
import Pagination from "../../components/Pagination/pagination.component";
import AddProjectForm from "../../components/Modal/AddProjectForm";
import { useNavigate } from "react-router";
import { apiService, commonService } from "../../services";
import dayjs from "dayjs";
import EditProjectForm from "../../components/Modal/EditProjectForm";
import { Edit as EditIcon } from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from '@mui/icons-material/Add';
import { useSelector } from "react-redux";

const Projects = () => {
  const [openModal, setOpenModal] = useState(false);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [editingProject, setEditingProject] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const { isAdmin } = useSelector((state) => state.login);

  const [page, setPage] = useState(1);
  const pageLimit = 10;
  const [pageInformation, setPageInformation] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await apiService.GetAPICall("getAllProjects", `?page=${page}&limit=${pageLimit}`);
        if (response?.data) {
          const formattedRows = response.data.page_data.map(row => ({
            ...row,
            key: row.project_id
          }));
          setRows(formattedRows);
          setPageInformation(response.data?.page_information || {});
          commonService.resetAPIFlag("getAllProjects", false);
        } else {
          setError("No projects found");
          commonService.resetAPIFlag("getAllProjects", false);
        }
      } catch (err) {
        setError(err.message);
        commonService.resetAPIFlag("getAllProjects", false);
      } finally {
        commonService.resetAPIFlag("getAllProjects", false);
        setLoading(false);
      }
    };

    fetchProjects();
  }, [page]);

  const handleEdit = async (projectId) => {
    try {
      const projectToEdit = rows.find(project => project.project_id === projectId);
      if (!projectToEdit) {
        setSnackbarMessage("Project not found");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }
      setEditingProject({
        project_id: projectToEdit.project_id,
        project_name: projectToEdit.project_name,
        description: projectToEdit.description,
        start_date: dayjs(projectToEdit.start_date),
        due_date: dayjs(projectToEdit.due_date),
        status: projectToEdit.status,
        technology: projectToEdit.technology
      });
      setEditModalOpen(true);
    } catch (err) {
      setSnackbarMessage("Error preparing project for edit");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleEditSubmit = async (formData) => {
    try {
      const body = {
        project_id: editingProject.project_id,
        project_name: formData.project_name,
        description: formData.description,
        start_date: formData.start_date,
        due_date: formData.due_date,
        status: formData.status,
        technology: formData.technology,
      };
      const response = await apiService.PutAPICall("updateProject", body);
      if (response.status === 1 || response.message === "Project updated successfully") {
        setSnackbarMessage(response.message || "Project updated successfully");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        const updatedResponse = await apiService.GetAPICall("getAllProjects", `?page=${page}&limit=${pageLimit}`);
        setRows(updatedResponse.data?.page_data || []);
        setPageInformation(updatedResponse.data?.page_information || {});
      } else {
        setSnackbarMessage(response.message || "Failed to update project");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    } catch (err) {
      setSnackbarMessage("Error in updating project");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      commonService.resetAPIFlag("updateProject", false);
      commonService.resetAPIFlag("getAllProjects", false);
      setEditModalOpen(false);
      setEditingProject(null);
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      if (!window.confirm('Are you sure you want to delete this project?')) return;
      const response = await apiService.DeleteAPICall("deleteProject", projectId);
      if (response.status === 1) {
        setSnackbarMessage(response.message);
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        const updatedResponse = await apiService.GetAPICall("getAllProjects", `?page=${page}&limit=${pageLimit}`);
        setRows(updatedResponse.data?.page_data || []);
        setPageInformation(updatedResponse.data?.page_information || {});
      } else {
        setSnackbarMessage(response.message || "Failed to delete project");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    } catch (err) {
      setSnackbarMessage("Error in deleting project");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleProjectSubmit = async (formData) => {
    try {
      const body = {
        project_name: formData.project_name,
        description: formData.description,
        start_date: formData.start_date,
        due_date: formData.due_date,
        status: "pending",
        technology: formData.technology,
      };
      const response = await apiService.PostAPICall("createProject", body);
      if (response.status === 1) {
        setSnackbarMessage(response.message);
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        const updatedResponse = await apiService.GetAPICall("getAllProjects", `?page=${page}&limit=${pageLimit}`);
        setRows(updatedResponse.data?.page_data || []);
        setPageInformation(updatedResponse.data?.page_information || {});
      } else {
        setSnackbarMessage(response.message || "Failed to create project");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    } catch (err) {
      setSnackbarMessage("Error in creating project");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      commonService.resetAPIFlag("createProject", false);
      commonService.resetAPIFlag("getAllProjects", false);
    }
    setOpenModal(false);
  };

  const handleClick = (project_id) => {
    if (project_id) {
      navigate(`/management/projects/details/${project_id}`);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const columns = [
    { field: "project_id", headerName: "ID" },
    { field: "project_name", headerName: "Project Name" },
    { field: "status", headerName: "Status" },
    {
      field: "start_date",
      headerName: "Start Date",
      renderCell: (params) => dayjs(params.value).format("DD-MM-YYYY")
    },
    {
      field: "due_date",
      headerName: "Due Date",
      renderCell: (params) => dayjs(params.value).format("DD-MM-YYYY")
    },
    { field: "technology", headerName: "Technology" },
    ...(isAdmin
      ? [
        {
          field: "actions",
          headerName: "Actions",
          renderCell: (params) => (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="Edit">
                <IconButton
                  aria-label="edit"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(params.row.project_id);
                  }}
                  size="small"
                  sx={{
                    color: '#6366F1',
                    backgroundColor: '#EEF2FF',
                    borderRadius: '8px',
                    width: 32,
                    height: 32,
                    '&:hover': { backgroundColor: '#E0E7FF' }
                  }}
                >
                  <EditIcon sx={{ fontSize: '1rem' }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton
                  aria-label="delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteProject(params.row?.project_id);
                  }}
                  size="small"
                  sx={{
                    color: '#EF4444',
                    backgroundColor: '#FEF2F2',
                    borderRadius: '8px',
                    width: 32,
                    height: 32,
                    '&:hover': { backgroundColor: '#FEE2E2' }
                  }}
                >
                  <DeleteIcon sx={{ fontSize: '1rem' }} />
                </IconButton>
              </Tooltip>
            </Box>
          ),
        },
      ]
      : []),
  ];

  return (
    <Container maxWidth="xl">
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ borderRadius: '12px' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5 }}>
            Projects
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            Manage and track all your projects
          </Typography>
        </Box>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenModal(true)}
            sx={{
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
              borderRadius: '12px',
              px: 3,
              py: 1.2,
              fontWeight: 600,
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)',
              }
            }}
          >
            Add Project
          </Button>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px" }}>
          <CircularProgress sx={{ color: '#6366F1' }} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
          {error}
        </Alert>
      ) : (
        <>
          <div style={{ overflowX: "auto" }}>
            <TableComponent
              rows={rows}
              columns={columns}
              handleClick={handleClick}
              getRowId={(row) => row.project_id}
            />
          </div>
          <Box sx={{ p: 2.5 }}>
            <Pagination
              pageInformation={pageInformation}
              page={page}
              setPage={setPage}
              totalPages={pageInformation?.last_page}
            />
          </Box>
        </>
      )}

      <AddProjectForm open={openModal} onClose={() => setOpenModal(false)} onSubmit={handleProjectSubmit} />
      {editingProject && (
        <EditProjectForm
          open={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setEditingProject(null);
          }}
          onSubmit={handleEditSubmit}
          initialValues={editingProject}
        />
      )}
    </Container>
  );
};

export default Projects;