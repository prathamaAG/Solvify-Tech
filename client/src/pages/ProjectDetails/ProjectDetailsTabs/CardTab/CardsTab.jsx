import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import KanbanView from "../../../../components/KanbanView/KanbanView.components";
import { apiService, commonService } from "../../../../services";

const CardsTab = ({ project_id }) => {
  const [columns, setColumns] = useState({});
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  useEffect(() => {
    const fetchCardsAndTasks = async () => {
      try {
        // Fetch cards
        const cardsResponse = await apiService.GetAPICall("getCard", `${project_id}`);
        commonService.resetAPIFlag("getCard", false);
        const cards = cardsResponse.data;

        if (!cards || cards.length === 0) {
          setError("No Cards Found"); // Set error message
          commonService.resetAPIFlag("getCard", false);
          return;
        }

        // Fetch tasks for each card
        const columnsData = {};
        for (const card of cards) {
          const tasksResponse = await apiService.GetAPICall("getTask", `${card.card_id}`);
          commonService.resetAPIFlag("getTask", false);
          const tasks = tasksResponse.data;

          if (tasks) {
            columnsData[card.card_id] = {
              title: card.title,
              description: card.description,
              priority: card.priority,
              position: card.position,
              items: tasks.map((task) => ({
                id: task.task_id,
                Task: task.title,
                Due_Date: task.due_date,
                description: task.description,
                priority: task.priority,
                status: task.status,
                assign_to: task.assign_to,
              })),
            };
          } else {
            columnsData[card.card_id] = {
              title: card.title,
              items: [],
            };
          }
        }

        setColumns(columnsData);
      } catch (err) {
        setError("Error Fetching Data"); // Set error message
        commonService.resetAPIFlag("getTask", false);
        commonService.resetAPIFlag("getCard", false);
        console.error(err);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchCardsAndTasks();
  }, [project_id]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress /> {/* Loading spinner */}
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Typography variant="h6" color="error">
          {error} {/* Display error message */}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ overflowX: "auto" }}>
      <KanbanView columnsFromBackend={columns} project_id={project_id} />
    </Box>
  );
};

export default CardsTab;