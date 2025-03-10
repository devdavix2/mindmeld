"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeftIcon,
  BrainIcon,
  TrophyIcon,
  CheckIcon,
  HomeIcon,
  UserIcon,
  LineChartIcon,
  SettingsIcon,
  PaletteIcon,
  MoonIcon,
  SunIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { resetProgress, loadProgress } from "@/lib/storage-utils"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"

export default function ProfilePage() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userProfile, setUserProfile] = useState(null)
  const [achievements, setAchievements] = useState([])
  const { toast } = useToast()
  const { user, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      router.push("/auth/sign-in")
      return
    }

    // Load user profile and achievements
    const loadUserData = async () => {
      setIsLoading(true)
      try {
        const userData = await loadProgress(user.id)
        if (userData) {
          setUserProfile(userData.profile)
          setAchievements(userData.achievements || [])

          // Set preferences from user profile
          if (userData.profile?.preferences) {
            const prefs = userData.profile.preferences
            setNotifications(prefs.notifications !== false)
            setIsDarkMode(prefs.darkMode === true)
            setEmailNotifications(prefs.emailNotifications === true)

            // Apply dark mode if needed
            if (prefs.darkMode) {
              document.documentElement.classList.add("dark")
            } else {
              document.documentElement.classList.remove("dark")
            }
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error)
        toast({
          title: "Error loading profile",
          description: "We couldn't load your profile data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [user, router, toast])

  const handleReset = async () => {
    if (!user) return

    if (confirm("Are you sure you want to reset all your progress? This action cannot be undone.")) {
      const success = await resetProgress(user.id)

      if (success) {
        toast({
          title: "Progress reset",
          description: "All your progress has been reset successfully",
        })

        // Reload user data
        const userData = await loadProgress(user.id)
        if (userData) {
          setUserProfile(userData.profile)
          setAchievements(userData.achievements || [])
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to reset progress. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const toggleDarkMode = async () => {
    const newDarkMode = !isDarkMode
    setIsDarkMode(newDarkMode)

    // Update DOM
    if (newDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }

    // Update user preferences in database
    if (user) {
      try {
        const { data: profile } = await supabase.from("profiles").select("preferences").eq("id", user.id).single()

        const preferences = profile?.preferences || {}
        preferences.darkMode = newDarkMode

        await supabase
          .from("profiles")
          .update({
            preferences,
          })
          .eq("id", user.id)

        toast({
          title: newDarkMode ? "Dark mode enabled" : "Light mode enabled",
          description: "Your theme preference has been updated",
        })
      } catch (error) {
        console.error("Error updating preferences:", error)
      }
    }
  }

  const updateNotificationSettings = async (type, value) => {
    if (!user) return

    try {
      const { data: profile } = await supabase.from("profiles").select("preferences").eq("id", user.id).single()

      const preferences = profile?.preferences || {}

      if (type === "push") {
        preferences.notifications = value
        setNotifications(value)
      } else if (type === "email") {
        preferences.emailNotifications = value
        setEmailNotifications(value)
      }

      await supabase
        .from("profiles")
        .update({
          preferences,
        })
        .eq("id", user.id)

      toast({
        title: "Settings updated",
        description: "Your notification preferences have been saved",
      })
    } catch (error) {
      console.error("Error updating notification settings:", error)
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top navigation */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/challenges">
            <Button variant="ghost" size="sm">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Challenges
            </Button>
          </Link>

          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <TrophyIcon className="h-5 w-5 text-yellow-500 mr-1" />
              <span className="text-sm font-medium">Level {userProfile?.level || 1}</span>
            </div>
            <div className="flex items-center">
              <CheckIcon className="h-5 w-5 text-green-500 mr-1" />
              <span className="text-sm font-medium">{userProfile?.current_streak || 0} day streak</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 dark:text-white">Your Profile</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your account and preferences</p>
        </div>

        <div className="grid md:grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={userProfile?.avatar_url || "/placeholder.svg?height=96&width=96"} alt="User" />
                    <AvatarFallback>{getInitials(userProfile?.full_name || user?.email)}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold mb-1 dark:text-white">{userProfile?.full_name || "User"}</h2>
                  <p className="text-gray-500 dark:text-gray-400 mb-2">{user?.email}</p>
                  <Badge className="mb-6">Level {userProfile?.level || 1} Brain Master</Badge>

                  <div className="w-full grid grid-cols-3 gap-2 text-center mb-6">
                    <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded">
                      <p className="text-xl font-semibold text-indigo-600 dark:text-indigo-400">
                        {userProfile?.current_streak || 0}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Day Streak</p>
                    </div>
                    <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded">
                      <p className="text-xl font-semibold text-indigo-600 dark:text-indigo-400">
                        {achievements.length || 0}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Achievements</p>
                    </div>
                    <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded">
                      <p className="text-xl font-semibold text-indigo-600 dark:text-indigo-400">
                        {userProfile?.total_points || 0}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Points</p>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Recent Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                {achievements.length > 0 ? (
                  <ul className="space-y-3">
                    {achievements.slice(0, 3).map((achievement) => (
                      <li key={achievement.id} className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-3">
                          <TrophyIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium dark:text-white">{achievement.achievement.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(achievement.earned_at).toLocaleDateString()}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 dark:text-gray-400">Complete challenges to earn achievements!</p>
                  </div>
                )}
                {achievements.length > 0 && (
                  <Button variant="ghost" className="w-full mt-4">
                    View All Achievements
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main content */}
          <div className="md:col-span-8">
            <Tabs defaultValue="settings">
              <TabsList className="mb-6">
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <SettingsIcon className="h-4 w-4" />
                  Settings
                </TabsTrigger>
                <TabsTrigger value="preferences" className="flex items-center gap-2">
                  <PaletteIcon className="h-4 w-4" />
                  Preferences
                </TabsTrigger>
                <TabsTrigger value="account" className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  Account
                </TabsTrigger>
              </TabsList>

              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>Manage how you receive notifications</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium dark:text-white">Push Notifications</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Receive notifications about new challenges and achievements
                        </p>
                      </div>
                      <Switch
                        checked={notifications}
                        onCheckedChange={(value) => updateNotificationSettings("push", value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium dark:text-white">Email Notifications</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Receive weekly summaries and important updates via email
                        </p>
                      </div>
                      <Switch
                        checked={emailNotifications}
                        onCheckedChange={(value) => updateNotificationSettings("email", value)}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>Customize how MindMeld looks</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {isDarkMode ? (
                          <MoonIcon className="h-5 w-5 mr-2 dark:text-white" />
                        ) : (
                          <SunIcon className="h-5 w-5 mr-2" />
                        )}
                        <div>
                          <p className="font-medium dark:text-white">Dark Mode</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Switch between light and dark themes
                          </p>
                        </div>
                      </div>
                      <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preferences">
                <Card>
                  <CardHeader>
                    <CardTitle>Challenge Preferences</CardTitle>
                    <CardDescription>Customize your daily challenges</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1 dark:text-white">Preferred Difficulty</label>
                        <select className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                          <option>Adaptive (Recommended)</option>
                          <option>Easy</option>
                          <option>Medium</option>
                          <option>Hard</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 dark:text-white">Favorite Categories</label>
                        <div className="grid grid-cols-2 gap-2">
                          <label className="flex items-center space-x-2">
                            <input type="checkbox" className="rounded" defaultChecked />
                            <span className="dark:text-white">Logic Puzzles</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input type="checkbox" className="rounded" defaultChecked />
                            <span className="dark:text-white">Riddles</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input type="checkbox" className="rounded" defaultChecked />
                            <span className="dark:text-white">Memory Games</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input type="checkbox" className="rounded" defaultChecked />
                            <span className="dark:text-white">Word Puzzles</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="ml-auto">Save Preferences</Button>
                  </CardFooter>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Reminders</CardTitle>
                    <CardDescription>Set daily reminders for your brain workout</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium dark:text-white">Daily Reminder</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Get a notification to complete your daily challenge
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 dark:text-white">Reminder Time</label>
                        <input
                          type="time"
                          className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                          defaultValue="08:00"
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="ml-auto">Save Reminders</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="account">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>Update your account details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1 dark:text-white">Username</label>
                          <input
                            type="text"
                            className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            defaultValue={userProfile?.username || ""}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 dark:text-white">Full Name</label>
                          <input
                            type="text"
                            className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            defaultValue={userProfile?.full_name || ""}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 dark:text-white">Email Address</label>
                        <input
                          type="email"
                          className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                          defaultValue={user?.email || ""}
                          disabled
                        />
                        <p className="text-xs text-gray-500 mt-1">To change your email, please contact support</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="ml-auto">Update Profile</Button>
                  </CardFooter>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
                    <CardDescription>Actions that cannot be undone</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="font-medium dark:text-white">Reset Progress</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        This will reset all your progress, including points, streaks, and achievements.
                      </p>
                      <Button variant="destructive" size="sm" onClick={handleReset}>
                        Reset All Progress
                      </Button>
                    </div>
                    <div className="border-t pt-4">
                      <p className="font-medium dark:text-white">Sign Out</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        Sign out of your account on this device.
                      </p>
                      <Button variant="outline" size="sm" onClick={handleSignOut}>
                        Sign Out
                      </Button>
                    </div>
                    <div className="border-t pt-4">
                      <p className="font-medium dark:text-white">Delete Account</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        This will permanently delete your account and all associated data.
                      </p>
                      <Button variant="destructive" size="sm">
                        Delete Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Bottom navigation for mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-10">
        <div className="flex justify-around items-center py-2">
          <Link href="/" className="flex flex-col items-center p-2">
            <HomeIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Home</span>
          </Link>
          <Link href="/challenges" className="flex flex-col items-center p-2">
            <BrainIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Challenges</span>
          </Link>
          <Link href="/progress" className="flex flex-col items-center p-2">
            <LineChartIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Progress</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center p-2">
            <UserIcon className="h-6 w-6 text-indigo-600" />
            <span className="text-xs text-indigo-600">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}

// Helper function to get initials from name
function getInitials(name) {
  if (!name) return "U"

  const parts = name.split(/[@\s]/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()

  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase()
}

