import React, { useState, useEffect } from "react";
import { Button, Container, CircularProgress, Alert, Snackbar, IconButton, Tooltip, Typography, Box } from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from '@mui/icons-material/Add';
import TableComponent from "../../components/Table/table.compoenent";
import Pagination from "../../components/Pagination/pagination.component";
import { apiService, commonService } from "../../services";
import AddEmployeeForm from "../../components/Modal/AddEmployeeForm"
import UpdateEmployeeForm from "../../components/Modal/UpdateEmployeeForm";
import { apiBase } from "../../constants";
import { useSelector } from "react-redux";

const Employee = () => {
  const [employees, setEmployees] = useState([]);
  const [employeeLoading, setEmployeeLoading] = useState(true);
  const [dropdownLoading, setDropdownLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [openModal, setOpenModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [page, setPage] = useState(1);
  const pageLimit = 10;
  const [pageInformation, setPageInformation] = useState({});
  const [employeeList, setEmployeeList] = useState([]);
  const { isAdmin } = useSelector((state) => state.login);

  useEffect(() => {
    const fetchEmployees = async () => {
      setEmployeeLoading(true);
      try {
        const response = await apiService.GetAPICall("getAllEmployees", `?page=${page}&limit=${pageLimit}`);
        if (response?.data?.page_data) {
          setEmployees(response.data.page_data);
          setPageInformation(response.data.page_information);
          commonService.resetAPIFlag("getAllEmployees", false);
        } else {
          setError("No employees found");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        commonService.resetAPIFlag("getAllEmployees", false);
        setEmployeeLoading(false);
      }
    };
    fetchEmployees();
  }, [page]);

  useEffect(() => {
    fetchEmployeeDropList();
  }, []);

  const fetchEmployeeDropList = async () => {
    setDropdownLoading(true);
    try {
      const response = await apiService.GetAPICall("getEmployeeDropdownList");
      if (response?.data) {
        setEmployeeList(response.data.employees);
        commonService.resetAPIFlag("getEmployeeDropdownList", false);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      commonService.resetAPIFlag("getEmployeeDropdownList", false);
      setDropdownLoading(false);
    }
  };

  const handleEditClick = (employee) => {
    setSelectedEmployee(employee);
    setOpenEditModal(true);
  };

  const handleUpdateEmployee = async (updatedData) => {
    try {
      const response = await apiService.PutAPICall("updateEmployee", updatedData);
      if (response.status === 1) {
        setSnackbarMessage(response.message);
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        commonService.resetAPIFlag("updateEmployee", false);
        const updatedResponse = await apiService.GetAPICall("getAllEmployees", `?page=${page}&limit=${pageLimit}`);
        setEmployees(updatedResponse.data.page_data);
        setPageInformation(updatedResponse.data.page_information);
        commonService.resetAPIFlag("getAllEmployees", false);
      } else {
        commonService.resetAPIFlag("updateEmployee", false);
        throw new Error(response.message);
      }
    } catch (err) {
      setSnackbarMessage("Error updating employee");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      commonService.resetAPIFlag("updateEmployee", false);
    }
    setOpenEditModal(false);
  };

  const columns = [
    { field: "user_id", headerName: "ID" },
    { field: "name", headerName: "Full Name" },
    { field: "email", headerName: "Email" },
    { field: "mobile_no", headerName: "Mobile" },
    { field: "role", headerName: "Role" },
    { field: "technology", headerName: "Technology" },
    {
      field: "reporting_person",
      headerName: "Reporting Person",
      renderCell: (params) => params.row.reportingPerson?.name || "--",
    },
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
                    handleEditClick(params.row);
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
                    handleDeleteEmployee(params.row?.user_id);
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

  const handleAddEmployee = async (formData) => {
    try {
      const response = await apiService.PostAPICall("adminCreateUser", formData);
      if (response.message) {
        setSnackbarMessage(response.message);
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        const updatedResponse = await apiService.GetAPICall("getAllEmployees", `?page=${page}&limit=${pageLimit}`);
        setEmployees(updatedResponse.data?.page_data || []);
        setPageInformation(updatedResponse.data?.page_information || {});
      } else {
        setSnackbarMessage("Failed to create employee");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    } catch (err) {
      setSnackbarMessage(err.message || "Error creating employee");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      commonService.resetAPIFlag("adminCreateUser", false);
      commonService.resetAPIFlag("getAllEmployees", false);
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    try {
      if (!window.confirm('Are you sure you want to delete this employee?')) return;
      const response = await apiService.DeleteAPICall("deleteEmployee", employeeId);
      if (response.status === 1) {
        setSnackbarMessage(response.message || "Employee deleted successfully");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        const updatedResponse = await apiService.GetAPICall("getUsers", `?page=${page}&limit=${pageLimit}`);
        commonService.resetAPIFlag("getUsers", false);
        setEmployees(updatedResponse.data?.page_data || []);
        setPageInformation(updatedResponse.data?.page_information || {});
      } else {
        setSnackbarMessage(response.message || "Failed to delete employee");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
      commonService.resetAPIFlag("deleteEmployee", false);
      commonService.resetAPIFlag("getUsers", false);
    } catch (err) {
      commonService.resetAPIFlag("deleteEmployee", false);
      commonService.resetAPIFlag("getUsers", false);
      setSnackbarMessage("Error deleting employee");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      commonService.resetAPIFlag("deleteEmployee", false);
      commonService.resetAPIFlag("getUsers", false);
    }
  };

  const handleCloseSnackbar = () => setSnackbarOpen(false);

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
            Employees
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            Manage your team members and their roles
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
            Add Employee
          </Button>
        )}
      </Box>

      {(employeeLoading || dropdownLoading) ? (
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
              rows={employees}
              columns={columns}
              isAdmin={isAdmin}
              getRowId={(row) => row.user_id}
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

      <UpdateEmployeeForm open={openEditModal} onClose={() => setOpenEditModal(false)} onSubmit={handleUpdateEmployee} initialData={selectedEmployee} employeeList={employeeList} />
      <AddEmployeeForm
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={handleAddEmployee}
      />
    </Container>
  );
};

export default Employee;