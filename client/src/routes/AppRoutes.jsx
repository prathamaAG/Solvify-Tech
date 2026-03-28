import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Login from "../pages/Auth/Login";
import Signup from "../pages/Auth/Signup";
import Dashboard from "../pages/Dashboard/Dashboard";
import AuthRoutes from "./AuthRoutes";
import ProtectedRoute from "./ProtectedRoute";
import NotFound from "../pages/NotFound";
import VerifyEmailNotification from "../pages/VerifyEmailNotification";
import EmailVerified from "../pages/EmailVerified";
import EmailVerifyFailed from "../pages/EmailVerifyFailed";
import VerifyEmail from "../pages/VerifyEmail";
import ForgotPassword from "../pages/Auth/Forget-Password";
import ResetPassword from "../pages/Auth/Reset-Password";
import ForgotPasswordEmailNotification from "../pages/ForgotPasswordEmailNotification";
import Projects from "../pages/Projects/Projects";
import Employee from "../pages/Employee/Employee";
import ProjectDetails from "../pages/ProjectDetails/ProjectDetails";
import CardDetails from "../pages/CardDetails/CardDetails";
import MyTask from "../pages/MyTask";
import Meetings from "../pages/Meetings/Meetings";
import ActivityLogs from "../pages/ActivityLogs/ActivityLogs";
import AIAnalytics from "../pages/AIAnalytics/AIAnalytics";
import OrganizationTree from "../pages/Organization/Index";
import MissedTrackerModal from "../components/Modal/MissedTrackerModal";
import { logoutUser } from "../store/actions/loginActions";
import { apiService, commonService } from "../services";


const AppRoutes = () => {
  const dispatch = useDispatch();
  const loginState = useSelector((state) => state.login);
  const isAuthenticated = loginState && Object.keys(loginState).length > 0;

  const [isTokenValid, setIsTokenValid] = useState(null);
  const [showMissedTrackerModal, setShowMissedTrackerModal] = useState(false);
  const [missedTrackerData, setMissedTrackerData] = useState({});

  useEffect(() => {
    const checkTokenValidity = async () => {
      if (!loginState.token) {
        setIsTokenValid(false);
        dispatch(logoutUser());
        return;
      }

      try {
        const response = await apiService.GetAPICall("validateToken");
        commonService.resetAPIFlag("validateToken", false);

        if (response?.status === 1 && response?.data?.isValid) {
          setIsTokenValid(true);

          try {
            const missedTrackerRes = await apiService.GetAPICall("getMissedTracker");
            commonService.resetAPIFlag("getMissedTracker", false);

            if (missedTrackerRes?.status === 1 && missedTrackerRes?.data?.hasMissed) {
              setMissedTrackerData(missedTrackerRes);
              setShowMissedTrackerModal(true);
            }
          } catch (trackerError) {
            console.error("Error checking missed tracker:", trackerError);
            commonService.resetAPIFlag("getMissedTracker", false);
          }
        } else {
          setIsTokenValid(false);
          dispatch(logoutUser());
        }
      } catch (error) {
        setIsTokenValid(false);
        dispatch(logoutUser());
        commonService.resetAPIFlag("validateToken", false);
      } finally {
        commonService.resetAPIFlag("validateToken", false);
        commonService.resetAPIFlag("getMissedTracker", false);
      }
    };

    checkTokenValidity();
  }, []);

  if (isTokenValid === null) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Routes>
        <Route element={<AuthRoutes />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email-notification" element={<VerifyEmailNotification />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/email-verified" element={<EmailVerified />} />
          <Route path="/verify-failed" element={<EmailVerifyFailed />} />
          <Route path="/forgot-password-email-notification" element={<ForgotPasswordEmailNotification />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/management/employees" element={<Employee />} />
          <Route path="/management/projects" element={<Projects />} />
          <Route path="/management/projects/details/:project_id" element={<ProjectDetails />} />
          <Route path="/management/projects/card-details/:id" element={<CardDetails />} />
          <Route path="/management/my-tasks" element={<MyTask />} />
          <Route path="/management/meetings" element={<Meetings />} />
          <Route path="/management/activity-logs" element={<ActivityLogs />} />
          <Route path="/management/ai-analytics" element={<AIAnalytics />} />
          <Route path="/management/organization" element={<OrganizationTree />} />
        </Route>

        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Missed Tracker Modal */}
      {showMissedTrackerModal && (
        <MissedTrackerModal
          missedTrackerData={missedTrackerData}
          open={showMissedTrackerModal}
          onClose={() => setShowMissedTrackerModal(false)}
        />
      )}
    </>
  );
};

export default AppRoutes;
