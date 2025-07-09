
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOTP from "./pages/VerifyOTP";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import MailEditor from "./pages/MailEditor";
import SpeedDetails from "./pages/SpeedDetails";
import NotFound from "./pages/NotFound";
import EmailCampaigns from "./pages/EmailCampaigns";
import LinkedInCampaigns from "./pages/LinkedInCampaigns";
import PrivateRoute from "./components/PrivateRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/email-campaigns" element={
            <PrivateRoute>
              <EmailCampaigns />
            </PrivateRoute>
          } />
          <Route path="/linkedin-campaigns" element={
            <PrivateRoute>
              <LinkedInCampaigns />
            </PrivateRoute>
          } />
          <Route path="/mail/:leadId" element={<MailEditor />} />
          <Route path="/speed/:leadId" element={
            <PrivateRoute>
              <SpeedDetails />
            </PrivateRoute>
          } />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
