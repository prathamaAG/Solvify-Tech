import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const AuthRoutes = () => {
  const loginState = useSelector((state) => state.login);
  const isAuthenticated = loginState && Object.keys(loginState).length > 0;

  return isAuthenticated ? <Navigate to="/dashboard" /> : <Outlet />;
};

export default AuthRoutes;
