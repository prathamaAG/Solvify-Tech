import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import VideocamIcon from '@mui/icons-material/Videocam';
import NotificationsIcon from '@mui/icons-material/Notifications';
import TimelineIcon from '@mui/icons-material/Timeline';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const menuItem = {
  items: [
    {
      id: 'navigation',
      title: 'Materially',
      type: 'group',
      children: [
        {
          id: 'dashboard',
          title: 'Dashboard',
          type: 'item',
          url: '/dashboard',
          icon: DashboardIcon,
        },
      ],
    },
    {
      id: 'management',
      title: 'Management',
      type: 'group',
      children: [
        {
          id: 'employees',
          title: 'Employees',
          type: 'item',
          url: '/management/employees',
          icon: PeopleIcon,
        },
        {
          id: 'projects',
          title: 'Projects',
          type: 'item',
          url: '/management/projects',
          icon: WorkIcon,
        },
        {
          id: 'my-tasks',
          title: 'My Tasks',
          type: 'item',
          url: '/management/my-tasks',
          icon: AssignmentTurnedInIcon,
        },
        {
          id: 'organization',
          title: 'Organization',
          type: 'item',
          url: '/management/organization',
          icon: AccountTreeIcon, 
        },
        {
          id: 'meetings',
          title: 'Meetings',
          type: 'item',
          url: '/management/meetings',
          icon: VideocamIcon,
        },
        {
          id: 'activity-logs',
          title: 'Activity Logs',
          type: 'item',
          url: '/management/activity-logs',
          icon: TimelineIcon,
        },
      ],
    },
    {
      id: 'intelligence',
      title: 'Intelligence',
      type: 'group',
      children: [
        {
          id: 'ai-analytics',
          title: 'AI Analytics',
          type: 'item',
          url: '/management/ai-analytics',
          icon: AutoAwesomeIcon,
        },
      ],
    },
  ],
};

export default menuItem;

