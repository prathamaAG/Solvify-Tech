import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LinkIcon from '@mui/icons-material/Link';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupsIcon from '@mui/icons-material/Groups';
import { apiService, commonService } from '../../services';
import { useSelector } from 'react-redux';
import ScheduleMeetingForm from '../../components/Modal/ScheduleMeetingForm';
import dayjs from 'dayjs';

const Meetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const { isAdmin } = useSelector((state) => state.login);

  useEffect(() => {
    fetchMeetings();
    if (isAdmin) fetchProjects();
  }, []);

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const response = await apiService.GetAPICall('getMeetings');
      commonService.resetAPIFlag('getMeetings', false);
      if (response?.status === 1) {
        setMeetings(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching meetings:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await apiService.GetAPICall('getAllProjects', '?page=1&limit=100');
      commonService.resetAPIFlag('getAllProjects', false);
      if (response?.data?.page_data) {
        setProjects(response.data.page_data);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const handleScheduleMeeting = async (formData) => {
    setSubmitLoading(true);
    try {
      const response = await apiService.PostAPICall('createMeeting', formData);
      commonService.resetAPIFlag('createMeeting', false);
      if (response?.status === 1) {
        setSnackbarMessage('Meeting scheduled successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        setOpenModal(false);
        await fetchMeetings();
      } else {
        setSnackbarMessage(response?.message || 'Failed to schedule meeting');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch (err) {
      setSnackbarMessage('Error scheduling meeting');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    if (!window.confirm('Are you sure you want to delete this meeting?')) return;
    try {
      const response = await apiService.DeleteAPICall('deleteMeeting', meetingId);
      commonService.resetAPIFlag('deleteMeeting', false);
      if (response?.status === 1) {
        setSnackbarMessage('Meeting deleted');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        await fetchMeetings();
      }
    } catch (err) {
      setSnackbarMessage('Error deleting meeting');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const formatTime12h = (time) => {
    if (!time) return '';
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    const amPm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${amPm}`;
  };

  // Ensure meeting link opens externally with proper protocol
  const ensureAbsoluteUrl = (url) => {
    if (!url) return '';
    // Try to extract a URL from the text (user may paste full meeting details)
    const urlMatch = url.match(/https?:\/\/[^\s]+/);
    if (urlMatch) return urlMatch[0];
    // If no protocol, add https://
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return 'https://' + url;
    }
    return url;
  };

  // Group meetings by date
  const groupedMeetings = meetings.reduce((groups, meeting) => {
    const date = meeting.meeting_date;
    if (!groups[date]) groups[date] = [];
    groups[date].push(meeting);
    return groups;
  }, {});

  return (
    <Container maxWidth="xl">
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ borderRadius: '12px' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5 }}>
            Meetings
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            View and manage scheduled meetings
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
            Schedule Meeting
          </Button>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#6366F1' }} />
        </Box>
      ) : meetings.length === 0 ? (
        <Paper sx={{ textAlign: 'center', py: 8, borderRadius: '16px', border: '1px solid rgba(0,0,0,0.04)' }}>
          <GroupsIcon sx={{ fontSize: 60, color: '#CBD5E1', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#94A3B8', fontWeight: 600 }}>
            No upcoming meetings
          </Typography>
          <Typography variant="body2" sx={{ color: '#CBD5E1', mt: 0.5 }}>
            {isAdmin ? 'Schedule a meeting for your team' : 'Check back later for scheduled meetings'}
          </Typography>
        </Paper>
      ) : (
        Object.entries(groupedMeetings).map(([date, dateMeetings]) => (
          <Box key={date} sx={{ mb: 3 }}>
            {/* Date Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <EventIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.95rem' }}>
                {dayjs(date).format('dddd, MMMM D, YYYY')}
              </Typography>
              <Chip
                label={`${dateMeetings.length} meeting${dateMeetings.length > 1 ? 's' : ''}`}
                size="small"
                sx={{ backgroundColor: '#EEF2FF', color: '#6366F1', fontWeight: 600, fontSize: '0.7rem' }}
              />
            </Box>

            {/* Meeting Cards */}
            {dateMeetings.map((meeting) => (
              <Paper
                key={meeting.meeting_id}
                sx={{
                  p: 2.5,
                  borderRadius: '14px',
                  border: '1px solid rgba(0,0,0,0.04)',
                  mb: 1.5,
                  borderLeft: '4px solid #8B5CF6',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                    transform: 'translateY(-1px)',
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.95rem', mb: 0.5 }}>
                      {meeting.title}
                    </Typography>
                    {meeting.description && (
                      <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.8rem', mb: 1 }}>
                        {meeting.description}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTimeIcon sx={{ fontSize: '0.85rem', color: '#6366F1' }} />
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500, fontSize: '0.75rem' }}>
                          {formatTime12h(meeting.start_time)} — {formatTime12h(meeting.end_time)}
                        </Typography>
                      </Box>
                      <Chip
                        label={meeting.Project?.project_name || 'Unknown'}
                        size="small"
                        sx={{ backgroundColor: '#F3E8FF', color: '#8B5CF6', fontWeight: 600, fontSize: '0.7rem', borderRadius: '6px' }}
                      />
                      <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.7rem' }}>
                        by {meeting.Scheduler?.name || 'Admin'}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {meeting.meeting_link && (
                      <Tooltip title="Open Meeting Link">
                        <IconButton
                          size="small"
                          onClick={() => window.open(ensureAbsoluteUrl(meeting.meeting_link), '_blank')}
                          sx={{
                            color: '#6366F1',
                            backgroundColor: '#EEF2FF',
                            borderRadius: '8px',
                            width: 32,
                            height: 32,
                            '&:hover': { backgroundColor: '#E0E7FF' }
                          }}
                        >
                          <LinkIcon sx={{ fontSize: '1rem' }} />
                        </IconButton>
                      </Tooltip>
                    )}
                    {isAdmin && (
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteMeeting(meeting.meeting_id)}
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
                    )}
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>
        ))
      )}

      <ScheduleMeetingForm
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={handleScheduleMeeting}
        projects={projects}
        loading={submitLoading}
      />
    </Container>
  );
};

export default Meetings;
