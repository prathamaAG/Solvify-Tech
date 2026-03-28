import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import MainLayout from "../layout/MainLayout";

const ProtectedRoute = () => {
  const loginState = useSelector((state) => state.login);
  const isAuthenticated = loginState && Object.keys(loginState).length > 0;

  return isAuthenticated ? (
    <MainLayout >
      <Outlet />
    </MainLayout>

  ) : <Navigate to="/login" />;
};

export default ProtectedRoute;
