import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Collapse,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { ExpandMore, ExpandLess, Visibility } from "@mui/icons-material";
import TableComponent from "../../components/Table/table.compoenent";
import { apiService, commonService } from "../../services";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

const formatDuration = (seconds) => {
  if (!seconds || seconds <= 0) return "0m 0s";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
  return `${mins}m ${secs}s`;
};

const getActivityColor = (percentage) => {
  if (percentage >= 80) return "#4caf50";
  if (percentage >= 50) return "#ff9800";
  return "#f44336";
};

const getActivityLabel = (percentage) => {
  if (percentage >= 80) return "High";
  if (percentage >= 50) return "Moderate";
  return "Low";
};

const ActivityLogs = () => {
  const { isAdmin } = useSelector((state) => state.login);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(dayjs().format("YYYY-MM-DD"));
  const [expandedRow, setExpandedRow] = useState(null);
  const [detailLogs, setDetailLogs] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [allSummaryData, setAllSummaryData] = useState([]);
  const [selectedDeveloper, setSelectedDeveloper] = useState("");

  useEffect(() => {
    fetchSummary();
  }, [dateFilter]);

  const developers = React.useMemo(() => {
    const uniqueDevs = new Map();
    allSummaryData.forEach((item) => {
      if (item.user_id && !uniqueDevs.has(item.user_id)) {
        uniqueDevs.set(item.user_id, { user_id: item.user_id, name: item.user_name });
      }
    });
    return Array.from(uniqueDevs.values());
  }, [allSummaryData]);

  const summaryData = React.useMemo(() => {
    if (!isAdmin || !selectedDeveloper) return allSummaryData;
    return allSummaryData.filter((item) => item.user_id === selectedDeveloper);
  }, [allSummaryData, selectedDeveloper, isAdmin]);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const query = dateFilter ? `?date=${dateFilter}` : "";
      const response = await apiService.GetAPICall("getActivitySummary", query);
      if (response.status === 1 && response.data) {
        setAllSummaryData(response.data);
      } else {
        setAllSummaryData([]);
      }
    } catch (err) {
      console.error("Error fetching activity summary:", err);
      setAllSummaryData([]);
    } finally {
      commonService.resetAPIFlag("getActivitySummary", false);
      setLoading(false);
    }
  };

  const fetchDetails = async (trackingId) => {
    if (expandedRow === trackingId) {
      setExpandedRow(null);
      setDetailLogs([]);
      return;
    }

    try {
      setDetailLoading(true);
      setExpandedRow(trackingId);
      const response = await apiService.GetAPICall("getActivityReport", trackingId);
      if (response.status === 1 && response.data) {
        setDetailLogs(response.data.logs || []);
      } else {
        setDetailLogs([]);
      }
    } catch (err) {
      console.error("Error fetching activity details:", err);
      setDetailLogs([]);
    } finally {
      commonService.resetAPIFlag("getActivityReport", false);
      setDetailLoading(false);
    }
  };

  const columns = [
    { field: "index", headerName: "#" },
    ...(isAdmin ? [{ field: "user_name", headerName: "Developer" }] : []),
    { field: "task_title", headerName: "Task" },
    {
      field: "total_duration",
      headerName: "Total Time",
      renderCell: (params) => (
        <Typography variant="body2">{formatDuration(params.value)}</Typography>
      ),
    },
    {
      field: "active_duration",
      headerName: "Active Time",
      renderCell: (params) => (
        <Typography variant="body2" color="#4caf50">
          {formatDuration(params.value)}
        </Typography>
      ),
    },
    {
      field: "inactive_duration",
      headerName: "Inactive Time",
      renderCell: (params) => (
        <Typography variant="body2" color="#f44336">
          {formatDuration(params.value)}
        </Typography>
      ),
    },
    {
      field: "activity_percentage",
      headerName: "Activity %",
      renderCell: (params) => {
        const pct = params.value || 0;
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
            <Box sx={{ flex: 1, minWidth: 60 }}>
              <LinearProgress
                variant="determinate"
                value={pct}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "#e0e0e0",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 4,
                    backgroundColor: getActivityColor(pct),
                  },
                }}
              />
            </Box>
            <Chip
              label={`${pct}%`}
              size="small"
              sx={{
                backgroundColor: getActivityColor(pct),
                color: "#fff",
                fontWeight: 600,
                fontSize: "0.7rem",
                height: 22,
              }}
            />
          </Box>
        );
      },
    },
    {
      field: "status",
      headerName: "Status",
      renderCell: (params) => {
        const status = params.value || "active";
        const colorMap = {
          active: "success",
          missed: "error",
          manual: "info",
          resolved: "warning",
        };
        return <Chip label={status} color={colorMap[status] || "default"} size="small" />;
      },
    },
    {
      field: "actions",
      headerName: "Details",
      renderCell: (params) => (
        <Tooltip title="View Activity Timeline">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              fetchDetails(params.row.tracking_id);
            }}
            sx={{ color: "primary.main" }}
          >
            {expandedRow === params.row.tracking_id ? (
              <ExpandLess fontSize="small" />
            ) : (
              <Visibility fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  const rows = summaryData.map((item, index) => ({
    ...item,
    index: index + 1,
    total_duration: item.active_duration + item.inactive_duration || item.total_duration || 0,
  }));

  return (
    <Container sx={{ backgroundColor: "white", borderRadius: "12px", padding: "10px" }}>
      <Paper
        sx={{
          padding: 3,
          borderRadius: "12px",
          backgroundColor: "white",
          boxShadow: "none",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h5" fontWeight={600}>
            {isAdmin ? "Developer Activity Logs" : "My Activity Logs"}
          </Typography>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            {isAdmin && (
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>All Developer</InputLabel>
                <Select
                  value={selectedDeveloper}
                  label="Developer"
                  onChange={(e) => setSelectedDeveloper(e.target.value)}
                >
                  <MenuItem value="">All Developers</MenuItem>
                  {developers.map((dev) => (
                    <MenuItem key={dev.user_id} value={dev.user_id}>
                      {dev.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <TextField
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              size="small"
              sx={{ width: 200 }}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </Box>

        {/* Summary Cards - User only */}
        {!isAdmin && !loading && summaryData.length > 0 && (
          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            <Paper
              sx={{
                p: 2,
                flex: 1,
                textAlign: "center",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
              }}
            >
              <Typography variant="h4" fontWeight={700} color="primary">
                {summaryData.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Sessions
              </Typography>
            </Paper>
            <Paper
              sx={{
                p: 2,
                flex: 1,
                textAlign: "center",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
              }}
            >
              <Typography variant="h4" fontWeight={700} color="#4caf50">
                {formatDuration(
                  summaryData.reduce((sum, d) => sum + (d.active_duration || 0), 0)
                )}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Active Time
              </Typography>
            </Paper>
            <Paper
              sx={{
                p: 2,
                flex: 1,
                textAlign: "center",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
              }}
            >
              <Typography variant="h4" fontWeight={700} color="#f44336">
                {formatDuration(
                  summaryData.reduce((sum, d) => sum + (d.inactive_duration || 0), 0)
                )}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Inactive Time
              </Typography>
            </Paper>
            <Paper
              sx={{
                p: 2,
                flex: 1,
                textAlign: "center",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
              }}
            >
              <Typography variant="h4" fontWeight={700} color="#ff9800">
                {(() => {
                  const totalActive = summaryData.reduce(
                    (sum, d) => sum + (d.active_duration || 0),
                    0
                  );
                  const totalInactive = summaryData.reduce(
                    (sum, d) => sum + (d.inactive_duration || 0),
                    0
                  );
                  const total = totalActive + totalInactive;
                  return total > 0 ? Math.round((totalActive / total) * 100) : 0;
                })()}
                %
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Avg. Activity
              </Typography>
            </Paper>
          </Box>
        )}

        <div style={{ overflowX: "auto" }}>
          {loading ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography>Loading activity data...</Typography>
            </Box>
          ) : (
            <TableComponent
              rows={rows}
              columns={columns}
              emptyMessage="No activity data found for this date"
              getRowId={(row) => row.tracking_id}
            />
          )}
        </div>

        {/* Expanded Detail View */}
        <Collapse in={expandedRow !== null} timeout="auto" unmountOnExit>
          <Paper
            sx={{
              mt: 2,
              p: 2,
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              backgroundColor: "#fafafa",
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Activity Timeline
            </Typography>
            {detailLoading ? (
              <Typography>Loading timeline...</Typography>
            ) : detailLogs.length === 0 ? (
              <Typography color="textSecondary">
                No activity heartbeats recorded for this session.
              </Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {detailLogs.map((log, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      p: 1,
                      borderLeft: `3px solid ${log.is_active ? "#4caf50" : "#f44336"}`,
                      backgroundColor: log.is_active
                        ? "rgba(76, 175, 80, 0.05)"
                        : "rgba(244, 67, 54, 0.05)",
                      borderRadius: "4px",
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: log.is_active ? "#4caf50" : "#f44336",
                        flexShrink: 0,
                      }}
                    />
                    <Typography variant="body2" sx={{ minWidth: 80, fontWeight: 600 }}>
                      {dayjs(log.timestamp).format("HH:mm:ss")}
                    </Typography>
                    <Chip
                      label={log.is_active ? "Active" : "Inactive"}
                      size="small"
                      sx={{
                        backgroundColor: log.is_active ? "#4caf50" : "#f44336",
                        color: "#fff",
                        fontSize: "0.7rem",
                        height: 20,
                      }}
                    />
                    <Chip
                      label={log.is_tab_visible ? "Tab Visible" : "Tab Hidden"}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: "0.7rem", height: 20 }}
                    />
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Collapse>
      </Paper>
    </Container>
  );
};

export default ActivityLogs;
