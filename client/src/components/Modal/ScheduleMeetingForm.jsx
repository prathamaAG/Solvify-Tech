import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  MenuItem,
  CircularProgress,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const ScheduleMeetingForm = ({ open, onClose, onSubmit, projects = [], loading }) => {
  const [formData, setFormData] = useState({
    project_id: '',
    title: '',
    description: '',
    meeting_date: '',
    start_time: '',
    end_time: '',
    meeting_link: '',
  });

  const handleChange = (e) => {
    let value = e.target.value;
    // Auto-extract URL from pasted text in meeting_link field
    if (e.target.name === 'meeting_link' && value.length > 0) {
      const urlMatch = value.match(/https?:\/\/[^\s"<>]+/);
      if (urlMatch) {
        value = urlMatch[0];
      }
    }
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = () => {
    if (!formData.project_id || !formData.title || !formData.meeting_date || !formData.start_time || !formData.end_time) {
      return;
    }
    onSubmit(formData);
    setFormData({
      project_id: '',
      title: '',
      description: '',
      meeting_date: '',
      start_time: '',
      end_time: '',
      meeting_link: '',
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          overflow: 'hidden',
        }
      }}
    >
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
          color: '#fff',
          fontWeight: 700,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        Schedule Meeting
        <IconButton onClick={onClose} sx={{ color: '#fff' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 3, pb: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
          <TextField
            select
            label="Project"
            name="project_id"
            value={formData.project_id}
            onChange={handleChange}
            fullWidth
            required
            size="small"
          >
            {projects.map((p) => (
              <MenuItem key={p.project_id} value={p.project_id}>
                {p.project_name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Meeting Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            fullWidth
            required
            size="small"
          />

          <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
            size="small"
          />

          <TextField
            label="Meeting Date"
            name="meeting_date"
            type="date"
            value={formData.meeting_date}
            onChange={handleChange}
            fullWidth
            required
            size="small"
            InputLabelProps={{ shrink: true }}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Start Time"
              name="start_time"
              type="time"
              value={formData.start_time}
              onChange={handleChange}
              fullWidth
              required
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Time"
              name="end_time"
              type="time"
              value={formData.end_time}
              onChange={handleChange}
              fullWidth
              required
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          <TextField
            label="Meeting Link (optional)"
            name="meeting_link"
            value={formData.meeting_link}
            onChange={handleChange}
            fullWidth
            size="small"
            placeholder="https://meet.google.com/..."
            helperText="Paste a Google Meet / Zoom link. URLs are auto-extracted if you paste full text."
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button
          onClick={onClose}
          sx={{
            borderRadius: '10px',
            px: 3,
            textTransform: 'none',
            fontWeight: 600,
            color: '#64748B',
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{
            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
            borderRadius: '10px',
            px: 3,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
            }
          }}
        >
          {loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Schedule'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScheduleMeetingForm;
