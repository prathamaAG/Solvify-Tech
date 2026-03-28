import React from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { TextField, MenuItem, Button, Stack } from "@mui/material";
import CommonModal from "./Modal.component";

const roles = [
   { label: "User", value: "user" },
   { label: "Admin", value: "admin" },
   { label: "Manager", value: "manager" },
   { label: "Senior Developer", value: "senior developer" },
   { label: "Developer", value: "developer" },
   { label: "HR", value: "hr" },
   { label: "QA", value: "qa" },

];

// **Validation Schema using Yup**
const validationSchema = Yup.object().shape({
   user_id: Yup.string().required("User ID is required"), // Ensure user_id is present
   name: Yup.string().required("Name is required"),
   mobile_no: Yup.string()
      .matches(/^\d{10,15}$/, "Mobile number must be between 10-15 digits")
      .required("Mobile number is required"),
   role: Yup.string().required("Role is required"),
   reporting_person_id: Yup.string().nullable(),
   technology: Yup.string().required("Technology is required"),
});

const UpdateEmployeeForm = ({ open, onClose, onSubmit, initialData, employeeList }) => {
   return (
      <CommonModal open={open} onClose={onClose} title="Update Employee">
         <Formik
            initialValues={{
               user_id: initialData?.user_id || "", // Ensure user_id is included
               name: initialData?.name || "",
               email: initialData?.email || "", // Email is read-only
               mobile_no: initialData?.mobile_no || "",
               role: initialData?.role || "user",
               reporting_person_id: initialData?.reporting_person_id || "",
               technology: initialData?.technology || "",
            }}
            validationSchema={validationSchema}
            onSubmit={(values, { resetForm }) => {
               onSubmit(values); // user_id is included automatically
               resetForm();
               onClose();
            }}
         >
            {({ values, handleChange, errors, touched }) => (
               <Form>
                  <Stack spacing={2}>
                     {/* Hidden User ID (Ensures it is included in API request) */}
                     <input type="hidden" name="user_id" value={values.user_id} />

                     {/* Name */}
                     <TextField
                        name="name"
                        label="Name"
                        value={values.name}
                        onChange={handleChange}
                        error={touched.name && Boolean(errors.name)}
                        helperText={touched.name && errors.name}
                        required
                     />

                     {/* Email (Read-Only) */}
                     <TextField
                        name="email"
                        label="Email"
                        value={values.email}
                        InputProps={{ readOnly: true }}
                     />

                     {/* Mobile Number */}
                     <TextField
                        name="mobile_no"
                        label="Mobile Number"
                        value={values.mobile_no}
                        onChange={handleChange}
                        error={touched.mobile_no && Boolean(errors.mobile_no)}
                        helperText={touched.mobile_no && errors.mobile_no}
                        required
                     />

                     {/* Role Dropdown */}
                     <TextField
                        name="role"
                        label="Role"
                        select
                        value={values.role}
                        onChange={handleChange}
                        error={touched.role && Boolean(errors.role)}
                        helperText={touched.role && errors.role}
                     >
                        {roles.map((option) => (
                           <MenuItem key={option.value} value={option.value}>
                              {option.label}
                           </MenuItem>
                        ))}
                     </TextField>

                     {/* Reporting Person Dropdown (Only for Non-Admins) */}
                     {values.role !== "admin" && (
                        <TextField
                           name="reporting_person_id"
                           label="Reporting Person"
                           select
                           value={values.reporting_person_id}
                           onChange={handleChange}
                        >
                           <MenuItem value="">None</MenuItem>
                           {employeeList.map((user) => (
                              <MenuItem key={user.user_id} value={user.user_id}>
                                 {user.name}
                              </MenuItem>
                           ))}
                        </TextField>
                     )}

                     {/* Technology */}
                     <TextField
                        name="technology"
                        label="Technology"
                        value={values.technology}
                        onChange={handleChange}
                        error={touched.technology && Boolean(errors.technology)}
                        helperText={touched.technology && errors.technology}
                        required
                     />

                     {/* Submit Button */}
                     <Button type="submit" variant="contained" color="primary">
                        Update
                     </Button>
                  </Stack>
               </Form>
            )}
         </Formik>
      </CommonModal>
   );
};

export default UpdateEmployeeForm;
