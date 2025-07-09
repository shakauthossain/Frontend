
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

  return (
    <div className="p-4">
      <Button onClick={handleLogout} variant="outline">
        Logout
      </Button>
    </div>
  );
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
