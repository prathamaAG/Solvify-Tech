import React, { useState, useEffect, useRef } from 'react';
import {
  IconButton,
  Badge,
  Popper,
  Paper,
  ClickAwayListener,
  Typography,
  Box,
  Button,
  Divider,
  CircularProgress,
  Fade
} from '@mui/material';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EventIcon from '@mui/icons-material/Event';
import InfoIcon from '@mui/icons-material/Info';
import { apiService, commonService } from '../../../../services';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const notifTypeConfig = {
  task_assigned: { icon: <AssignmentIcon sx={{ fontSize: '1rem' }} />, color: '#6366F1', bg: '#EEF2FF' },
  task_due: { icon: <AccessTimeIcon sx={{ fontSize: '1rem' }} />, color: '#F59E0B', bg: '#FFFBEB' },
  task_completed: { icon: <CheckCircleIcon sx={{ fontSize: '1rem' }} />, color: '#10B981', bg: '#ECFDF5' },
  meeting_scheduled: { icon: <EventIcon sx={{ fontSize: '1rem' }} />, color: '#8B5CF6', bg: '#F3E8FF' },
  general: { icon: <InfoIcon sx={{ fontSize: '1rem' }} />, color: '#64748B', bg: '#F1F5F9' }
};

const NotificationSection = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const anchorRef = useRef(null);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await apiService.GetAPICall('getUnreadNotificationCount');
      commonService.resetAPIFlag('getUnreadNotificationCount', false);
      if (response?.status === 1) {
        setUnreadCount(response.data.unread_count);
      }
    } catch (err) {
      // Silently fail — non-critical
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await apiService.GetAPICall('getNotifications', '?limit=15');
      commonService.resetAPIFlag('getNotifications', false);
      if (response?.status === 1) {
        setNotifications(response.data.notifications || []);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    if (!open) {
      fetchNotifications();
    }
    setOpen(!open);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleMarkAllRead = async () => {
    try {
      const response = await apiService.PutAPICall('markAllNotificationsRead', {});
      commonService.resetAPIFlag('markAllNotificationsRead', false);
      if (response?.status === 1) {
        setNotifications(notifications.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleMarkRead = async (notificationId) => {
    try {
      const response = await apiService.PutAPICall('markNotificationRead', {}, notificationId);
      commonService.resetAPIFlag('markNotificationRead', false);
      if (response?.status === 1) {
        setNotifications(notifications.map(n =>
          n.notification_id === notificationId ? { ...n, is_read: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  return (
    <>
      <IconButton
        ref={anchorRef}
        onClick={handleToggle}
        sx={{
          borderRadius: '12px',
          p: 1,
          color: '#fff',
          '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' }
        }}
      >
        <Badge
          badgeContent={unreadCount}
          sx={{
            '& .MuiBadge-badge': {
              backgroundColor: '#EF4444',
              color: '#fff',
              fontSize: '0.65rem',
              fontWeight: 700,
              minWidth: 18,
              height: 18,
            }
          }}
        >
          <NotificationsNoneIcon />
        </Badge>
      </IconButton>

      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement="bottom-end"
        transition
        style={{ zIndex: 1300 }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps}>
            <Paper
              sx={{
                width: 380,
                maxHeight: 480,
                borderRadius: '16px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                overflow: 'hidden',
                mt: 1
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <Box>
                  {/* Header */}
                  <Box
                    sx={{
                      p: 2,
                      background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Box>
                      <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>
                        Notifications
                      </Typography>
                      {unreadCount > 0 && (
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem' }}>
                          {unreadCount} unread
                        </Typography>
                      )}
                    </Box>
                    {unreadCount > 0 && (
                      <Button
                        size="small"
                        startIcon={<DoneAllIcon sx={{ fontSize: '0.85rem' }} />}
                        onClick={handleMarkAllRead}
                        sx={{
                          color: '#fff',
                          fontSize: '0.7rem',
                          textTransform: 'none',
                          fontWeight: 600,
                          borderRadius: '8px',
                          backgroundColor: 'rgba(255,255,255,0.15)',
                          '&:hover': { backgroundColor: 'rgba(255,255,255,0.25)' }
                        }}
                      >
                        Mark all read
                      </Button>
                    )}
                  </Box>

                  {/* Notification List */}
                  <Box sx={{ maxHeight: 380, overflowY: 'auto' }}>
                    {loading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress size={28} sx={{ color: '#6366F1' }} />
                      </Box>
                    ) : notifications.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <NotificationsNoneIcon sx={{ fontSize: 40, color: '#CBD5E1', mb: 1 }} />
                        <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                          No notifications yet
                        </Typography>
                      </Box>
                    ) : (
                      notifications.map((notif, index) => {
                        const config = notifTypeConfig[notif.type] || notifTypeConfig.general;
                        return (
                          <React.Fragment key={notif.notification_id}>
                            <Box
                              onClick={() => !notif.is_read && handleMarkRead(notif.notification_id)}
                              sx={{
                                px: 2,
                                py: 1.5,
                                display: 'flex',
                                gap: 1.5,
                                cursor: !notif.is_read ? 'pointer' : 'default',
                                backgroundColor: notif.is_read ? '#fff' : '#F8FAFC',
                                borderLeft: notif.is_read ? '3px solid transparent' : `3px solid ${config.color}`,
                                transition: 'all 0.15s ease',
                                '&:hover': {
                                  backgroundColor: notif.is_read ? '#FAFAFA' : '#F1F5F9'
                                }
                              }}
                            >
                              <Box
                                sx={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: '10px',
                                  backgroundColor: config.bg,
                                  color: config.color,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                  mt: 0.3
                                }}
                              >
                                {config.icon}
                              </Box>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                  variant="subtitle2"
                                  sx={{
                                    fontWeight: notif.is_read ? 500 : 700,
                                    color: '#0F172A',
                                    fontSize: '0.8rem',
                                    lineHeight: 1.3,
                                    mb: 0.3
                                  }}
                                >
                                  {notif.title}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: '#64748B',
                                    fontSize: '0.72rem',
                                    lineHeight: 1.4,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                  }}
                                >
                                  {notif.message}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.65rem' }}>
                                  {dayjs(notif.created_at).fromNow()}
                                </Typography>
                              </Box>
                              {!notif.is_read && (
                                <Box
                                  sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    backgroundColor: config.color,
                                    flexShrink: 0,
                                    mt: 1
                                  }}
                                />
                              )}
                            </Box>
                            {index < notifications.length - 1 && (
                              <Divider sx={{ mx: 2 }} />
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
                  </Box>
                </Box>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  );
};

export default NotificationSection;
