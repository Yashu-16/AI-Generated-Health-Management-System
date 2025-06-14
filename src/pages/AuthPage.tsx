
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Stethoscope, Heart, Shield } from "lucide-react";

interface AuthPageProps {
  onLogin: () => void;
}

const AuthPage = ({ onLogin }: AuthPageProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "staff"
  });

  const demoCredentials = [
    { role: "Admin", email: "admin@visionhospital.com", password: "admin123" },
    { role: "Doctor", email: "doctor@visionhospital.com", password: "doctor123" },
    { role: "Staff", email: "staff@visionhospital.com", password: "staff123" }
  ];

  const handleLogin = () => {
    setIsLoading(true);
    
    // Check demo credentials
    const validCredential = demoCredentials.find(
      cred => cred.email === loginData.email && cred.password === loginData.password
    );

    setTimeout(() => {
      if (validCredential) {
        toast({
          title: "Login Successful",
          description: `Welcome back, ${validCredential.role}!`,
        });
        onLogin();
      } else {
        toast({
          title: "Invalid Credentials",
          description: "Please use the demo credentials provided below",
          variant: "destructive"
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleSignup = () => {
    setIsLoading(true);
    
    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    setTimeout(() => {
      toast({
        title: "Account Created",
        description: "Your account has been created successfully!",
      });
      onLogin();
    }, 1000);
  };

  const fillDemoCredentials = (email: string, password: string) => {
    setLoginData({ email, password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Hospital Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary p-3 rounded-full mr-4">
              <Stethoscope className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-primary">VISION MULTISPECIALITY HOSPITAL</h1>
              <p className="text-muted-foreground font-medium">Healthcare Management System</p>
            </div>
          </div>
          <div className="flex items-center justify-center space-x-6 text-muted-foreground">
            <div className="flex items-center">
              <Heart className="h-5 w-5 mr-2" />
              <span>Comprehensive Care</span>
            </div>
            <div className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              <span>Advanced Technology</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Auth Form */}
          <Card className="shadow-xl">
            <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
              <CardTitle className="text-2xl text-center">Access Portal</CardTitle>
              <CardDescription className="text-primary-foreground/80 text-center">
                Sign in to manage hospital operations
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                      placeholder="Enter your password"
                    />
                  </div>
                  <Button 
                    onClick={handleLogin} 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>
                </TabsContent>
                
                <TabsContent value="signup" className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={signupData.fullName}
                      onChange={(e) => setSignupData({...signupData, fullName: e.target.value})}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signupEmail">Email</Label>
                    <Input
                      id="signupEmail"
                      type="email"
                      value={signupData.email}
                      onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                      placeholder="Enter email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signupPassword">Password</Label>
                    <Input
                      id="signupPassword"
                      type="password"
                      value={signupData.password}
                      onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                      placeholder="Create password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                      placeholder="Confirm password"
                    />
                  </div>
                  <Button 
                    onClick={handleSignup} 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Demo Credentials */}
          <Card className="shadow-xl">
            <CardHeader className="bg-muted">
              <CardTitle>Demo Credentials</CardTitle>
              <CardDescription>
                Use these credentials to test different user roles
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {demoCredentials.map((cred, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold">{cred.role}</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fillDemoCredentials(cred.email, cred.password)}
                      >
                        Use
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600">Email: {cred.email}</p>
                    <p className="text-sm text-gray-600">Password: {cred.password}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Role Permissions:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li><strong>Admin:</strong> Full access to all features</li>
                  <li><strong>Doctor:</strong> Medical records, appointments</li>
                  <li><strong>Staff:</strong> Patient management, billing</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
