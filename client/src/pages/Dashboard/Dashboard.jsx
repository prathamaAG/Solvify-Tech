import React, { useState, useEffect } from "react";
import { Container, Grid, Paper, Typography, Card, CardContent, CircularProgress, Box, LinearProgress } from "@mui/material";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { apiService, commonService } from "../../services";
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalEmployees: 0,
    activeProjects: 0,
  });

  const [employeeData, setEmployeeData] = useState([]);
  const [projectData, setProjectData] = useState([]);
  const [taskData, setTaskData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState({
    employees: null,
    projects: null,
    tasks: null
  });

  const COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const projectsResponse = await apiService.GetAPICall("getProjectsData");
        commonService.resetAPIFlag("getProjectsData", false);
        if (projectsResponse?.data) {
          setProjectData(projectsResponse.data);
        }

        const employeesResponse = await apiService.GetAPICall("getEmployeesData");
        commonService.resetAPIFlag("getEmployeesData", false);
        if (employeesResponse?.data) {
          setEmployeeData(employeesResponse.data);
        }

        const tasksResponse = await apiService.GetAPICall("getTasksData");
        commonService.resetAPIFlag("getTasksData", false);
        if (tasksResponse?.data) {
          setTaskData(tasksResponse.data);
        }

        if (projectsResponse?.data && employeesResponse?.data) {
          const totalProjects = projectsResponse.totalProjectsCount || projectsResponse.data.length;
          const activeProjects = projectsResponse.data.filter(
            p => p.status === "in progress"
          ).length;
          const totalEmployees = employeesResponse.data.reduce((sum, item) => sum + item.value, 0);

          setStats({
            totalProjects,
            activeProjects,
            totalEmployees,
          });
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError({
          employees: err.message,
          projects: err.message,
          tasks: err.message
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <CircularProgress sx={{ color: '#6366F1' }} />
      </Container>
    );
  }

  const statCards = [
    {
      title: "Total Projects",
      value: stats.totalProjects,
      icon: <FolderOpenIcon />,
      gradient: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
      lightBg: "#EEF2FF"
    },
    {
      title: "Active Projects",
      value: stats.activeProjects,
      icon: <TrendingUpIcon />,
      gradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
      lightBg: "#ECFDF5"
    },
    {
      title: "Total Employees",
      value: stats.totalEmployees,
      icon: <PeopleOutlineIcon />,
      gradient: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
      lightBg: "#FFFBEB"
    }
  ];

  // Completion color based on percentage
  const getCompletionColor = (pct) => {
    if (pct >= 75) return "#10B981";
    if (pct >= 40) return "#F59E0B";
    return "#EF4444";
  };

  return (
    <Container maxWidth="xl" sx={{ py: 1 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5 }}>
          Dashboard
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748B' }}>
          Here's what's happening with your projects today
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Stat Cards */}
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                borderRadius: '16px',
                border: '1px solid rgba(0,0,0,0.04)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'all 0.3s ease',
                overflow: 'visible',
                '&:hover': {
                  boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
                  transform: 'translateY(-4px)'
                }
              }}
            >
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ color: '#64748B', fontWeight: 500, fontSize: '0.8rem', mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                    >
                      {card.title}
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '2rem' }}>
                      {card.value}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '14px',
                      background: card.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.15)',
                      '& .MuiSvgIcon-root': { fontSize: '1.4rem' }
                    }}
                  >
                    {card.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Employee Distribution Chart */}
        <Grid item xs={12} md={6} lg={4}>
          <Paper
            sx={{
              p: 3,
              textAlign: "center",
              borderRadius: '16px',
              border: '1px solid rgba(0,0,0,0.04)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              transition: 'all 0.3s ease',
              '&:hover': { boxShadow: '0 8px 25px rgba(0,0,0,0.08)' }
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', mb: 2, textAlign: 'left' }}>
              Employee Distribution
            </Typography>
            {error.employees ? (
              <Typography color="error">Error loading employee data</Typography>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={employeeData} cx="50%" cy="50%" outerRadius={85} fill="#8884d8" dataKey="value" label
                    strokeWidth={2} stroke="#fff">
                    {employeeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} employees`, 'Count']}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* Project Completion Chart */}
        <Grid item xs={12} md={6} lg={4}>
          <Paper
            sx={{
              p: 3,
              borderRadius: '16px',
              border: '1px solid rgba(0,0,0,0.04)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              transition: 'all 0.3s ease',
              '&:hover': { boxShadow: '0 8px 25px rgba(0,0,0,0.08)' }
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', mb: 2, textAlign: 'left' }}>
              Project Progress
            </Typography>
            {error.projects ? (
              <Typography color="error">Error loading project data</Typography>
            ) : projectData.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 4 }}>No projects found</Typography>
            ) : (
              <Box sx={{ maxHeight: 250, overflowY: 'auto', pr: 1 }}>
                {projectData.map((project, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', fontSize: '0.8rem' }}>
                        {project.project_name}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: getCompletionColor(project.completion), fontSize: '0.8rem' }}>
                        {project.completion}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={project.completion}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: '#F1F5F9',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          backgroundColor: getCompletionColor(project.completion),
                        }
                      }}
                    />
                    <Typography variant="caption" sx={{ color: '#94A3B8', mt: 0.3, display: 'block' }}>
                      {project.completed_tasks}/{project.total_tasks} tasks completed
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Tasks Overview Chart */}
        <Grid item xs={12} md={6} lg={4}>
          <Paper
            sx={{
              p: 3,
              textAlign: "center",
              borderRadius: '16px',
              border: '1px solid rgba(0,0,0,0.04)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              transition: 'all 0.3s ease',
              '&:hover': { boxShadow: '0 8px 25px rgba(0,0,0,0.08)' }
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', mb: 2, textAlign: 'left' }}>
              My Tasks Overview
            </Typography>
            {error.tasks ? (
              <Typography color="error">Error loading task data</Typography>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={taskData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} fill="#82ca9d" dataKey="value" label
                    strokeWidth={2} stroke="#fff">
                    {taskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} tasks`, 'Count']}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;