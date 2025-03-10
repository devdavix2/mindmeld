"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowLeftIcon,
  BrainIcon,
  TrophyIcon,
  HomeIcon,
  UserIcon,
  LineChartIcon,
  BarChart3Icon,
  PieChartIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { loadProgress } from "@/lib/storage-utils"
import { useToast } from "@/hooks/use-toast"

export default function ProgressPage() {
  const [userData, setUserData] = useState({
    dailyPoints: [],
    categoryBreakdown: [],
    streakData: [],
    level: 1,
    totalPoints: 0,
    streak: 0,
    completedChallenges: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      router.push("/auth/sign-in")
      return
    }

    // Load user progress data
    const loadUserData = async () => {
      setIsLoading(true)
      try {
        const progressData = await loadProgress(user.id)

        if (progressData) {
          // Process streak data
          const streakLogs = progressData.streakLogs || []
          const streakDates = streakLogs.map((log) => new Date(log.streak_date))

          // Sort dates in ascending order
          streakDates.sort((a, b) => a.getTime() - b.getTime())

          // Get the last 14 days
          const last14Days = []
          const today = new Date()

          for (let i = 13; i >= 0; i--) {
            const date = new Date(today)
            date.setDate(today.getDate() - i)
            date.setHours(0, 0, 0, 0)

            const dateStr = date.toISOString().split("T")[0]
            const hasCompleted = streakLogs.some((log) => log.streak_date === dateStr)

            last14Days.push({
              date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
              completed: hasCompleted,
            })
          }

          // Process completed challenges for category breakdown
          const completedChallenges = progressData.completedChallenges || []
          const categories = {}

          completedChallenges.forEach((challenge) => {
            const category = challenge.challenge?.category
            if (category) {
              categories[category] = (categories[category] || 0) + 1
            }
          })

          // Convert to percentage
          const totalChallenges = completedChallenges.length
          const categoryBreakdown = []

          if (totalChallenges > 0) {
            Object.entries(categories).forEach(([name, count]) => {
              categoryBreakdown.push({
                name,
                value: Math.round(((count as number) / totalChallenges) * 100),
                color: getCategoryColor(name),
              })
            })
          }

          // Process daily points (last 7 days)
          const dailyPoints = []
          const last7Days = []

          for (let i = 6; i >= 0; i--) {
            const date = new Date(today)
            date.setDate(today.getDate() - i)
            date.setHours(0, 0, 0, 0)
            last7Days.push(date)
          }

          last7Days.forEach((date) => {
            const dateStr = date.toISOString().split("T")[0]
            const dayName = date.toLocaleDateString("en-US", { weekday: "short" })

            // Find challenges completed on this day
            const dayPoints = completedChallenges
              .filter((challenge) => {
                const completedDate = new Date(challenge.completed_at)
                return completedDate.toISOString().split("T")[0] === dateStr
              })
              .reduce((sum, challenge) => sum + (challenge.points_earned || 0), 0)

            dailyPoints.push({
              day: dayName,
              points: dayPoints,
            })
          })

          setUserData({
            dailyPoints,
            categoryBreakdown,
            streakData: last14Days,
            level: progressData.profile?.level || 1,
            totalPoints: progressData.profile?.total_points || 0,
            streak: progressData.profile?.current_streak || 0,
            completedChallenges: completedChallenges.length,
          })
        }
      } catch (error) {
        console.error("Error loading progress data:", error)
        toast({
          title: "Error loading progress",
          description: "We couldn't load your progress data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [user, router, toast])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-500">Loading your progress...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top navigation */}
      <header className="bg-white border-b border-gray-200">
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
              <span className="text-sm font-medium">Level {userData.level}</span>
            </div>
            <div className="flex items-center">
              <BrainIcon className="h-5 w-5 text-indigo-500 mr-1" />
              <span className="text-sm font-medium">{userData.totalPoints} points</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Progress</h1>
          <p className="text-gray-600">Track your brain training journey</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Current Streak"
            value={userData.streak}
            unit="days"
            icon={<BrainIcon className="h-5 w-5 text-indigo-600" />}
          />
          <StatsCard
            title="Challenges Completed"
            value={userData.completedChallenges}
            icon={<TrophyIcon className="h-5 w-5 text-yellow-500" />}
          />
          <StatsCard
            title="Total Points"
            value={userData.totalPoints}
            icon={<LineChartIcon className="h-5 w-5 text-green-600" />}
          />
        </div>

        <Tabs defaultValue="points" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="points" className="flex items-center gap-2">
              <BarChart3Icon className="h-4 w-4" />
              Points History
            </TabsTrigger>
            <TabsTrigger value="streak" className="flex items-center gap-2">
              <LineChartIcon className="h-4 w-4" />
              Streak Calendar
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <PieChartIcon className="h-4 w-4" />
              Categories
            </TabsTrigger>
          </TabsList>

          <TabsContent value="points">
            <Card>
              <CardHeader>
                <CardTitle>Daily Points</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={userData.dailyPoints}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="points" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="streak">
            <Card>
              <CardHeader>
                <CardTitle>Streak Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {userData.streakData.map((day, i) => (
                    <div key={i} className="text-center">
                      <div
                        className={`
                        h-10 w-10 rounded-full flex items-center justify-center mx-auto mb-1
                        ${day.completed ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}
                      `}
                      >
                        {day.completed ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="text-xs">{day.date}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>Challenge Categories</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col md:flex-row items-center justify-around">
                {userData.categoryBreakdown.length > 0 ? (
                  <>
                    <div className="h-[200px] w-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={userData.categoryBreakdown}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {userData.categoryBreakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 gap-x-12 gap-y-2 mt-6 md:mt-0">
                      {userData.categoryBreakdown.map((category, i) => (
                        <div key={i} className="flex items-center">
                          <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: category.color }}></div>
                          <div>
                            <p className="text-sm">{category.name}</p>
                            <p className="text-xs text-gray-500">{category.value}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-gray-500">Complete challenges to see your category breakdown!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Bottom navigation for mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
        <div className="flex justify-around items-center py-2">
          <Link href="/" className="flex flex-col items-center p-2">
            <HomeIcon className="h-6 w-6 text-gray-600" />
            <span className="text-xs text-gray-600">Home</span>
          </Link>
          <Link href="/challenges" className="flex flex-col items-center p-2">
            <BrainIcon className="h-6 w-6 text-gray-600" />
            <span className="text-xs text-gray-600">Challenges</span>
          </Link>
          <Link href="/progress" className="flex flex-col items-center p-2">
            <LineChartIcon className="h-6 w-6 text-indigo-600" />
            <span className="text-xs text-indigo-600">Progress</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center p-2">
            <UserIcon className="h-6 w-6 text-gray-600" />
            <span className="text-xs text-gray-600">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}

function StatsCard({ title, value, unit = "", icon }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <p className="text-3xl font-bold">
              {value}
              {unit && <span className="text-lg ml-1 font-normal text-gray-500">{unit}</span>}
            </p>
          </div>
          <div className="p-2 bg-gray-100 rounded-lg">{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

function getCategoryColor(category) {
  switch (category) {
    case "puzzle":
      return "#a855f7" // purple
    case "riddle":
      return "#3b82f6" // blue
    case "logic":
      return "#22c55e" // green
    case "memory":
      return "#f97316" // orange
    default:
      return "#6b7280" // gray
  }
}

