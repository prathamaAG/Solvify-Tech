import React, { useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import CardsTab from "./CardTab/CardsTab";
import MembersTab from "./MembersTab/MembersTab";
import DailyUpdatesTab from "./DailyUpdatesTab/DailyUpdatesTab";
import { useSelector } from "react-redux";
import TrackerRequest from "./TrackerRequests/TrackerRequest";

const ProjectTabs = ({ project_id }) => {
  const [activeTab, setActiveTab] = useState(0);
  const { isAdmin } = useSelector((state) => state.login);

  return (
    <Box>
      <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
        <Tab label="Cards" />
        <Tab label="Members" />
        <Tab label="Daily Updates" />
        {isAdmin && <Tab label="tracker Request" /> }
      </Tabs>

      {activeTab === 0 && <CardsTab project_id={project_id} />}
      {activeTab === 1 && <MembersTab project_id={project_id} />}
      {activeTab === 2 && <DailyUpdatesTab project_id={project_id} />}
      {activeTab === 3 && <TrackerRequest project_id={project_id} />}
    </Box>
  );
};

export default ProjectTabs;
