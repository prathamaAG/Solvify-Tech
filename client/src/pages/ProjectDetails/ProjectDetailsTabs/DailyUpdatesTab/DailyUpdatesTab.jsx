import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Select,
  MenuItem,
  Paper,
  CircularProgress
} from "@mui/material";
import dayjs from "dayjs";
import { apiService, commonService } from "../../../../services";

const convertSecondsToHHMM = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
};

const DailyUpdatesTab = () => {
  const [selectedMember, setSelectedMember] = useState("");
  const [timeTrackingData, setTimeTrackingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTimeTrackingData = async () => {
      try {
        setLoading(true);
        const response = await apiService.GetAPICall("getReportTimeTracking");

        if (response.data) {
          setTimeTrackingData(response.data);
        } else {
          setError("No data available");
        }
      } catch (err) {
        console.error("Error fetching time tracking data:", err);
        setError("Failed to load time tracking data");
      } finally {

        commonService.resetAPIFlag("getReportTimeTracking", false);
        setLoading(false);
      }
    };

    fetchTimeTrackingData();
  }, []);

  // Extract unique member names for filter dropdown
  const memberNames = Array.from(
    new Set(
      timeTrackingData.flatMap(entry =>
        entry.members.map(member => member.name)
      )
    )
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box px={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={600}>Daily Updates</Typography>
        <Select
          value={selectedMember}
          onChange={(e) => setSelectedMember(e.target.value)}
          displayEmpty
          size="small"
        >
          <MenuItem value="">All Members</MenuItem>
          {memberNames.map((name, index) => (
            <MenuItem key={index} value={name}>{name}</MenuItem>
          ))}
        </Select>
      </Box>

      {timeTrackingData.length === 0 ? (
        <Typography variant="body1" color="textSecondary">
          No time tracking data available
        </Typography>
      ) : (
        timeTrackingData.map((entry, i) => (
          <Box key={i} mb={2.5}>
            <Typography variant="subtitle1" fontWeight={600} mb={2}>
              {dayjs(entry.date).format("DD MMM YYYY")}
            </Typography>

            {entry.members
              .filter((member) => !selectedMember || member.name === selectedMember)
              .map((member, j) => (
                <Paper
                  key={j}
                  variant="outlined"
                  sx={{ mb: 2, borderRadius: 2, overflow: "hidden" }}
                >
                  <Box
                    px={2}
                    py={1.5}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    bgcolor="#f9f9f9"
                    borderBottom="1px solid #eee"
                  >
                    <Typography fontWeight={500}>{member.name}</Typography>
                    <Typography color="primary" fontWeight={600}>
                      {convertSecondsToHHMM(member.tasks.reduce((sum, task) => sum + task.duration, 0))}
                    </Typography>
                  </Box>

                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                        <TableCell sx={{ width: "50px" }}>#</TableCell>
                        <TableCell>Task</TableCell>
                        <TableCell align="right" sx={{ width: "120px" }}>Time Spent</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {member.tasks.map((task, k) => (
                        <TableRow key={k}>
                          <TableCell>{k + 1}</TableCell>
                          <TableCell>{task.title}</TableCell>
                          <TableCell align="right">
                            {convertSecondsToHHMM(task.duration)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              ))}
          </Box>
        ))
      )}
    </Box>
  );
};

export default DailyUpdatesTab;