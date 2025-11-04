"use client"

import { useState, FormEvent } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { UserSession } from "@/types/auth"
import Image from "next/image"

interface LoginProps {
  onLogin: (sessionData: UserSession) => void
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Construct URL with email and password as query parameters (matching PortfolioAIEY pattern)
      const url = `/api/auth/login?email_id=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`

      const response = await fetch(url, {
        method: "GET",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Login failed")
      }

      const data: UserSession = await response.json()

      // Store in localStorage
      localStorage.setItem("user", JSON.stringify(data))

      // Trigger parent callback
      onLogin(data)

    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during login")
      console.error("Login error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
              <Image
                src="/portfolio_ai_logo.png"
                alt="EY Prometheus Logo"
                width={48}
                height={48}
                className="rounded-md"
              />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to EY Prometheus</CardTitle>
          <CardDescription>
            Sign in to access your portfolio and financial insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="John.Doe@ey.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="text-center text-sm text-muted-foreground mt-4">
              <p className="font-medium mb-2">Demo Credentials:</p>
              <p>Email: John.Doe@ey.com</p>
              <p>Password: PortfolioAI@123</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
