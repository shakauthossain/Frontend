import { useNavigate } from "react-router-dom";
import { removeToken } from "../utils/auth";
import { Button } from "@/components/ui/button";
import IndexPage from "./Index"; 

const DashboardActions = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    removeToken();
    navigate("/login");
  };
};

const Dashboard = () => {
  return (
    <>
      <DashboardActions />
      <IndexPage /> 
    </>
  );
};

export default Dashboard;
