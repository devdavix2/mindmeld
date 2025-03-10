"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import confetti from "canvas-confetti"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { saveProgress } from "@/lib/storage-utils"
import { useAuth } from "@/contexts/auth-context"

export default function DailyChallenge({ challenge }) {
  const [status, setStatus] = useState("idle") // idle, active, completed
  const [userAnswer, setUserAnswer] = useState("")
  const [isCorrect, setIsCorrect] = useState(null)
  const { toast } = useToast()
  const { user } = useAuth()

  // Extract the icon component from the challenge category once.
  const CategoryIcon = getCategoryIcon(challenge.category)

  const handleStart = () => {
    setStatus("active")
  }

  const handleSubmit = async () => {
    const correct = userAnswer.toLowerCase() === challenge.answer.toLowerCase()
    setIsCorrect(correct)

    if (correct) {
      // Show confetti for correct answer
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })

      if (user) {
        // Update progress in Supabase
        const progress = await saveProgress({
          user_id: user.id,
          challenge_id: challenge.id,
          points_earned: challenge.points,
        })

        if (progress) {
          // Show toast
          toast({
            title: "Great job!",
            description: `You earned ${challenge.points} points!`,
            variant: "success",
          })
        } else {
          toast({
            title: "Error saving progress",
            description: "Your progress couldn't be saved. Please try again.",
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Sign in to save progress",
          description: "Create an account to track your progress and earn achievements!",
        })
      }

      setTimeout(() => {
        setStatus("completed")
      }, 1500)
    } else {
      toast({
        title: "Not quite right",
        description: "Try again!",
        variant: "destructive",
      })
    }
  }

  const renderChallengeContent = () => {
    if (status === "idle") {
      return (
        <div className="flex flex-col items-center justify-center py-10">
          <div className={`p-4 rounded-full ${getCategoryBgColor(challenge.category)} mb-6`}>
            <CategoryIcon className={`h-10 w-10 ${getCategoryTextColor(challenge.category)}`} />
          </div>
          <h2 className="text-2xl font-bold mb-3">{challenge.title}</h2>
          <p className="text-gray-600 text-center max-w-lg mb-6">{challenge.description}</p>
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <div className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700 flex items-center">
              <CategoryIcon className="h-4 w-4 mr-1" />
              {challenge.category}
            </div>
            <div className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700 flex items-center">
              <span className={`h-2 w-2 rounded-full ${getDifficultyColor(challenge.difficulty)} mr-2`}></span>
              {challenge.difficulty}
            </div>
            <div className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
              {challenge.points} points
            </div>
          </div>
          <Button size="lg" onClick={handleStart}>
            Start Challenge
          </Button>
        </div>
      )
    }

    if (status === "active") {
      return (
        <div className="py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <h3 className="text-xl font-semibold mb-4">{challenge.question}</h3>

            {challenge.type === "riddle" && (
              <div className="mb-6">
                <p className="text-gray-700 italic">{challenge.content}</p>
              </div>
            )}

            {challenge.type === "memory" && (
              <div className="mb-6">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {challenge.content.split(", ").map((item, index) => (
                    <div
                      key={index}
                      className="bg-indigo-100 aspect-square rounded-lg flex items-center justify-center text-2xl p-4"
                    >
                      {item}
                    </div>
                  ))}
                </div>
                <p className="text-gray-600 text-sm">Memorize the pattern above, then answer the question.</p>
              </div>
            )}

            {challenge.type === "logic" && (
              <div className="mb-6">
                <p className="text-gray-700">{challenge.content}</p>
                {challenge.options && (
                  <ul className="mt-4 space-y-2">
                    {JSON.parse(challenge.options).map((option, index) => (
                      <li key={index} className="flex items-center">
                        <input
                          type="radio"
                          id={`option-${index}`}
                          name="answer"
                          className="mr-2"
                          onChange={() => setUserAnswer(option)}
                        />
                        <label htmlFor={`option-${index}`}>{option}</label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {(!challenge.type || challenge.type === "puzzle") && (
              <div className="mb-6">
                <p className="text-gray-700">{challenge.content}</p>
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-1">
                Your Answer
              </label>
              <input
                type="text"
                id="answer"
                className={`w-full p-2 border rounded-md ${
                  isCorrect === true
                    ? "border-green-500 bg-green-50"
                    : isCorrect === false
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                }`}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
              />
            </div>

            <Button onClick={handleSubmit} disabled={!userAnswer}>
              Submit Answer
            </Button>
          </motion.div>
        </div>
      )
    }

    if (status === "completed") {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="py-10 text-center"
        >
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-2">Challenge Completed!</h3>
          <p className="text-gray-600 mb-6">
            You've earned {challenge.points} points{user ? " and maintained your streak" : ""}!
          </p>
          {user && (
            <div className="mb-8">
              <div className="inline-block bg-indigo-100 text-indigo-800 text-sm font-medium px-4 py-2 rounded-full">
                Current Streak: {user.user_metadata?.current_streak || 1} days
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline">Share Result</Button>
            <Button>Next Challenge</Button>
          </div>
        </motion.div>
      )
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">{renderChallengeContent()}</CardContent>
    </Card>
  )
}

function getCategoryBgColor(category) {
  switch (category) {
    case "puzzle":
      return "bg-purple-100"
    case "riddle":
      return "bg-blue-100"
    case "logic":
      return "bg-green-100"
    case "memory":
      return "bg-orange-100"
    default:
      return "bg-gray-100"
  }
}

function getCategoryTextColor(category) {
  switch (category) {
    case "puzzle":
      return "text-purple-600"
    case "riddle":
      return "text-blue-600"
    case "logic":
      return "text-green-600"
    case "memory":
      return "text-orange-600"
    default:
      return "text-gray-600"
  }
}

function getCategoryIcon(category) {
  const { PuzzleIcon, LightbulbIcon, BrainIcon, BookOpenIcon } = require("lucide-react")

  switch (category) {
    case "puzzle":
      return PuzzleIcon
    case "riddle":
      return LightbulbIcon
    case "logic":
      return BrainIcon
    case "memory":
      return BookOpenIcon
    default:
      return BrainIcon
  }
}

function getDifficultyColor(difficulty) {
  switch (difficulty) {
    case "Easy":
      return "bg-green-500"
    case "Medium":
      return "bg-yellow-500"
    case "Hard":
      return "bg-red-500"
    default:
      return "bg-gray-500"
  }
}
