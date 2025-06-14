
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Stethoscope, Heart, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AuthPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  });

  // Supabase login function
  const handleLogin = async () => {
    setIsLoading(true);
    const { email, password } = loginData;

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({
        title: "Login Failed",
        description: error.message ?? "Invalid email or password",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }
    toast({
      title: "Login Successful",
      description: `Welcome!`,
    });
    setIsLoading(false);
  };

  // Supabase Signup function
  const handleSignup = async () => {
    setIsLoading(true);
    const { email, password, confirmPassword } = signupData;

    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    const redirectUrl = `${window.location.origin}/`; // Required for Supabase email confirmation
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl }
    });

    if (error) {
      toast({
        title: "Sign up failed",
        description: error.message ?? "Please try again",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }
    toast({
      title: "Sign Up Successful",
      description: `Please check your email to confirm your registration.`,
    });
    setIsLoading(false);
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

        <div className="flex justify-center">
          {/* Auth Form */}
          <Card className="shadow-xl w-full max-w-md">
            <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
              <CardTitle className="text-2xl text-center">Access Portal</CardTitle>
              <CardDescription className="text-primary-foreground/80 text-center">
                Sign in or create an account to manage hospital operations
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
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
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
                    <Label htmlFor="signupEmail">Email</Label>
                    <Input
                      id="signupEmail"
                      type="email"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signupPassword">Password</Label>
                    <Input
                      id="signupPassword"
                      type="password"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      placeholder="Create password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
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
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
