import React, { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import KanbanCard from "./KanbanCard.components";
import { apiService, commonService } from "../../services";
import AddTaskForm from "../Modal/AddTaskForm";
import AddCardForm from "../Modal/AddCardForm";
import EditCardForm from "../Modal/EditCardForm";
import { IconButton, Snackbar, Button, Typography, Box, Chip, Card } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const TaskList = styled.div`
  min-height: 100px;
  display: flex;
  flex-direction: column;
  background: #F8FAFC;
  min-width: 300px;
  width: 300px;
  border-radius: 16px;
  padding: 16px;
  margin-right: 16px;
  border: 1px solid rgba(0,0,0,0.04);
  transition: box-shadow 0.3s ease;
  &:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  }
`;

const TaskColumnStyles = styled.div`
  margin: 8px;
  display: flex;
  width: 100%;
  min-height: 80vh;
`;

const Title = styled.span`
  color: ${props => props.color || "#10957d"};
  background: ${props => props.bgColor || "rgba(16, 149, 125, 0.15)"};
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.875rem;
  display: inline-block;
  margin-bottom: 8px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  position: relative;
`;

const ColumnContent = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  padding: 4px;
  margin: -4px; // Offset for drag handle space
`;

const AddTaskButton = styled(Button)`
  && {
    width: 100%;
    margin-top: 12px;
    padding: 10px 12px;
    border-radius: 12px;
    text-transform: none;
    font-weight: 600;
    font-size: 0.8rem;
    background-color: transparent;
    color: #6366F1;
    border: 1.5px dashed #C7D2FE;
    transition: all 0.2s ease;
    
    &:hover {
      background-color: #EEF2FF;
      border-color: #6366F1;
    }
    
    .MuiSvgIcon-root {
      margin-right: 6px;
      font-size: 18px;
    }
  }
`;

const AddCardButton = styled(Button)`
  && {
    background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
    color: white;
    padding: 10px 24px;
    border-radius: 12px;
    text-transform: none;
    font-weight: 600;
    font-size: 0.85rem;
    box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3);
    transition: all 0.2s ease;
    margin: 0 16px 16px;
    
    &:hover {
      background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
    }
    
    &:active {
      transform: translateY(0);
    }
    
    .MuiSvgIcon-root {
      margin-right: 8px;
    }
  }
`;

const ColumnsContainer = styled.div`
  display: flex;
  overflow-x: auto;
  padding-bottom: 16px;
  margin-left: 16px;
`;

const DescriptionText = styled(Typography)`
  && {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 0.75rem;
    color: #666;
    margin-bottom: 8px;
    line-height: 1.4;
  }
`;

// Color palette for column titles
const columnColors = [
  { color: "#6366F1", bgColor: "#EEF2FF" },
  { color: "#8B5CF6", bgColor: "#F3E8FF" },
  { color: "#F59E0B", bgColor: "#FFFBEB" },
  { color: "#10B981", bgColor: "#ECFDF5" },
  { color: "#EF4444", bgColor: "#FEF2F2" },
  { color: "#06B6D4", bgColor: "#ECFEFF" }
];
const KanbanView = ({ columnsFromBackend, project_id }) => {
  const [columns, setColumns] = useState(columnsFromBackend);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [isEditCardModalOpen, setIsEditCardModalOpen] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");
  const navigate = useNavigate();

  const { isAdmin } = useSelector((state) => state.login);
  const currentUserId = useSelector((state) => state.login.user_id);
  const [subordinateIds, setSubordinateIds] = useState([]);

  useEffect(() => {
    setColumns(columnsFromBackend);
  }, [columnsFromBackend]);

  // Fetch subordinate IDs for hierarchy-based drag permissions
  useEffect(() => {
    if (!isAdmin && currentUserId) {
      const fetchSubordinates = async () => {
        try {
          const response = await apiService.GetAPICall("getMySubordinates");
          if (response.status === 1 && response.data) {
            setSubordinateIds(response.data);
          }
        } catch (err) {
          console.error("Failed to fetch subordinates:", err);
        } finally {
          commonService.resetAPIFlag("getMySubordinates", false);
        }
      };
      fetchSubordinates();
    }
  }, [isAdmin, currentUserId]);

  // Check if current user can drag a task
  const canUserDragTask = (task) => {
    if (isAdmin) return true;
    if (!task || !task.assign_to) return true; // Any project member can drag unassigned tasks
    if (task.assign_to === currentUserId) return true; // Own task
    if (subordinateIds.includes(task.assign_to)) return true; // Subordinate's task
    return false;
  };

  const PriorityChip = styled(Chip)(({ priority }) => ({
    backgroundColor:
      priority === "high" ? "#ffebee" :
        priority === "medium" ? "#fff8e1" : "#e8f5e9",
    color:
      priority === "high" ? "#c62828" :
        priority === "medium" ? "#f57f17" : "#2e7d32",
    fontWeight: 600,
    marginRight: "8px"
  }));

  const getColumnColor = (index) => {
    return columnColors[index % columnColors.length];
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination } = result;

    // Hierarchy-based permission check
    const checkColumn = columns[source.droppableId];
    const checkTask = checkColumn.items[source.index];
    if (!canUserDragTask(checkTask)) {
      setSnackbarMessage("You don't have permission to move this task");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    const updatedColumns = { ...columns };
    const sourceColumn = updatedColumns[source.droppableId];
    const sourceTasks = [...sourceColumn.items];
    const [movedTask] = sourceTasks.splice(source.index, 1);

    if (source.droppableId === destination.droppableId) {
      sourceTasks.splice(destination.index, 0, movedTask);
      updatedColumns[source.droppableId] = {
        ...sourceColumn,
        items: sourceTasks,
      };
    } else {
      const destinationColumn = updatedColumns[destination.droppableId];
      const destinationTasks = [...destinationColumn.items];
      destinationTasks.splice(destination.index, 0, movedTask);

      updatedColumns[source.droppableId] = {
        ...sourceColumn,
        items: sourceTasks,
      };
      updatedColumns[destination.droppableId] = {
        ...destinationColumn,
        items: destinationTasks,
      };
    }

    setColumns(updatedColumns);

    try {
      const response = await apiService.PutAPICall("updateTaskPosition", {
        taskId: result.draggableId,
        newCardId: destination.droppableId,
        newPosition: destination.index,
      });

      switch (response.status) {
        case 1:
          commonService.resetAPIFlag("updateTaskPosition", false);
          break;
        case 0:
          commonService.resetAPIFlag("updateTaskPosition", false);
          setSnackbarMessage(response.message);
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
          setColumns(columns); // Revert to the original state
          break;
        default:
          throw new Error("Unexpected response status");
      }
    } catch (err) {
      console.error("Failed to update task position:", err);
      setColumns(columns); // Revert to the original state
      setSnackbarMessage("Failed to update task position");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleAddTask = (columnId) => {
    setSelectedColumnId(columnId);
    setIsAddTaskModalOpen(true);
  };

  const handleSubmitTask = async (newTask) => {
    try {
      const response = await apiService.PostAPICall("createTask", newTask);

      switch (response.status) {
        case 1:
          {
            commonService.resetAPIFlag("createTask", false);
            const updatedColumns = { ...columns };
            updatedColumns[newTask.card_id].items.push({
              id: response.data.task_id,
              Task: newTask.title,
              description: newTask.description,
              Due_Date: newTask.due_date,
              priority: newTask.priority,
              status: "Pending",
              assign_to: null, // Ensure unassigned state is explicit
            });
            setColumns(updatedColumns);
            break;
          }
        case 0:
          commonService.resetAPIFlag("createTask", false);
          setSnackbarMessage(response.message);
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
          break;
        default:
          throw new Error("Unexpected response status");
      }
    } catch (err) {
      console.error("Failed to create task:", err);
      setSnackbarMessage("Failed to create task");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };


  const handleDeleteTask = async (taskId) => {
    try {
      const response = await apiService.DeleteAPICall("deleteTask", `${taskId}`);

      switch (response.status) {
        case 1:
          {
            commonService.resetAPIFlag("deleteTask", false);
            const updatedColumns = { ...columns };
            for (const columnId in updatedColumns) {
              updatedColumns[columnId].items = updatedColumns[columnId].items.filter(
                (item) => item.id !== taskId
              );
            }
            setColumns(updatedColumns);
            break;
          }
        case 0:
          commonService.resetAPIFlag("deleteTask", false);
          setSnackbarMessage(response.message);
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
          break;
        default:
          throw new Error("Unexpected response status");
      }
    } catch (err) {
      console.error("Failed to delete task:", err);
      setSnackbarMessage("Failed to delete task");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };
  const handleClick = (id) => {
    navigate(`/management/projects/card-details/${id}`)
  }

  // NEW: Handle adding a new card
  const handleAddCard = () => {
    setIsAddCardModalOpen(true);
  };

  // NEW: Handle submitting a new card
  const handleSubmitCard = async (newCard) => {
    try {
      const response = await apiService.PostAPICall("createCard", {
        ...newCard,
        project_id: project_id
      });

      console.log("response", response);

      if (response.status === 1) {
        commonService.resetAPIFlag("createCard", false);

        // Add the new card to our columns
        const newCardData = response.data;
        setColumns(prevColumns => ({
          ...prevColumns,
          [newCardData.card_id]: {
            title: newCardData.title,
            items: []
          }
        }));

        setSnackbarMessage("Card created successfully");
        setSnackbarSeverity("success");
      } else {
        setSnackbarMessage(response.message || "Failed to create card");
        setSnackbarSeverity("error");
      }
    } catch (err) {
      commonService.resetAPIFlag("createCard", false);
      console.error("Failed to create card:", err);
      setSnackbarMessage("Failed to create card");
      setSnackbarSeverity("error");
    } finally {
      commonService.resetAPIFlag("createCard", false);

      setSnackbarOpen(true);
      setIsAddCardModalOpen(false);
    }
  };

  // NEW: Handle editing a card
  const handleEditCard = (cardId) => {
    setSelectedCard({
      card_id: cardId,
      title: columns[cardId].title,
      description: columns[cardId].description,
      priority: columns[cardId].priority
    });
    setIsEditCardModalOpen(true);
  };

  // NEW: Handle submitting card edits
  const handleSubmitCardEdit = async (updatedCard) => {
    try {
      const response = await apiService.PutAPICall("updateCard", updatedCard);

      if (response.status === 1) {
        commonService.resetAPIFlag("updateCard", false);

        // Update the card in our columns
        setColumns(prevColumns => ({
          ...prevColumns,
          [updatedCard.card_id]: {
            ...prevColumns[updatedCard.card_id],
            title: updatedCard.title,
            description: updatedCard.description,
            priority: updatedCard.priority
          }
        }));

        setSnackbarMessage("Card updated successfully");
        setSnackbarSeverity("success");
      } else {
        setSnackbarMessage(response.message || "Failed to update card");
        setSnackbarSeverity("error");
      }
    } catch (err) {
      commonService.resetAPIFlag("updateCard", false);
      console.error("Failed to update card:", err);
      setSnackbarMessage("Failed to update card");
      setSnackbarSeverity("error");
    } finally {
      commonService.resetAPIFlag("updateCard", false);
      setSnackbarOpen(true);
      setIsEditCardModalOpen(false);
    }
  };

  // NEW: Handle deleting a card
  const handleDeleteCard = async (cardId) => {
    try {
      const response = await apiService.DeleteAPICall("deleteCard", cardId);

      if (response.status === 1) {
        commonService.resetAPIFlag("deleteCard", false);

        // Remove the card from our columns
        const newColumns = { ...columns };
        delete newColumns[cardId];
        setColumns(newColumns);

        setSnackbarMessage("Card deleted successfully");
        setSnackbarSeverity("success");
      } else {
        commonService.resetAPIFlag("deleteCard", false);
        setSnackbarMessage(response.message || "Failed to delete card");
        setSnackbarSeverity("error");
      }
    } catch (err) {
      commonService.resetAPIFlag("deleteCard", false);
      console.error("Failed to delete card:", err);
      setSnackbarMessage("Failed to delete card");
      setSnackbarSeverity("error");
    } finally {
      commonService.resetAPIFlag("deleteCard", false);
      setSnackbarOpen(true);
    }
  };

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <Container>
          <AddCardButton
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddCard}
          >
            Add New Card
          </AddCardButton>

          <TaskColumnStyles>
            {Object.entries(columns).map(([columnId, column], index) => {
              const colors = getColumnColor(index);
              return (
                <Droppable key={columnId} droppableId={columnId}>
                  {(provided) => (
                    <TaskList ref={provided.innerRef} {...provided.droppableProps}>
                      <Header>
                        <div>
                          <Title color={colors.color} bgColor={colors.bgColor}>
                            {column.title}
                          </Title>
                          {column.description && (
                            <DescriptionText variant="body2">
                              {column.description}
                            </DescriptionText>
                          )}
                          <Box display="flex" alignItems="center" mt={0.5}>
                            <PriorityChip
                              label={column.priority}
                              priority={column.priority?.toLowerCase()}
                              size="small"
                            />
                            <Typography variant="caption" color="text.secondary">
                              {column.items.length} {column.items.length === 1 ? 'task' : 'tasks'}
                            </Typography>
                          </Box>
                        </div>
                        <div>
                          <IconButton
                            size="small"
                            onClick={() => handleEditCard(columnId)}
                            sx={{
                              color: colors.color,
                              '&:hover': {
                                backgroundColor: colors.bgColor
                              }
                            }}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </div>
                      </Header>
                      <ColumnContent>
                        {column.items.map((item, index) => (
                          <KanbanCard
                            key={item?.id}
                            item={item}
                            index={index}
                            isDragDisabled={!canUserDragTask(item)}
                            onDelete={handleDeleteTask}
                            onDoubleClick={(e) => {
                              e.preventDefault();
                              if (window.getSelection().toString() === "") {
                                handleClick(item?.id);
                              }
                            }}
                          />
                        ))}
                        {provided.placeholder}
                      </ColumnContent>
                      <AddTaskButton
                        variant="text"
                        startIcon={<AddIcon />}
                        onClick={() => handleAddTask(columnId)}
                      >
                        Add Task
                      </AddTaskButton>
                    </TaskList>
                  )}
                </Droppable>
              );
            })}
          </TaskColumnStyles>
        </Container>
      </DragDropContext>


      {/* Keep all your modal components the same */}
      {isAddTaskModalOpen && (
        <AddTaskForm
          open={isAddTaskModalOpen}
          onClose={() => setIsAddTaskModalOpen(false)}
          onSubmit={handleSubmitTask}
          card_id={selectedColumnId}
          position={columns[selectedColumnId]?.items.length || 0}
        />
      )}

      {isAddCardModalOpen && (
        <AddCardForm
          open={isAddCardModalOpen}
          onClose={() => setIsAddCardModalOpen(false)}
          onSubmit={handleSubmitCard}
          project_id={project_id}
        />
      )}

      {isEditCardModalOpen && selectedCard && (
        <EditCardForm
          open={isEditCardModalOpen}
          onClose={() => setIsEditCardModalOpen(false)}
          onSubmit={handleSubmitCardEdit}
          onDelete={handleDeleteCard}
          card={selectedCard}
        />
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        severity={snackbarSeverity}
      />
    </>
  );
};

export default KanbanView;