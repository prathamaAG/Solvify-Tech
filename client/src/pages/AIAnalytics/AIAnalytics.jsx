import React, { useState } from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  CircularProgress,
  LinearProgress,
  Chip,
  Divider,
  Alert,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PeopleIcon from "@mui/icons-material/People";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import RefreshIcon from "@mui/icons-material/Refresh";
import { apiService, commonService } from "../../services";

const AIAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const generateAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.GetAPICall("getAIAnalytics");

      if (response.status === 1) {
        setData(response.data);
      } else {
        setError(response.message || "Failed to generate analytics");
      }
    } catch (err) {
      console.error("AI Analytics error:", err);
      setError("Failed to connect to AI service. Please check your API key.");
    } finally {
      commonService.resetAPIFlag("getAIAnalytics", false);
      setLoading(false);
    }
  };

  const statCards = data
    ? [
        {
          title: "Total Projects",
          value: data.stats.total_projects,
          icon: <FolderOpenIcon />,
          gradient: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
        },
        {
          title: "Total Tasks",
          value: data.stats.total,
          icon: <AssignmentIcon />,
          gradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
        },
        {
          title: "Team Members",
          value: data.stats.total_employees,
          icon: <PeopleIcon />,
          gradient: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
        },
        {
          title: "Overdue",
          value: data.stats.overdue_count,
          icon: <WarningAmberIcon />,
          gradient:
            data.stats.overdue_count > 0
              ? "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)"
              : "linear-gradient(135deg, #10B981 0%, #059669 100%)",
        },
      ]
    : [];

  // Simple markdown-to-JSX renderer
  const renderMarkdown = (text) => {
    if (!text) return null;
    const lines = text.split("\n");
    return lines.map((line, i) => {
      // Headers
      if (line.startsWith("### "))
        return (
          <Typography
            key={i}
            variant="h6"
            sx={{ fontWeight: 700, color: "#334155", mt: 2, mb: 1, fontSize: "1rem" }}
          >
            {cleanMarkdown(line.replace("### ", ""))}
          </Typography>
        );
      if (line.startsWith("## "))
        return (
          <Typography
            key={i}
            variant="h5"
            sx={{ fontWeight: 700, color: "#1E293B", mt: 3, mb: 1 }}
          >
            {cleanMarkdown(line.replace("## ", ""))}
          </Typography>
        );
      if (line.startsWith("# "))
        return (
          <Typography
            key={i}
            variant="h4"
            sx={{ fontWeight: 800, color: "#0F172A", mt: 3, mb: 1 }}
          >
            {cleanMarkdown(line.replace("# ", ""))}
          </Typography>
        );
      // Bullet points
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        const content = line.trim().replace(/^[-*]\s+/, "");
        return (
          <Box key={i} sx={{ display: "flex", alignItems: "flex-start", mb: 0.5, ml: 2 }}>
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                backgroundColor: "#6366F1",
                mt: 1,
                mr: 1.5,
                flexShrink: 0,
              }}
            />
            <Typography variant="body2" sx={{ color: "#475569", lineHeight: 1.7 }}>
              {renderInline(content)}
            </Typography>
          </Box>
        );
      }
      // Numbered lists
      if (/^\d+\.\s/.test(line.trim())) {
        const content = line.trim().replace(/^\d+\.\s+/, "");
        const num = line.trim().match(/^(\d+)/)[1];
        return (
          <Box key={i} sx={{ display: "flex", alignItems: "flex-start", mb: 0.5, ml: 2 }}>
            <Chip
              label={num}
              size="small"
              sx={{
                width: 22,
                height: 22,
                fontSize: "0.7rem",
                fontWeight: 700,
                backgroundColor: "#EEF2FF",
                color: "#6366F1",
                mr: 1.5,
                mt: 0.3,
                "& .MuiChip-label": { p: 0 },
              }}
            />
            <Typography variant="body2" sx={{ color: "#475569", lineHeight: 1.7 }}>
              {renderInline(content)}
            </Typography>
          </Box>
        );
      }
      // Horizontal rules
      if (line.trim() === "---") return <Divider key={i} sx={{ my: 2 }} />;
      // Empty lines
      if (line.trim() === "") return <Box key={i} sx={{ height: 8 }} />;
      // Paragraphs
      return (
        <Typography key={i} variant="body2" sx={{ color: "#475569", lineHeight: 1.7, mb: 0.5 }}>
          {renderInline(line)}
        </Typography>
      );
    });
  };

  const cleanMarkdown = (text) => text.replace(/\*\*/g, "").replace(/\*/g, "");
  const renderInline = (text) => {
    // Handle bold **text**
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} style={{ color: "#1E293B" }}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <Container maxWidth="xl" sx={{ py: 1 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
            <AutoAwesomeIcon sx={{ color: "#6366F1", fontSize: 32 }} />
            <Typography variant="h3" sx={{ fontWeight: 700, color: "#0F172A" }}>
              AI Analytics
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: "#64748B" }}>
            AI-powered insights about your projects and team performance
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={data ? <RefreshIcon /> : <AutoAwesomeIcon />}
          onClick={generateAnalytics}
          disabled={loading}
          sx={{
            background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
            borderRadius: "12px",
            px: 3,
            py: 1.2,
            fontWeight: 600,
            textTransform: "none",
            fontSize: "0.9rem",
            boxShadow: "0 4px 15px rgba(99, 102, 241, 0.3)",
            "&:hover": {
              background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
              boxShadow: "0 6px 20px rgba(99, 102, 241, 0.4)",
            },
            "&:disabled": {
              background: "#CBD5E1",
            },
          }}
        >
          {loading ? "Generating..." : data ? "Regenerate" : "Generate Summary"}
        </Button>
      </Box>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: "12px" }}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <Paper
          sx={{
            p: 6,
            borderRadius: "16px",
            textAlign: "center",
            border: "1px solid rgba(0,0,0,0.04)",
          }}
        >
          <AutoAwesomeIcon sx={{ fontSize: 48, color: "#6366F1", mb: 2, animation: "spin 2s linear infinite", "@keyframes spin": { "0%": { transform: "rotate(0deg)" }, "100%": { transform: "rotate(360deg)" } } }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#334155", mb: 1 }}>
            Analyzing your data with AI...
          </Typography>
          <Typography variant="body2" sx={{ color: "#94A3B8", mb: 3 }}>
            This may take a few seconds
          </Typography>
          <LinearProgress
            sx={{
              maxWidth: 300,
              mx: "auto",
              borderRadius: 4,
              height: 6,
              backgroundColor: "#EEF2FF",
              "& .MuiLinearProgress-bar": {
                background: "linear-gradient(90deg, #6366F1, #8B5CF6)",
                borderRadius: 4,
              },
            }}
          />
        </Paper>
      )}

      {/* Empty state */}
      {!data && !loading && !error && (
        <Paper
          sx={{
            p: 8,
            borderRadius: "16px",
            textAlign: "center",
            border: "1px dashed rgba(99, 102, 241, 0.3)",
            backgroundColor: "#FAFAFE",
          }}
        >
          <AutoAwesomeIcon sx={{ fontSize: 64, color: "#C7D2FE", mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#334155", mb: 1 }}>
            Ready to analyze
          </Typography>
          <Typography variant="body1" sx={{ color: "#94A3B8", mb: 3, maxWidth: 400, mx: "auto" }}>
            Click "Generate Summary" to get AI-powered insights about your projects, tasks, and team performance.
          </Typography>
        </Paper>
      )}

      {/* Results */}
      {data && !loading && (
        <>
          {/* Stat Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {statCards.map((card, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    borderRadius: "16px",
                    border: "1px solid rgba(0,0,0,0.04)",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
                      transform: "translateY(-4px)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ color: "#64748B", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}
                        >
                          {card.title}
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: "#0F172A" }}>
                          {card.value}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: "12px",
                          background: card.gradient,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          "& .MuiSvgIcon-root": { fontSize: "1.3rem" },
                        }}
                      >
                        {card.icon}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={3}>
            {/* AI Summary */}
            <Grid item xs={12} md={8}>
              <Paper
                sx={{
                  p: 4,
                  borderRadius: "16px",
                  border: "1px solid rgba(0,0,0,0.04)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  minHeight: 400,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <AutoAwesomeIcon sx={{ color: "#6366F1" }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: "#0F172A" }}>
                    AI Summary
                  </Typography>
                  <Chip
                    label="Gemini"
                    size="small"
                    sx={{
                      ml: 1,
                      backgroundColor: "#EEF2FF",
                      color: "#6366F1",
                      fontWeight: 600,
                      fontSize: "0.7rem",
                    }}
                  />
                </Box>
                <Divider sx={{ mb: 2 }} />
                {renderMarkdown(data.summary)}
                <Box sx={{ mt: 3, pt: 2, borderTop: "1px solid #F1F5F9" }}>
                  <Typography variant="caption" sx={{ color: "#CBD5E1" }}>
                    Generated at {new Date(data.generated_at).toLocaleString()}
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* Project Progress */}
            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: "16px",
                  border: "1px solid rgba(0,0,0,0.04)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  minHeight: 400,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <TrendingUpIcon sx={{ color: "#10B981" }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: "#0F172A" }}>
                    Project Progress
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                {data.projects.length === 0 ? (
                  <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
                    No projects found
                  </Typography>
                ) : (
                  <Box sx={{ maxHeight: 350, overflowY: "auto" }}>
                    {data.projects.map((project, index) => (
                      <Box key={index} sx={{ mb: 2.5 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: "#334155" }}>
                            {project.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                              color:
                                project.completion_pct >= 75
                                  ? "#10B981"
                                  : project.completion_pct >= 40
                                  ? "#F59E0B"
                                  : "#EF4444",
                            }}
                          >
                            {project.completion_pct}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={project.completion_pct}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: "#F1F5F9",
                            "& .MuiLinearProgress-bar": {
                              borderRadius: 4,
                              backgroundColor:
                                project.completion_pct >= 75
                                  ? "#10B981"
                                  : project.completion_pct >= 40
                                  ? "#F59E0B"
                                  : "#EF4444",
                            },
                          }}
                        />
                        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.3 }}>
                          <Typography variant="caption" sx={{ color: "#94A3B8" }}>
                            {project.completed_tasks}/{project.total_tasks} tasks
                          </Typography>
                          {project.overdue_tasks > 0 && (
                            <Typography variant="caption" sx={{ color: "#EF4444", fontWeight: 600 }}>
                              {project.overdue_tasks} overdue
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Employee Performance */}
            {data.employees.length > 0 && (
              <Grid item xs={12}>
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: "16px",
                    border: "1px solid rgba(0,0,0,0.04)",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <PeopleIcon sx={{ color: "#F59E0B" }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#0F172A" }}>
                      Team Performance
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    {data.employees.map((emp, index) => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: "12px",
                            border: "1px solid #F1F5F9",
                            transition: "all 0.2s",
                            "&:hover": { borderColor: "#E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" },
                          }}
                        >
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: "#1E293B" }}>
                              {emp.name}
                            </Typography>
                            <Chip
                              label={emp.role}
                              size="small"
                              sx={{
                                fontSize: "0.65rem",
                                height: 20,
                                backgroundColor: emp.role === "admin" ? "#FEF3C7" : "#EEF2FF",
                                color: emp.role === "admin" ? "#D97706" : "#6366F1",
                                fontWeight: 600,
                              }}
                            />
                          </Box>
                          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                            <Chip
                              icon={<CheckCircleIcon sx={{ fontSize: "0.85rem !important" }} />}
                              label={`${emp.completed} done`}
                              size="small"
                              sx={{ fontSize: "0.7rem", height: 24, backgroundColor: "#ECFDF5", color: "#059669" }}
                            />
                            <Chip
                              label={`${emp.in_progress} active`}
                              size="small"
                              sx={{ fontSize: "0.7rem", height: 24, backgroundColor: "#EEF2FF", color: "#6366F1" }}
                            />
                            {emp.overdue > 0 && (
                              <Chip
                                icon={<WarningAmberIcon sx={{ fontSize: "0.85rem !important" }} />}
                                label={`${emp.overdue} overdue`}
                                size="small"
                                sx={{ fontSize: "0.7rem", height: 24, backgroundColor: "#FEF2F2", color: "#DC2626" }}
                              />
                            )}
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
            )}
          </Grid>
        </>
      )}
    </Container>
  );
};

export default AIAnalytics;
