import React, { useState, useEffect } from "react";
import {
  Container,
  Tabs,
  Tab,
  Paper,
  Divider,
  Chip,
  Button,
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
} from "@mui/material";
import TableComponent from "../../components/Table/table.compoenent";
import { useNavigate } from "react-router-dom";
import { apiService, commonService } from "../../services";
import { IconButton, Tooltip } from "@mui/material";
import { AddCircle, PlayArrow, Stop, CheckCircle, Visibility } from "@mui/icons-material";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import ManualTrackerModal from "../../components/Modal/ManualTrackerForm";
import toast, { Toaster } from "react-hot-toast";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import useActivityTracker from "../../hooks/useActivityTracker";

dayjs.extend(duration);

const MyTask = () => {
  const [tasks, setTasks] = useState([]);
  const [assignedByMeTasks, setAssignedByMeTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [runningTask, setRunningTask] = useState(null);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [activeTracking, setActiveTracking] = useState(null);
  const [adminView, setAdminView] = useState("myTasks");
  const navigate = useNavigate();

  const { isAdmin } = useSelector((state) => state.login);

  // Activity tracking — sends heartbeats every 30s while timer is running
  useActivityTracker(activeTracking);

  const [openModal, setOpenModal] = useState(false);
  const [manualTimeData, setManualTimeData] = useState({
    taskId: null,
    startTime: "",
    endTime: "",
    reason: "",
  });

  const location = useLocation();
  const from = location.state?.from;
  const missedTrackerData = location.state?.data;

  useEffect(() => {
    if (from === "manualTimeRequestPage" && missedTrackerData) {
      console.log(missedTrackerData);
    }
  }, [from, missedTrackerData]);

  const handleOpenModal = (taskId) => {
    setManualTimeData({ ...manualTimeData, taskId });
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleSubmitManualTracker = async (values) => {
    const loadingToast = toast.loading('Submitting manual time entry...');
    try {
      const body = {
        task_id: values.task_id,
        date: values.date,
        start_time: values.start_time,
        end_time: values.end_time,
        reason: values.reason
      };
      const response = await apiService.PostAPICall("submitManualTimeTracking", body);
      switch (response.status) {
        case 1:
          toast.success(response.message, { id: loadingToast });
          setOpenModal(false);
          break;
        case 0:
          toast.error(response.message, { id: loadingToast });
          break;
        default:
          toast.error("Unexpected response", { id: loadingToast });
          throw new Error("Unexpected response status");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit manual tracker", {
        id: loadingToast,
      });
    } finally {
      commonService.resetAPIFlag("submitManualTimeTracking", false);
    }
  };

  const taskStatuses = ["Pending", "In progress", "To Be Verified", "Completed"];

  useEffect(() => {
    fetchTasks();
    checkActiveTracking();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      if (isAdmin) {
        const response = await apiService.GetAPICall("getAdminTasks");
        commonService.resetAPIFlag("getAdminTasks", false);
        if (response?.status === 1 && response?.data) {
          setTasks(response.data.myTasks || []);
          setAssignedByMeTasks(response.data.assignedByMe || []);
        }
      } else {
        const response = await apiService.GetAPICall("getUserTasks");
        commonService.resetAPIFlag("getUserTasks", false);
        if (response?.status === 1 && response?.data) {
          setTasks(response.data);
        }
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
      toast.error("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const checkActiveTracking = async () => {
    try {
      const response = await apiService.GetAPICall("getActiveTimeTracking");
      commonService.resetAPIFlag("getActiveTimeTracking", false);
      if (response?.status === 1 && response?.data) {
        setActiveTracking(response.data);
        if (response.data.start_time && !response.data.end_time) {
          const startTime = dayjs(response.data.start_time);
          const now = dayjs();
          setSecondsElapsed(now.diff(startTime, 'second'));
        }
      } else {
        setActiveTracking(null);
        setSecondsElapsed(0);
      }
    } catch (err) {
      setActiveTracking(null);
      setSecondsElapsed(0);
    }
  };

  useEffect(() => {
    let interval;
    if (activeTracking && !activeTracking.end_time) {
      interval = setInterval(() => {
        setSecondsElapsed(prev => prev + 1);
      }, 1000);
    } else {
      setSecondsElapsed(0);
    }
    return () => clearInterval(interval);
  }, [activeTracking]);

  const formatTime = (seconds) => {
    const dur = dayjs.duration(seconds, "seconds");
    return `${String(dur.hours()).padStart(2, "0")}:${String(dur.minutes()).padStart(2, "0")}:${String(dur.seconds()).padStart(2, "0")}`;
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const startTracking = async (taskId) => {
    try {
      const response = await apiService.PostAPICall("startTimeTracking", { task_id: taskId });
      commonService.resetAPIFlag("startTimeTracking", false);
      if (response?.status === 1 && response?.data) {
        setActiveTracking(response.data);
        setSecondsElapsed(0);
        toast.success("Time tracking started");
        await fetchTasks();
      } else {
        toast.error(response?.message || "Failed to start tracking");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to start tracking");
    }
  };

  const stopTracking = async () => {
    if (!activeTracking) return;
    try {
      const response = await apiService.PostAPICall("stopTimeTracking", { task_id: activeTracking.task_id });
      commonService.resetAPIFlag("stopTimeTracking", false);
      if (response?.status === 1) {
        const minutes = Math.round(secondsElapsed / 60);
        toast.success(`Time tracking stopped (${minutes} minutes)`);
        setActiveTracking(null);
        setSecondsElapsed(0);
        await fetchTasks();
      } else {
        toast.error(response?.message || "Failed to stop tracking");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to stop tracking");
    }
  };

  const markTaskComplete = async (taskId) => {
    try {
      const response = await apiService.PutAPICall("updateTask", { task_id: taskId, status: "Completed" });
      commonService.resetAPIFlag("updateTask", false);
      if (response?.status === 1) {
        toast.success("Task marked as completed");
        await fetchTasks();
      } else {
        toast.error(response?.message || "Failed to mark task complete");
      }
    } catch (err) {
      toast.error("Failed to mark task as complete");
    }
  };

  const currentTaskList = isAdmin && adminView === "assignedByMe" ? assignedByMeTasks : tasks;

  const filteredTasks = currentTaskList.filter((task) => {
    const normalizedStatus = task.status.toLowerCase().replace(/\s+/g, " ");
    const normalizedTabStatus = taskStatuses[selectedTab].toLowerCase().replace(/\s+/g, " ");
    return normalizedStatus === normalizedTabStatus;
  });

  const getPriorityChip = (priority) => {
    const colorMap = {
      High: { bg: '#FEF2F2', color: '#EF4444' },
      Medium: { bg: '#FFFBEB', color: '#F59E0B' },
      Low: { bg: '#ECFDF5', color: '#10B981' },
    };
    const c = colorMap[priority] || { bg: '#F1F5F9', color: '#64748B' };
    return <Chip label={priority} size="small" sx={{ backgroundColor: c.bg, color: c.color, fontWeight: 600, fontSize: '0.7rem', borderRadius: '6px' }} />;
  };

  const getColumns = () => {
    const baseColumns = [
      { field: "index", headerName: "#" },
      { field: "title", headerName: "Task Title" },
      { field: "due_date", headerName: "Due Date" },
      { field: "project_name", headerName: "Project" },
      { field: "card_title", headerName: "Stage" },
      {
        field: "priority",
        headerName: "Priority",
        renderCell: (params) => getPriorityChip(params.value),
      },
    ];

    if (isAdmin && adminView === "assignedByMe") {
      baseColumns.push({ field: "assignee_name", headerName: "Assigned To" });
    } else {
      baseColumns.push({ field: "assign_by", headerName: "Assigned By" });
    }

    const currentStatus = taskStatuses[selectedTab];
    const isAssignedByMeView = isAdmin && adminView === "assignedByMe";

    baseColumns.push({
      field: "actions",
      headerName: "Actions",
      renderCell: (params) => {
        const isRunning = activeTracking?.task?.task_id === params.row.task_id;
        const isAnyRunning = activeTracking && !activeTracking.end_time;

        return (
          <Box sx={{ display: "flex", gap: 0.5 }}>
            {!isAssignedByMeView && (currentStatus === "Pending" || currentStatus === "In progress") && (
              <>
                <Tooltip title={isRunning ? "Stop Task" : "Start Task"}>
                  <IconButton
                    size="small"
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (isRunning) {
                        await stopTracking();
                      } else {
                        if (isAnyRunning) {
                          alert("Please stop the currently running task first");
                          return;
                        }
                        await startTracking(params.row.task_id);
                      }
                    }}
                    sx={{
                      width: 32, height: 32, borderRadius: '8px',
                      backgroundColor: isRunning ? '#FEF2F2' : '#EEF2FF',
                      color: isRunning ? '#EF4444' : '#6366F1',
                      '&:hover': {
                        backgroundColor: isRunning ? '#FEE2E2' : '#E0E7FF'
                      }
                    }}
                  >
                    {isRunning ? <Stop sx={{ fontSize: '1rem' }} /> : <PlayArrow sx={{ fontSize: '1rem' }} />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Request Manual Tracker">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenModal(params.row.task_id);
                    }}
                    sx={{
                      width: 32, height: 32, borderRadius: '8px',
                      backgroundColor: '#FFFBEB',
                      color: '#F59E0B',
                      '&:hover': { backgroundColor: '#FEF3C7' }
                    }}
                  >
                    <AddCircle sx={{ fontSize: '1rem' }} />
                  </IconButton>
                </Tooltip>
              </>
            )}

            {(currentStatus === "In progress" || currentStatus === "To Be Verified") && (
              <Tooltip title="Mark as Complete">
                <IconButton
                  size="small"
                  onClick={async (e) => {
                    e.stopPropagation();
                    await markTaskComplete(params.row.task_id);
                  }}
                  sx={{
                    width: 32, height: 32, borderRadius: '8px',
                    backgroundColor: '#ECFDF5',
                    color: '#10B981',
                    '&:hover': { backgroundColor: '#D1FAE5' }
                  }}
                >
                  <CheckCircle sx={{ fontSize: '1rem' }} />
                </IconButton>
              </Tooltip>
            )}

            <Tooltip title="View Details">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick(params.row.task_id);
                }}
                sx={{
                  width: 32, height: 32, borderRadius: '8px',
                  backgroundColor: '#ECFEFF',
                  color: '#06B6D4',
                  '&:hover': { backgroundColor: '#CFFAFE' }
                }}
              >
                <Visibility sx={{ fontSize: '1rem' }} />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    });

    return baseColumns;
  };

  const rows = filteredTasks.map((task, index) => ({
    ...task,
    index: index + 1,
    project_name: task.card?.project?.project_name || "N/A",
    project_id: task.card?.project?.project_id || "N/A",
    card_title: task.card?.title || "N/A",
    assign_by_name: task.assign_by?.name || "N/A",
    assignee_name: task.assignee_name || "N/A",
  }));

  const handleClick = (task_id) => {
    const allTasks = [...tasks, ...assignedByMeTasks];
    const task = allTasks.find((t) => t.task_id === task_id);
    if (task?.card?.project?.project_id) {
      navigate(`/management/projects/details/${task.card.project.project_id}`);
    }
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Container maxWidth="xl">
        {/* Page Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5 }}>
            My Tasks
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            Track and manage your assigned tasks
          </Typography>
        </Box>

        <Paper
          sx={{
            borderRadius: '16px',
            border: '1px solid rgba(0,0,0,0.04)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            overflow: 'hidden'
          }}
        >
          {/* Task Tracker Banner */}
          <Box
            sx={{
              p: 2.5,
              background: activeTracking && !activeTracking.end_time
                ? 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)'
                : '#F8FAFC',
              color: activeTracking && !activeTracking.end_time ? '#fff' : '#64748B',
              borderBottom: '1px solid rgba(0,0,0,0.04)',
              transition: 'all 0.3s ease'
            }}
          >
            {activeTracking && !activeTracking.end_time ? (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Currently Tracking
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>
                    {activeTracking.task?.title || "Current Task"}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                  <Typography variant="h4" sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#fff', letterSpacing: '0.05em' }}>
                    {formatTime(secondsElapsed)}
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Stop />}
                    onClick={stopTracking}
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      color: '#fff',
                      borderRadius: '10px',
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.3)',
                      }
                    }}
                  >
                    Stop
                  </Button>
                </Box>
              </Box>
            ) : (
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                No task being tracked currently — start a task to begin tracking
              </Typography>
            )}
          </Box>

          <Box sx={{ p: 2.5 }}>
            {/* Admin View Switcher */}
            {isAdmin && (
              <Box sx={{ mb: 2.5 }}>
                <ToggleButtonGroup
                  value={adminView}
                  exclusive
                  onChange={(e, newView) => {
                    if (newView !== null) {
                      setAdminView(newView);
                      setSelectedTab(0);
                    }
                  }}
                  size="small"
                  sx={{
                    backgroundColor: '#F1F5F9',
                    borderRadius: '12px',
                    p: 0.5,
                    '& .MuiToggleButton-root': {
                      textTransform: 'none',
                      px: 3,
                      py: 0.8,
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      border: 'none',
                      borderRadius: '10px !important',
                      color: '#64748B',
                      '&.Mui-selected': {
                        backgroundColor: '#fff',
                        color: '#6366F1',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                        '&:hover': {
                          backgroundColor: '#fff',
                        }
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(99, 102, 241, 0.05)',
                      }
                    }
                  }}
                >
                  <ToggleButton value="myTasks">
                    My Tasks ({tasks.length})
                  </ToggleButton>
                  <ToggleButton value="assignedByMe">
                    Assigned by Me ({assignedByMeTasks.length})
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            )}

            {/* Status Tabs */}
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              textColor="primary"
              indicatorColor="primary"
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: '40px',
                '& .MuiTab-root': {
                  minHeight: '40px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: '10px',
                  mx: 0.5,
                  color: '#64748B',
                  '&.Mui-selected': {
                    color: '#6366F1',
                    backgroundColor: '#EEF2FF'
                  }
                },
                '& .MuiTabs-indicator': {
                  display: 'none'
                }
              }}
            >
              {taskStatuses.map((status, index) => {
                const count = currentTaskList.filter((task) => {
                  const normalizedStatus = task.status.toLowerCase().replace(/\s+/g, " ");
                  const normalizedTabStatus = status.toLowerCase().replace(/\s+/g, " ");
                  return normalizedStatus === normalizedTabStatus;
                }).length;
                return <Tab key={index} label={`${status} (${count})`} />;
              })}
            </Tabs>

            <Box sx={{ mt: 2.5 }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                  <CircularProgress sx={{ color: '#6366F1' }} />
                </Box>
              ) : (
                <TableComponent
                  rows={rows}
                  columns={getColumns()}
                  emptyMessage={`No ${taskStatuses[selectedTab]} tasks found`}
                  getRowId={(row) => row.task_id}
                  handleClick={handleClick}
                />
              )}
            </Box>
          </Box>

          <ManualTrackerModal
            open={openModal}
            onClose={handleCloseModal}
            onSubmit={handleSubmitManualTracker}
            taskId={manualTimeData.taskId}
          />
        </Paper>
      </Container>
    </>
  );
};

export default MyTask;