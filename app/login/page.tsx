"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, BookOpen, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {

  const [uid, setUid] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    setIsLoading(true);
    setError("");

    try {

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          identifier: uid,
          password
        })
      });

      const data = await response.json();

      if (data.success) {

        // store user data
        localStorage.setItem("user", JSON.stringify({
          uid: data.uid,
          role: data.role,
          name: data.name,
          email: data.email || ''
        }));
        
        // store UID separately for backward compatibility
        localStorage.setItem("uid", data.uid);

        // Debug logging
        console.log('=== LOGIN PAGE RESPONSE ===');
        console.log('Data received:', data);
        console.log('Role received:', data.role);
        console.log('==========================');

        // store token only if returned
        if (data.token) {
          localStorage.setItem("token", data.token);
        }

        // redirect by role
        switch (data.role) {

          case "admin":
            window.location.href = "/admin/dashboard";
            break;

          case "school":
            window.location.href = "/school/dashboard";
            break;

          case "ngo":
            window.location.href = "/ngo/dashboard";
            break;

          case "donor":
            window.location.href = "/donor/dashboard";
            break;

          case "student":
            window.location.href = "/student/dashboard";
            break;

          case "volunteer":
            window.location.href = "/volunteer/dashboard";
            break;

          default:
            window.location.href = "/dashboard";
        }

      } else {

        setError(data.message || "Login failed");

      }

    } catch (err) {

      setError("An error occurred. Please try again.");

    } finally {

      setIsLoading(false);

    }

  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">

      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">

          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>

            <span className="font-bold text-2xl text-foreground">
              EduTribe
            </span>
          </div>

          <h1 className="text-2xl font-bold text-foreground">
            Welcome Back
          </h1>

          <p className="text-muted-foreground">
            Sign in to your EduTribe account
          </p>

        </div>

        {/* Login Card */}

        <Card className="border-border shadow-lg">

          <CardHeader>

            <CardTitle className="text-center">
              Login
            </CardTitle>

            <CardDescription className="text-center">
              Enter your UID and password to access your account
            </CardDescription>

          </CardHeader>

          <CardContent>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* UID */}

              <div className="space-y-2">

                <label
                  htmlFor="uid"
                  className="text-sm font-medium text-foreground"
                >
                  UID
                </label>

                <Input
                  id="uid"
                  type="text"
                  placeholder="EDU-XXXXX"
                  value={uid}
                  onChange={(e) => setUid(e.target.value)}
                  required
                  className="bg-background border-border"
                />

              </div>

              {/* Password */}

              <div className="space-y-2">

                <label
                  htmlFor="password"
                  className="text-sm font-medium text-foreground"
                >
                  Password
                </label>

                <div className="relative">

                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-background border-border pr-10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>

                </div>

              </div>

              {/* Error */}

              {error && (

                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {error}
                </div>

              )}

              {/* Button */}

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>

            </form>

            {/* Forgot password */}

            <div className="mt-4 text-center">

              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot your password?
              </Link>

            </div>

            {/* Admin Login */}

            <div className="mt-6 text-center border-t pt-6">
              <p className="text-sm text-muted-foreground mb-2">
                Are you an administrator?
              </p>
              <button
                onClick={() => window.location.href = '/admin/login'}
                className="inline-flex items-center gap-2 text-sm bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                <Shield className="w-4 h-4" />
                Admin Login
              </button>
            </div>

          </CardContent>

        </Card>

        {/* Signup link */}

        <div className="mt-6 text-center">

          <p className="text-muted-foreground">

            Don't have an account?{" "}

            <Link
              href="/signup"
              className="text-primary hover:underline font-medium"
            >
              Sign up
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
}