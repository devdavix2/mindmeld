import { supabase } from "./supabase"

// Save progress for a completed challenge
export async function saveProgress(progress) {
  try {
    const { user_id, challenge_id, points_earned } = progress

    if (!user_id) {
      console.error("User ID is required to save progress")
      return null
    }

    // Check if the user has already completed this challenge
    const { data: existingProgress } = await supabase
      .from("user_challenges")
      .select("*")
      .eq("user_id", user_id)
      .eq("challenge_id", challenge_id)
      .single()

    if (existingProgress) {
      // Update existing progress
      const { error } = await supabase
        .from("user_challenges")
        .update({
          completed: true,
          points_earned,
          completed_at: new Date().toISOString(),
        })
        .eq("id", existingProgress.id)

      if (error) throw error
    } else {
      // Insert new progress
      const { error } = await supabase.from("user_challenges").insert({
        user_id,
        challenge_id,
        completed: true,
        points_earned,
        completed_at: new Date().toISOString(),
      })

      if (error) throw error
    }

    // Update user's total points
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("total_points")
      .eq("id", user_id)
      .single()

    if (profileError) throw profileError

    const newTotalPoints = (profile?.total_points || 0) + points_earned
    const newLevel = Math.floor(newTotalPoints / 500) + 1

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        total_points: newTotalPoints,
        level: newLevel,
      })
      .eq("id", user_id)

    if (updateError) throw updateError

    // Update streak
    const today = new Date().toISOString().split("T")[0]

    // Check if user already has a streak log for today
    const { data: existingStreakLog } = await supabase
      .from("streak_logs")
      .select("*")
      .eq("user_id", user_id)
      .eq("streak_date", today)
      .single()

    if (!existingStreakLog) {
      // Add today to streak logs
      const { error: streakError } = await supabase.from("streak_logs").insert({
        user_id,
        streak_date: today,
      })

      if (streakError) throw streakError

      // Calculate current streak
      const { data: streakLogs, error: logsError } = await supabase
        .from("streak_logs")
        .select("streak_date")
        .eq("user_id", user_id)
        .order("streak_date", { ascending: false })

      if (logsError) throw logsError

      let currentStreak = 1
      const sortedDates = streakLogs.map((log) => new Date(log.streak_date)).sort((a, b) => b.getTime() - a.getTime())

      for (let i = 0; i < sortedDates.length - 1; i++) {
        const current = sortedDates[i]
        const previous = sortedDates[i + 1]

        // Check if dates are consecutive
        const diffTime = current.getTime() - previous.getTime()
        const diffDays = diffTime / (1000 * 60 * 60 * 24)

        if (diffDays === 1) {
          currentStreak++
        } else {
          break
        }
      }

      // Update user's streak
      const { data: userProfile, error: userProfileError } = await supabase
        .from("profiles")
        .select("current_streak, longest_streak")
        .eq("id", user_id)
        .single()

      if (userProfileError) throw userProfileError

      const longestStreak = Math.max(userProfile?.longest_streak || 0, currentStreak)

      const { error: updateStreakError } = await supabase
        .from("profiles")
        .update({
          current_streak: currentStreak,
          longest_streak: longestStreak,
          last_active: new Date().toISOString(),
        })
        .eq("id", user_id)

      if (updateStreakError) throw updateStreakError
    }

    // Check for achievements
    await checkAchievements(user_id)

    // Return updated profile data
    const { data: updatedProfile, error: updatedProfileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user_id)
      .single()

    if (updatedProfileError) throw updatedProfileError

    return updatedProfile
  } catch (error) {
    console.error("Error saving progress:", error)
    return null
  }
}

// Load user progress
export async function loadProgress(userId) {
  try {
    if (!userId) {
      console.error("User ID is required to load progress")
      return null
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (profileError) throw profileError

    // Get completed challenges
    const { data: completedChallenges, error: challengesError } = await supabase
      .from("user_challenges")
      .select("*, challenge:challenges(*)")
      .eq("user_id", userId)
      .eq("completed", true)

    if (challengesError) throw challengesError

    // Get streak logs
    const { data: streakLogs, error: streakError } = await supabase
      .from("streak_logs")
      .select("streak_date")
      .eq("user_id", userId)
      .order("streak_date", { ascending: false })

    if (streakError) throw streakError

    // Get achievements
    const { data: achievements, error: achievementsError } = await supabase
      .from("user_achievements")
      .select("*, achievement:achievements(*)")
      .eq("user_id", userId)

    if (achievementsError) throw achievementsError

    return {
      profile,
      completedChallenges,
      streakLogs,
      achievements,
    }
  } catch (error) {
    console.error("Error loading progress:", error)
    return null
  }
}

// Check and award achievements
async function checkAchievements(userId) {
  try {
    // Get completed challenges count
    const { data: completedChallenges, error: challengesError } = await supabase
      .from("user_challenges")
      .select("challenge_id, challenge:challenges(category)")
      .eq("user_id", userId)
      .eq("completed", true)

    if (challengesError) throw challengesError

    // Get user profile for streak info
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("current_streak")
      .eq("id", userId)
      .single()

    if (profileError) throw profileError

    // Get all achievements
    const { data: allAchievements, error: achievementsError } = await supabase.from("achievements").select("*")

    if (achievementsError) throw achievementsError

    // Get user's existing achievements
    const { data: userAchievements, error: userAchievementsError } = await supabase
      .from("user_achievements")
      .select("achievement_id")
      .eq("user_id", userId)

    if (userAchievementsError) throw userAchievementsError

    const earnedAchievementIds = userAchievements.map((ua) => ua.achievement_id)

    // Check for achievements to award
    const achievementsToAward = []

    // Challenge count achievements
    const challengeCount = completedChallenges.length

    // Category counts
    const categoryCounts = {}
    completedChallenges.forEach((cc) => {
      const category = cc.challenge?.category
      if (category) {
        categoryCounts[category] = (categoryCounts[category] || 0) + 1
      }
    })

    // Check each achievement
    allAchievements.forEach((achievement) => {
      // Skip if already earned
      if (earnedAchievementIds.includes(achievement.id)) return

      let shouldAward = false

      // Progress achievements
      if (achievement.category === "progress") {
        if (achievement.name === "First Steps" && challengeCount >= 1) {
          shouldAward = true
        } else if (achievement.name === "Brain Starter" && challengeCount >= 5) {
          shouldAward = true
        } else if (achievement.name === "Mind Master" && challengeCount >= 25) {
          shouldAward = true
        }
      }

      // Streak achievements
      if (achievement.category === "streak") {
        const currentStreak = profile?.current_streak || 0
        if (achievement.name === "Streak Beginner" && currentStreak >= 3) {
          shouldAward = true
        } else if (achievement.name === "Streak Enthusiast" && currentStreak >= 7) {
          shouldAward = true
        } else if (achievement.name === "Streak Master" && currentStreak >= 30) {
          shouldAward = true
        }
      }

      // Category achievements
      if (achievement.category === "category") {
        if (achievement.name === "Logic Novice" && (categoryCounts["logic"] || 0) >= 3) {
          shouldAward = true
        } else if (achievement.name === "Memory Whiz" && (categoryCounts["memory"] || 0) >= 3) {
          shouldAward = true
        } else if (achievement.name === "Riddle Solver" && (categoryCounts["riddle"] || 0) >= 3) {
          shouldAward = true
        } else if (achievement.name === "Puzzle Master" && (categoryCounts["puzzle"] || 0) >= 3) {
          shouldAward = true
        }
      }

      if (shouldAward) {
        achievementsToAward.push({
          user_id: userId,
          achievement_id: achievement.id,
        })
      }
    })

    // Award new achievements
    if (achievementsToAward.length > 0) {
      const { error: insertError } = await supabase.from("user_achievements").insert(achievementsToAward)

      if (insertError) throw insertError

      // Add achievement points to user's total
      const totalAchievementPoints = achievementsToAward.reduce((total, achievement) => {
        const achievementData = allAchievements.find((a) => a.id === achievement.achievement_id)
        return total + (achievementData?.points || 0)
      }, 0)

      if (totalAchievementPoints > 0) {
        const { data: userProfile, error: userProfileError } = await supabase
          .from("profiles")
          .select("total_points")
          .eq("id", userId)
          .single()

        if (userProfileError) throw userProfileError

        const newTotalPoints = (userProfile?.total_points || 0) + totalAchievementPoints
        const newLevel = Math.floor(newTotalPoints / 500) + 1

        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            total_points: newTotalPoints,
            level: newLevel,
          })
          .eq("id", userId)

        if (updateError) throw updateError
      }
    }

    return achievementsToAward
  } catch (error) {
    console.error("Error checking achievements:", error)
    return []
  }
}

// Get daily challenge
export async function getDailyChallenge() {
  try {
    const today = new Date().toISOString().split("T")[0]

    // Check if there's already a daily challenge for today
    const { data: existingDaily, error: existingError } = await supabase
      .from("challenges")
      .select("*")
      .eq("is_daily", true)
      .eq("daily_date", today)
      .single()

    if (!existingError && existingDaily) {
      return existingDaily
    }

    // Get all challenges
    const { data: challenges, error: challengesError } = await supabase.from("challenges").select("*")

    if (challengesError) throw challengesError

    // Reset any previous daily challenges
    const { error: resetError } = await supabase.from("challenges").update({ is_daily: false }).eq("is_daily", true)

    if (resetError) throw resetError

    // Select a random challenge as today's daily
    const randomIndex = Math.floor(Math.random() * challenges.length)
    const dailyChallenge = challenges[randomIndex]

    // Update the challenge to be today's daily
    const { error: updateError } = await supabase
      .from("challenges")
      .update({
        is_daily: true,
        daily_date: today,
      })
      .eq("id", dailyChallenge.id)

    if (updateError) throw updateError

    return dailyChallenge
  } catch (error) {
    console.error("Error getting daily challenge:", error)
    return null
  }
}

// Reset user progress (for testing)
export async function resetProgress(userId) {
  try {
    if (!userId) {
      console.error("User ID is required to reset progress")
      return false
    }

    // Delete user challenges
    const { error: challengesError } = await supabase.from("user_challenges").delete().eq("user_id", userId)

    if (challengesError) throw challengesError

    // Delete user achievements
    const { error: achievementsError } = await supabase.from("user_achievements").delete().eq("user_id", userId)

    if (achievementsError) throw achievementsError

    // Delete streak logs
    const { error: streakError } = await supabase.from("streak_logs").delete().eq("user_id", userId)

    if (streakError) throw streakError

    // Reset profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        level: 1,
        total_points: 0,
        current_streak: 0,
        longest_streak: 0,
      })
      .eq("id", userId)

    if (profileError) throw profileError

    return true
  } catch (error) {
    console.error("Error resetting progress:", error)
    return false
  }
}

