import React from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { TextField, Button, Stack, MenuItem, InputLabel, Select, FormControl, Grid } from "@mui/material";
import CommonModal from "./Modal.component";

const validationSchema = Yup.object().shape({
   date: Yup.string()
      .required("Date is required")
      .test("not-in-future", "Date cannot be in the future", (value) => {
         if (!value) return false;
         const today = new Date();
         const selectedDate = new Date(value);
         selectedDate.setHours(23, 59, 59, 999); // end of the day
         return selectedDate <= today;
      }),

   start_time: Yup.string()
      .required("Start time is required")
      .test("start-not-in-future", "Start time cannot be in the future", function (value) {
         const { date } = this.parent;
         if (!value || !date) return true;
         const now = new Date();
         const selected = new Date(`${date}T${value}`);
         return selected <= now;
      }),

   end_time: Yup.string()
      .required("End time is required")
      .test("end-not-in-future", "End time cannot be in the future", function (value) {
         const { date } = this.parent;
         if (!value || !date) return true;
         const now = new Date();
         const selected = new Date(`${date}T${value}`);
         return selected <= now;
      })
      .test("end-after-start", "End time must be after start time", function (value) {
         const { date, start_time } = this.parent;
         if (!date || !start_time || !value) return true;
         const start = new Date(`${date}T${start_time}`);
         const end = new Date(`${date}T${value}`);
         return end > start;
      }),

   reason: Yup.string().required("Reason is required"),
});


const ManualTrackerModal = ({ open, onClose, onSubmit, taskId }) => {
   return (
      <CommonModal open={open} onClose={onClose} title="Manual Tracker Request">
         <Formik
            initialValues={{
               task_id: taskId,
               date: "", // Added date field
               start_time: "",
               end_time: "",
               reason: "",
            }}
            validationSchema={validationSchema}
            onSubmit={(values, { resetForm }) => {
               onSubmit(values); // Submit the manual tracker request
               resetForm();
               onClose();
            }}
         >
            {({ values, handleChange, errors, touched }) => (
               <Form>
                  <Stack spacing={3}>
                     <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                           <TextField
                              name="date"
                              label="Date"
                              type="date"
                              value={values.date}
                              onChange={handleChange}
                              error={touched.date && Boolean(errors.date)}
                              helperText={touched.date && errors.date}
                              required
                              fullWidth
                              InputLabelProps={{ shrink: true }}
                              inputProps={{
                                 max: new Date().toISOString().split("T")[0],
                              }}
                              sx={{ '& input': { paddingLeft: '8px' } }} // Remove excess left padding
                           />
                        </Grid>

                        <Grid item xs={12} sm={4}>
                           <TextField
                              name="start_time"
                              label="Start Time"
                              type="time"
                              value={values.start_time}
                              onChange={handleChange}
                              error={touched.start_time && Boolean(errors.start_time)}
                              helperText={touched.start_time && errors.start_time}
                              required
                              fullWidth
                              InputLabelProps={{ shrink: true }}
                              sx={{ '& input': { paddingLeft: '8px' } }}
                           />
                        </Grid>

                        <Grid item xs={12} sm={4}>
                           <TextField
                              name="end_time"
                              label="End Time"
                              type="time"
                              value={values.end_time}
                              onChange={handleChange}
                              error={touched.end_time && Boolean(errors.end_time)}
                              helperText={touched.end_time && errors.end_time}
                              required
                              fullWidth
                              InputLabelProps={{ shrink: true }}
                              sx={{ '& input': { paddingLeft: '8px' } }}
                           />
                        </Grid>
                     </Grid>

                     {/* Second Row: Reason + Submit */}
                     <TextField
                        name="reason"
                        label="Reason"
                        value={values.reason}
                        onChange={handleChange}
                        multiline
                        rows={3}
                        fullWidth
                        error={touched.reason && Boolean(errors.reason)}
                        helperText={touched.reason && errors.reason}
                        required
                     />

                     <Button type="submit" variant="contained" color="primary">
                        Submit Request
                     </Button>
                  </Stack>
               </Form>

            )}
         </Formik>
      </CommonModal>
   );
};

export default ManualTrackerModal;
