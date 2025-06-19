
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../api/auth";
import { removeToken } from "../utils/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Phone, Building, Briefcase, LogOut, ArrowLeft } from "lucide-react";

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userData = await getProfile();
        setUser(userData);
      } catch (error) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to view your profile.",
          variant: "destructive",
        });
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [navigate, toast]);

  const handleLogout = () => {
    removeToken();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-slate-600">Loading profile...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) return null;

  const profileFields = [
    { key: 'username', label: 'Username', icon: User },
    { key: 'full_name', label: 'Full Name', icon: User },
    { key: 'email', label: 'Email', icon: Mail },
    { key: 'phone', label: 'Phone', icon: Phone },
    { key: 'company', label: 'Company', icon: Building },
    { key: 'position', label: 'Position', icon: Briefcase },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="flex items-center space-x-2 text-red-600 border-red-200 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </Button>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center pb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">
              {user.full_name || user.username}
            </CardTitle>
            <CardDescription className="text-slate-600">
              {user.position && user.company ? `${user.position} at ${user.company}` : 'User Profile'}
            </CardDescription>
            <Badge variant="secondary" className="w-fit mx-auto mt-2">
              Active User
            </Badge>
          </CardHeader>
          
          <Separator />
          
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Profile Information</h3>
                <div className="grid gap-4">
                  {profileFields.map(({ key, label, icon: Icon }) => {
                    const value = user[key];
                    if (!value) return null;
                    
                    return (
                      <div key={key} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                          <Icon className="w-5 h-5 text-slate-600" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-slate-700">{label}</div>
                          <div className="text-slate-900">{value}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Additional user data */}
              {Object.entries(user).some(([key]) => !profileFields.some(field => field.key === key) && key !== 'id') && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Additional Information</h3>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="space-y-2">
                      {Object.entries(user).map(([key, value]) => {
                        if (profileFields.some(field => field.key === key) || key === 'id' || !value) return null;
                        
                        return (
                          <div key={key} className="flex justify-between items-center py-1">
                            <span className="text-sm font-medium text-slate-700 capitalize">
                              {key.replace(/_/g, ' ')}:
                            </span>
                            <span className="text-slate-900 text-sm">{String(value)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
