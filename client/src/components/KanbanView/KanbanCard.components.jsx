import { Draggable } from "react-beautiful-dnd";
import styled from "@emotion/styled";
import {
  IconButton,
  Chip,
  Avatar,
  Typography,
  Box,
  Tooltip
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from "@mui/icons-material/Person";
import FlagIcon from "@mui/icons-material/Flag";
import CircleIcon from "@mui/icons-material/Circle";

// Priority color mapping
const priorityColors = {
  High: 'error',
  Medium: 'warning',
  Low: 'success'
};

const priorityBorderColors = {
  High: '#EF4444',
  Medium: '#F59E0B',
  Low: '#10B981'
};

// Status color mapping
const statusColors = {
  Pending: 'default',
  Inprogress: 'primary',
  'To be verified': 'secondary',
  Completed: 'success'
};

const TaskInformation = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: 16px;
  min-height: 100px;
  border-radius: 12px;
  max-width: 311px;
  background: white;
  margin-top: 10px;
  gap: 8px;
  border: 1px solid rgba(0,0,0,0.04);
  border-left: 3px solid ${props => props.priorityColor || '#6366F1'};
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  transition: all 0.2s ease-in-out;
  cursor: pointer;

  &:hover {
    box-shadow: 0 6px 16px rgba(0,0,0,0.08);
    transform: translateY(-2px);
  }
`;

const TaskTitle = styled(Typography)`
  font-weight: 600;
  color: #0F172A;
  margin-bottom: 2px;
  line-height: 1.4;
  font-size: 0.85rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TaskDescription = styled(Typography)`
  color: #64748B;
  font-size: 0.8rem;
  line-height: 1.5;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-left: 8px;
  border-left: 2px solid #E2E8F0;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-top: 8px;
`;

const DueDateText = styled(Typography)`
  font-size: 0.7rem;
  color: #94A3B8;
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
`;

const KanbanCard = ({ item, index, isDragDisabled, onDelete, onDoubleClick }) => {
  return (
    <Draggable key={item.id} draggableId={item.id.toString()} index={index} isDragDisabled={isDragDisabled}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onDoubleClick={onDoubleClick}
          style={{
            ...provided.draggableProps.style,
            opacity: isDragDisabled ? 0.7 : 1,
            cursor: isDragDisabled ? 'default' : 'grab',
          }}
        >
          <TaskInformation priorityColor={priorityBorderColors[item.priority]}>
            <CardHeader>
              <TaskTitle variant="subtitle1">
                {item.Task}
              </TaskTitle>
              <IconButton
                aria-label="delete"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
                sx={{
                  borderRadius: '8px',
                  width: 28,
                  height: 28,
                  color: '#94A3B8',
                  '&:hover': {
                    color: '#EF4444',
                    backgroundColor: '#FEF2F2'
                  }
                }}
              >
                <DeleteIcon sx={{ fontSize: '0.9rem' }} />
              </IconButton>
            </CardHeader>

            <CardContent>
              {item.description && (
                <TaskDescription variant="body2">
                  {item.description}
                </TaskDescription>
              )}

              <Box display="flex" gap={1} flexWrap="wrap">
                {item.priority && (
                  <Tooltip title="Priority">
                    <Chip
                      icon={<FlagIcon fontSize="small" />}
                      label={item.priority}
                      size="small"
                      color={priorityColors[item.priority] || 'default'}
                      variant="outlined"
                      sx={{
                        fontWeight: 600,
                        '& .MuiChip-icon': {
                          fontSize: '0.875rem'
                        }
                      }}
                    />
                  </Tooltip>
                )}

                {item.status && (
                  <Tooltip title="Status">
                    <Chip
                      icon={<CircleIcon fontSize="small" />}
                      label={item.status}
                      size="small"
                      color={statusColors[item.status] || 'default'}
                      sx={{
                        fontWeight: 500,
                        '& .MuiChip-icon': {
                          fontSize: '0.75rem'
                        }
                      }}
                    />
                  </Tooltip>
                )}
              </Box>
            </CardContent>

            <CardFooter>
              {item.Due_Date && (
                <DueDateText variant="caption">
                  Due: {new Date(item.Due_Date).toLocaleDateString("en-us", {
                    month: "short",
                    day: "2-digit",
                  })}
                </DueDateText>
              )}
              {item.assign_to && (
                <Tooltip title="Assigned to">
                  <Avatar
                    sx={{
                      width: 24,
                      height: 24,
                      bgcolor: 'primary.light',
                      '& .MuiSvgIcon-root': {
                        fontSize: '0.875rem'
                      }
                    }}
                  >
                    <PersonIcon fontSize="small" />
                  </Avatar>
                </Tooltip>
              )}
            </CardFooter>
          </TaskInformation>
        </div>
      )}
    </Draggable>
  );
};

export default KanbanCard;