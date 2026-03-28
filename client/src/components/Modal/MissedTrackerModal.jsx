import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
   Dialog,
   DialogTitle,
   DialogContent,
   Typography,
   Button,
   Box
} from "@mui/material";
import ModalImage from "../../assets/images/Tracker_Modal_Image.svg"; 
//import { REQUEST_TRACKER } from "../components/constans/Route"; // update to correct route

const TrackerRequestModal = ({ missedTrackerData, onClose }) => {
   const navigate = useNavigate();
   const [open, setOpen] = useState(false);

   useEffect(() => {
      setOpen(true);
   }, []);

   const handleRedirect = () => {
      setOpen(false);
      onClose();
      navigate("/management/my-tasks", {
         state: {
            from: "manualTimeRequestPage",
            data: missedTrackerData
         },
      });
   };

   return (
      <Dialog open={open} onClose={() => { }} PaperProps={{ sx: { borderRadius: 4, width: 500 } }}>
         <DialogTitle>
            <Typography variant="h6" fontWeight="bold" textAlign="center">
               Forget to turn off the Tracker
            </Typography>
         </DialogTitle>

         <DialogContent>
            <Box display="flex" flexDirection="column" alignItems="center" textAlign="center" p={2}>
               <img src={ModalImage} alt="Clock" style={{ width: 100, height: 100 }} />
               <Typography variant="h6" mt={2}>
                  Task time tracking is on
               </Typography>
               <Typography variant="body1" mt={1}>
                  Did you forget to stop the tracker? You can now request to adjust your time.
               </Typography>

               <Button
                  onClick={handleRedirect}
                  variant="contained"
                  sx={{
                     mt: 3,
                     backgroundColor: "primary.main",
                     textTransform: "none",
                     px: 3,
                     py: 1.2,
                     borderRadius: 2,
                     fontSize: 16
                  }}
               >
                  Go to Request Tracker
               </Button>
            </Box>
         </DialogContent>
      </Dialog>
   );
};

export default TrackerRequestModal;
