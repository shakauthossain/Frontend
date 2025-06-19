
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, UserPlus } from "lucide-react";

export default function Register() {
  const [form, setForm] = useState({
    username: "",
    full_name: "",
    email: "",
    phone: "",
    company: "",
    position: "",
    password: "",
    confirm_password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (form.password !== form.confirm_password) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await registerUser(form);
      toast({
        title: "Registration Successful",
        description: "Your account has been created. Please sign in.",
      });
      setTimeout(() => navigate("/login"), 1000);
    } catch (err: any) {
      toast({
        title: "Registration Failed",
        description: err.message || "Please check your information and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fieldLabels = {
    username: "Username",
    full_name: "Full Name",
    email: "Email Address",
    phone: "Phone Number",
    company: "Company",
    position: "Position",
    password: "Password",
    confirm_password: "Confirm Password"
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-slate-900">Create Account</CardTitle>
          <CardDescription className="text-slate-600">
            Join LeadFlow to manage your sales leads effectively
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(form).map(([key, value]) => (
                <div key={key} className={key === 'confirm_password' ? 'md:col-span-2' : ''}>
                  <Label htmlFor={key} className="text-sm font-medium text-slate-700">
                    {fieldLabels[key as keyof typeof fieldLabels]}
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id={key}
                      name={key}
                      type={
                        key === 'email' ? 'email' :
                        key === 'phone' ? 'tel' :
                        key.includes("password") ? (
                          key === 'password' ? (showPassword ? "text" : "password") :
                          (showConfirmPassword ? "text" : "password")
                        ) : "text"
                      }
                      placeholder={`Enter your ${fieldLabels[key as keyof typeof fieldLabels].toLowerCase()}`}
                      value={value}
                      onChange={handleChange}
                      required
                      className="h-11"
                    />
                    {key.includes("password") && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => {
                          if (key === 'password') {
                            setShowPassword(!showPassword);
                          } else {
                            setShowConfirmPassword(!showConfirmPassword);
                          }
                        }}
                      >
                        {(key === 'password' ? showPassword : showConfirmPassword) ? (
                          <EyeOff className="h-4 w-4 text-slate-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-slate-500" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full h-11"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating account...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account</span>
                </div>
              )}
            </Button>
            <div className="text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
