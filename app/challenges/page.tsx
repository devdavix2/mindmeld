"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  ArrowLeftIcon,
  BrainIcon,
  TrophyIcon,
  CheckIcon,
  ClockIcon,
  HomeIcon,
  UserIcon,
  LineChartIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import DailyChallenge from "@/components/daily-challenge"
import { getDailyChallenge, loadProgress } from "@/lib/storage-utils"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"

export default function ChallengePage() {
  const [activeTab, setActiveTab] = useState("today")
  const [dailyChallenge, setDailyChallenge] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [challenges, setChallenges] = useState([])
  const [userProgress, setUserProgress] = useState(null)
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    // Fetch daily challenge from Supabase
    const fetchDailyChallenge = async () => {
      setIsLoading(true)
      try {
        const challenge = await getDailyChallenge()
        setDailyChallenge(challenge)
      } catch (error) {
        console.error("Error fetching daily challenge:", error)
        toast({
          title: "Error",
          description: "Failed to load daily challenge. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    // Fetch all challenges
    const fetchChallenges = async () => {
      try {
        const { data, error } = await supabase.from("challenges").select("*").order("id", { ascending: true })

        if (error) throw error
        setChallenges(data || [])
      } catch (error) {
        console.error("Error fetching challenges:", error)
        toast({
          title: "Error",
          description: "Failed to load challenges. Please try again.",
          variant: "destructive",
        })
      }
    }

    // Load user progress if logged in
    const fetchUserProgress = async () => {
      if (user) {
        try {
          const progress = await loadProgress(user.id)
          setUserProgress(progress)
        } catch (error) {
          console.error("Error loading user progress:", error)
        }
      }
    }

    fetchDailyChallenge()
    fetchChallenges()
    fetchUserProgress()
  }, [toast, user])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top navigation */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          {user && userProgress?.profile && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <TrophyIcon className="h-5 w-5 text-yellow-500 mr-1" />
                <span className="text-sm font-medium">Level {userProgress.profile.level || 1}</span>
              </div>
              <div className="flex items-center">
                <CheckIcon className="h-5 w-5 text-green-500 mr-1" />
                <span className="text-sm font-medium">{userProgress.profile.current_streak || 0} day streak</span>
              </div>
            </div>
          )}

          {!user && (
            <div className="flex items-center space-x-2">
              <Link href="/auth/sign-in">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Daily Brain Workout</h1>
          <p className="text-gray-600">Complete today's challenge to maintain your streak!</p>
        </div>

        <div className="grid md:grid-cols-12 gap-6">
          {/* Main content area */}
          <div className="md:col-span-9">
            <Tabs defaultValue="today" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="today">Today's Challenge</TabsTrigger>
                <TabsTrigger value="explore">Explore Challenges</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>

              <TabsContent value="today" className="space-y-6">
                {isLoading ? (
                  <Card>
                    <CardContent className="flex justify-center items-center min-h-[400px]">
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
                        <p className="text-gray-500">Loading today's challenge...</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {dailyChallenge ? (
                      <DailyChallenge challenge={dailyChallenge} />
                    ) : (
                      <Card>
                        <CardContent className="flex justify-center items-center min-h-[400px]">
                          <div className="flex flex-col items-center">
                            <p className="text-gray-500">No daily challenge available. Please try again later.</p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </motion.div>
                )}
              </TabsContent>

              <TabsContent value="explore" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {challenges.slice(0, 6).map((challenge, index) => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      onClick={() => {
                        setDailyChallenge(challenge)
                        setActiveTab("today")
                      }}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="completed" className="space-y-6">
                {user && userProgress?.completedChallenges?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userProgress.completedChallenges.map((userChallenge) => (
                      <CompletedChallengeCard key={userChallenge.id} userChallenge={userChallenge} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow p-6 text-center">
                    <div className="flex justify-center mb-4">
                      <CheckIcon className="h-16 w-16 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">No completed challenges yet</h3>
                    <p className="text-gray-600 mb-4">
                      {user
                        ? "Complete your first challenge to see it here!"
                        : "Sign in to track your completed challenges!"}
                    </p>
                    {!user && (
                      <Link href="/auth/sign-in">
                        <Button>Sign In</Button>
                      </Link>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-3 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  {user ? (
                    <>
                      <div className="relative mb-4">
                        <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center">
                          {userProgress?.profile?.avatar_url ? (
                            <img
                              src={userProgress.profile.avatar_url || "/placeholder.svg"}
                              alt="User avatar"
                              className="h-20 w-20 rounded-full object-cover"
                            />
                          ) : (
                            <UserIcon className="h-10 w-10 text-indigo-600" />
                          )}
                        </div>
                        <div className="absolute bottom-0 right-0 h-6 w-6 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <h3 className="font-medium">{userProgress?.profile?.username || user.email}</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Level {userProgress?.profile?.level || 1} Brain Master
                      </p>

                      <div className="w-full grid grid-cols-2 gap-2 text-center">
                        <div className="bg-indigo-50 p-2 rounded">
                          <p className="text-xl font-semibold text-indigo-600">
                            {userProgress?.profile?.current_streak || 0}
                          </p>
                          <p className="text-xs text-gray-600">Day Streak</p>
                        </div>
                        <div className="bg-indigo-50 p-2 rounded">
                          <p className="text-xl font-semibold text-indigo-600">
                            {userProgress?.profile?.total_points || 0}
                          </p>
                          <p className="text-xs text-gray-600">Total Points</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="mb-4">
                        <UserIcon className="h-16 w-16 text-gray-300" />
                      </div>
                      <h3 className="font-medium mb-2">Sign in to track progress</h3>
                      <p className="text-sm text-gray-500 mb-4 text-center">
                        Create an account to save your progress and earn achievements!
                      </p>
                      <div className="w-full space-y-2">
                        <Link href="/auth/sign-in">
                          <Button variant="outline" className="w-full">
                            Sign In
                          </Button>
                        </Link>
                        <Link href="/auth/sign-up">
                          <Button className="w-full">Sign Up</Button>
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {user && userProgress?.achievements?.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-medium mb-4 flex items-center">
                    <TrophyIcon className="h-5 w-5 text-yellow-500 mr-1" />
                    Recent Achievements
                  </h3>
                  <ul className="space-y-3">
                    {userProgress.achievements.slice(0, 3).map((userAchievement) => (
                      <li key={userAchievement.id} className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                          <CheckIcon className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{userAchievement.achievement.name}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(userAchievement.earned_at).toLocaleDateString()}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Bottom navigation for mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
        <div className="flex justify-around items-center py-2">
          <Link href="/" className="flex flex-col items-center p-2">
            <HomeIcon className="h-6 w-6 text-gray-600" />
            <span className="text-xs text-gray-600">Home</span>
          </Link>
          <Link href="/challenges" className="flex flex-col items-center p-2">
            <BrainIcon className="h-6 w-6 text-indigo-600" />
            <span className="text-xs text-indigo-600">Challenges</span>
          </Link>
          <Link href="/progress" className="flex flex-col items-center p-2">
            <LineChartIcon className="h-6 w-6 text-gray-600" />
            <span className="text-xs text-gray-600">Progress</span>
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

function ChallengeCard({ challenge, onClick }) {
  const getCategoryIcon = (category) => {
    const { PuzzleIcon, LightbulbIcon, BrainIcon, BookOpenIcon } = require("lucide-react")

    switch (category) {
      case "puzzle":
        return <PuzzleIcon className="h-5 w-5" />
      case "riddle":
        return <LightbulbIcon className="h-5 w-5" />
      case "logic":
        return <BrainIcon className="h-5 w-5" />
      case "memory":
        return <BookOpenIcon className="h-5 w-5" />
      default:
        return <BrainIcon className="h-5 w-5" />
    }
  }

  return (
    <Card className="hover:shadow-md transition cursor-pointer" onClick={onClick}>
      <CardContent className="p-0">
        <div className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div className={`p-2 rounded-lg ${getCategoryColor(challenge.category)}`}>
              {getCategoryIcon(challenge.category)}
            </div>
            <div className="flex items-center">
              <ClockIcon className="h-4 w-4 text-gray-400 mr-1" />
              <span className="text-xs text-gray-500">{challenge.estimated_time} min</span>
            </div>
          </div>
          <h3 className="font-medium mb-1">{challenge.title}</h3>
          <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>
          <div className="flex justify-between items-center">
            <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(challenge.difficulty)}`}>
              {challenge.difficulty}
            </span>
            <span className="text-xs text-gray-500">{challenge.points} points</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CompletedChallengeCard({ userChallenge }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-medium">{userChallenge.challenge.title}</h3>
          <div className="flex items-center">
            <CheckIcon className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-xs text-gray-500">{new Date(userChallenge.completed_at).toLocaleDateString()}</span>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-3">{userChallenge.challenge.description}</p>
        <div className="flex justify-between items-center">
          <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(userChallenge.challenge.category)}`}>
            {userChallenge.challenge.category}
          </span>
          <span className="text-xs text-gray-500">{userChallenge.points_earned} points earned</span>
        </div>
      </CardContent>
    </Card>
  )
}

function getCategoryColor(category) {
  switch (category) {
    case "puzzle":
      return "bg-purple-100 text-purple-600"
    case "riddle":
      return "bg-blue-100 text-blue-600"
    case "logic":
      return "bg-green-100 text-green-600"
    case "memory":
      return "bg-orange-100 text-orange-600"
    default:
      return "bg-gray-100 text-gray-600"
  }
}

function getDifficultyColor(difficulty) {
  switch (difficulty) {
    case "Easy":
      return "bg-green-100 text-green-600"
    case "Medium":
      return "bg-yellow-100 text-yellow-600"
    case "Hard":
      return "bg-red-100 text-red-600"
    default:
      return "bg-gray-100 text-gray-600"
  }
}

