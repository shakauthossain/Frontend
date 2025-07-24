import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { API_BASE_URL } from "@/config/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Shield, ArrowLeft } from "lucide-react";

export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get email from navigation state
  const email = location.state?.email || "";

  const verifyOTP = async (otpCode: string, email: string) => {
    console.log("Verifying OTP for:", email);

    const response = await fetch(`${API_BASE_URL}/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp: otpCode }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("OTP verification failed:", error);
      throw new Error(error.detail || "OTP verification failed");
    }

    const result = await response.json();
    console.log("OTP verification successful");
    return result;
  };

  const resendOTP = async (email: string) => {
    console.log("Resending OTP to:", email);

    const response = await fetch(`${API_BASE_URL}/resend-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Resend OTP failed:", error);
      throw new Error(error.detail || "Failed to resend OTP");
    }

    const result = await response.json();
    console.log("OTP resent successfully");
    return result;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a 6-digit OTP code.",
        variant: "destructive",
      });
      return;
    }

    if (!email) {
      toast({
        title: "Missing Email",
        description: "Email address is required for verification.",
        variant: "destructive",
      });
      navigate("/register");
      return;
    }

    setIsLoading(true);
    
    try {
      await verifyOTP(otp, email);
      toast({
        title: "Account Verified",
        description: "Your account has been successfully verified. You can now sign in.",
      });
      setTimeout(() => navigate("/login"), 1000);
    } catch (err: any) {
      toast({
        title: "Verification Failed",
        description: err.message || "Please check your OTP and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      toast({
        title: "Missing Email",
        description: "Email address is required to resend OTP.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await resendOTP(email);
      toast({
        title: "OTP Sent",
        description: "A new OTP has been sent to your email address.",
      });
    } catch (err: any) {
      toast({
        title: "Failed to Resend",
        description: err.message || "Could not resend OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Verify Your Account</CardTitle>
          <CardDescription className="text-slate-600">
            We've sent a 6-digit verification code to<br />
            <span className="font-medium text-slate-800">{email}</span>
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
                disabled={isLoading}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-2">
                Didn't receive the code?
              </p>
              <Button
                type="button"
                variant="ghost"
                onClick={handleResendOTP}
                disabled={isLoading}
                className="text-blue-600 hover:text-blue-500"
              >
                Resend OTP
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full h-11"
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying...</span>
                </div>
              ) : (
                "Verify Account"
              )}
            </Button>
            
            <Link
              to="/register"
              className="flex items-center justify-center text-sm text-slate-600 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Registration
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
