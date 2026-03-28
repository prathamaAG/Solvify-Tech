import React, { useEffect, useState } from "react";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import TableComponent from "../../../../components/Table/table.compoenent";
import dayjs from "dayjs";
import { apiService, commonService } from "../../../../services";
import toast from "react-hot-toast";
import CheckIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Cancel";

const TrackerRequest = ({ project_id }) => {
   const [requests, setRequests] = useState([]);

   const fetchRequests = async () => {
      try {
         const res = await apiService.GetAPICall("getAllManualTimeRequests", `${project_id}`);
         if (res.status === 1) {
            setRequests(res.data);
         } else {
            toast.error(res.message || "Failed to fetch requests");
         }
      } catch (err) {
         toast.error("Error fetching tracker requests");
         console.error(err);
      } finally {
         commonService.resetAPIFlag("getAllManualTimeRequests", false);
      }
   };

   const handleAction = async (id, action) => {
      const toastId = toast.loading(`${action === "accepted" ? "Accepting" : "Rejecting"} request...`);
      try {
         const res = await apiService.PutAPICall("updateManualTimeRequestStatus", {
            request_id: id,
            action: action,
         });

         if (res.status === 1) {
            toast.success(res.message, { id: toastId });
            fetchRequests();
         } else {
            toast.error(res.message, { id: toastId });
         }
      } catch (err) {
         toast.error("Failed to update request status", { id: toastId });
      } finally {
         commonService.resetAPIFlag("updateManualTimeRequestStatus", false);
      }
   };

   const columns = [
      {
         field: "user_name", headerName: "User",
         renderCell: (params) => params.row.user.name,
      },
      {
         field: "date",
         headerName: "Date",
         renderCell: (params) => dayjs(params.row.start_time).format("DD-MM-YYYY"),
      },
      {
         field: "start_time",
         headerName: "Start Time",
         renderCell: (params) => dayjs(params.value).format("HH:mm"),
      },
      {
         field: "end_time",
         headerName: "End Time",
         renderCell: (params) => dayjs(params.value).format("HH:mm"),
      },
      {
         field: "duration",
         headerName: "Duration",
         renderCell: (params) => {
            const start = dayjs(params.row.start_time);
            const end = dayjs(params.row.end_time);
            const duration = end.diff(start, "minute");
            const hrs = Math.floor(duration / 60);
            const mins = duration % 60;
            return `${hrs}h ${mins}m`;
         },
      },
      { field: "reason", headerName: "Reason", flex: 1 },
      {
         field: "actions",
         headerName: "Actions",
         renderCell: (params) => (
            <>
               <Tooltip title="Accept">
                  <IconButton
                     color="success"
                     onClick={(e) => {
                        e.stopPropagation();
                        handleAction(params.row.request_id, "approve");
                     }}
                     size="small"
                  >
                     <CheckIcon fontSize="small" />
                  </IconButton>
               </Tooltip>
               <Tooltip title="Reject">
                  <IconButton
                     color="error"
                     onClick={(e) => {
                        e.stopPropagation();
                        handleAction(params.row.request_id, "reject");
                     }}
                     size="small"
                  >
                     <CloseIcon fontSize="small" />
                  </IconButton>
               </Tooltip>
            </>
         ),
      },
   ];

   useEffect(() => {
      fetchRequests();
   }, []);

   return (
      <Box p={2}>
         {/* <Typography variant="h5" mb={2}>
            Manual Tracker Requests
         </Typography> */}
         <TableComponent
            rows={requests}
            columns={columns}
            getRowId={(row) => row.request_id}
         />
      </Box>
   );
};

export default TrackerRequest;
