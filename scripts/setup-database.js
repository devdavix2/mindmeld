import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://rnoinnzfzcspmbefrrya.supabase.co"
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJub2lubnpmemNzcG1iZWZycnlhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTU5NjM4NCwiZXhwIjoyMDU3MTcyMzg0fQ.Jzo9W6e6_3fF877KMsT8k-RWRc7zCj2LeZY4ssUhA_w"

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  console.log("Setting up MindMeld database schema...")

  // Create profiles table (extends the auth.users table)
  const { error: profilesError } = await supabase.rpc("create_profiles_table")
  if (profilesError) {
    console.log("Creating profiles table manually...")
    const { error } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID REFERENCES auth.users(id) PRIMARY KEY,
        username TEXT UNIQUE,
        full_name TEXT,
        avatar_url TEXT,
        level INTEGER DEFAULT 1,
        total_points INTEGER DEFAULT 0,
        current_streak INTEGER DEFAULT 0,
        longest_streak INTEGER DEFAULT 0,
        last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        preferences JSONB DEFAULT '{"difficulty": "adaptive", "categories": ["logic", "memory", "riddle", "puzzle"], "notifications": true, "darkMode": false}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `)
    if (error) console.error("Error creating profiles table:", error)
    else console.log("Profiles table created successfully")
  } else {
    console.log("Profiles table already exists or was created successfully")
  }

  // Create challenges table
  const { error: challengesError } = await supabase.query(`
    CREATE TABLE IF NOT EXISTS challenges (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      type TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      points INTEGER NOT NULL,
      estimated_time INTEGER NOT NULL,
      question TEXT NOT NULL,
      content TEXT,
      hint TEXT,
      answer TEXT NOT NULL,
      options JSONB,
      is_daily BOOLEAN DEFAULT FALSE,
      daily_date DATE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `)
  if (challengesError) console.error("Error creating challenges table:", challengesError)
  else console.log("Challenges table created successfully")

  // Create user_challenges table
  const { error: userChallengesError } = await supabase.query(`
    CREATE TABLE IF NOT EXISTS user_challenges (
      id SERIAL PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) NOT NULL,
      challenge_id INTEGER REFERENCES challenges(id) NOT NULL,
      completed BOOLEAN DEFAULT FALSE,
      points_earned INTEGER DEFAULT 0,
      attempts INTEGER DEFAULT 0,
      time_spent INTEGER, -- in seconds
      completed_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id, challenge_id)
    );
  `)
  if (userChallengesError) console.error("Error creating user_challenges table:", userChallengesError)
  else console.log("User challenges table created successfully")

  // Create achievements table
  const { error: achievementsError } = await supabase.query(`
    CREATE TABLE IF NOT EXISTS achievements (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      icon TEXT NOT NULL,
      category TEXT NOT NULL,
      points INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `)
  if (achievementsError) console.error("Error creating achievements table:", achievementsError)
  else console.log("Achievements table created successfully")

  // Create user_achievements table
  const { error: userAchievementsError } = await supabase.query(`
    CREATE TABLE IF NOT EXISTS user_achievements (
      id SERIAL PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) NOT NULL,
      achievement_id INTEGER REFERENCES achievements(id) NOT NULL,
      earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id, achievement_id)
    );
  `)
  if (userAchievementsError) console.error("Error creating user_achievements table:", userAchievementsError)
  else console.log("User achievements table created successfully")

  // Create streak_logs table
  const { error: streakLogsError } = await supabase.query(`
    CREATE TABLE IF NOT EXISTS streak_logs (
      id SERIAL PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) NOT NULL,
      streak_date DATE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id, streak_date)
    );
  `)
  if (streakLogsError) console.error("Error creating streak_logs table:", streakLogsError)
  else console.log("Streak logs table created successfully")

  // Insert sample challenges
  const challenges = [
    {
      title: "Word Association Puzzle",
      description: "Find the word that connects these three words",
      category: "puzzle",
      type: "puzzle",
      difficulty: "Medium",
      points: 100,
      estimated_time: 5,
      question: "Find the word that connects these three words",
      content: "TENNIS • NOISE • RACKET",
      hint: "Think about sports equipment",
      answer: "racket",
    },
    {
      title: "Classic Riddle",
      description: "Solve this classic riddle that tests your lateral thinking",
      category: "riddle",
      type: "riddle",
      difficulty: "Easy",
      points: 75,
      estimated_time: 3,
      question: "What can you catch but not throw?",
      content: "Think about things that can be 'caught' but not physically thrown.",
      hint: "It's something that happens to you, not an object",
      answer: "cold",
    },
    {
      title: "Number Sequence",
      description: "Find the next number in this logical sequence",
      category: "logic",
      type: "logic",
      difficulty: "Hard",
      points: 150,
      estimated_time: 8,
      question: "What is the next number in this sequence?",
      content: "2, 3, 5, 9, 17, ?",
      hint: "The relationship between consecutive numbers follows a pattern",
      answer: "33",
    },
    {
      title: "Memory Challenge",
      description: "Memorize and recall a sequence of symbols",
      category: "memory",
      type: "memory",
      difficulty: "Medium",
      points: 125,
      estimated_time: 5,
      question: "What was the middle symbol in the second row?",
      content: "🌟, 🔥, 🌈, 🍎, 🌊, 💎, 🚀, 🎮, 🎸",
      hint: "Try creating a story with the symbols to help remember them",
      answer: "🌊",
    },
    {
      title: "Word Ladder",
      description: "Transform one word into another by changing one letter at a time",
      category: "puzzle",
      type: "puzzle",
      difficulty: "Hard",
      points: 175,
      estimated_time: 10,
      question: "Transform COLD into WARM using only valid words, changing one letter at a time",
      content: "Example: CAT → COT → DOT → DOG (changing one letter at each step)",
      hint: "There are multiple possible paths",
      answer: "cold cord word warm",
    },
    {
      title: "Logic Grid Puzzle",
      description: "Use the clues to fill in a logic grid and solve the mystery",
      category: "logic",
      type: "logic",
      difficulty: "Hard",
      points: 200,
      estimated_time: 15,
      question: "Based on the given information, who owns the zebra?",
      content:
        "Five people of different nationalities live in five consecutive houses of different colors. They own different pets, drink different beverages, and the houses are numbered 1-5 from left to right. The Englishman lives in the red house. The Spaniard owns a dog. Coffee is drunk in the green house. The Ukrainian drinks tea. The green house is immediately to the right of the ivory house. The Old Gold smoker owns snails. Kools are smoked in the yellow house. Milk is drunk in the middle house. The Norwegian lives in the first house. The man who smokes Chesterfields lives in the house next to the man with the fox. Kools are smoked in the house next to the house where the horse is kept. The Lucky Strike smoker drinks orange juice. The Japanese smokes Parliaments. The Norwegian lives next to the blue house.",
      hint: "Start by placing the Norwegian in house #1, and work through the clues methodically",
      answer: "Japanese",
      options: JSON.stringify(["Norwegian", "Ukrainian", "Englishman", "Japanese", "Spaniard"]),
    },
    {
      title: "Visual Pattern Recognition",
      description: "Identify the pattern and select the missing element",
      category: "puzzle",
      type: "puzzle",
      difficulty: "Medium",
      points: 125,
      estimated_time: 6,
      question: "Which figure completes the pattern?",
      content:
        "A set of shapes is arranged in a 3x3 grid, with each row and column following specific rules of rotation and transformation. The bottom right shape is missing.",
      options: JSON.stringify([
        "Circle with two dots",
        "Square with diagonal line",
        "Triangle pointing up",
        "Pentagon with dot in center",
      ]),
      hint: "Look at how shapes transform across rows and columns",
      answer: "Triangle pointing up",
    },
    {
      title: "Famous Brain Teaser",
      description: "Solve this classic brain teaser that has stumped many",
      category: "riddle",
      type: "riddle",
      difficulty: "Hard",
      points: 150,
      estimated_time: 8,
      question:
        "A man is looking at a photograph and says, 'Brothers and sisters I have none, but this man's father is my father's son.' Who is in the photograph?",
      content: "Think about family relationships carefully.",
      hint: "Draw out the family tree to visualize the relationship",
      answer: "his son",
    },
  ]

  // Insert challenges if they don't exist
  const { data: existingChallenges } = await supabase.from("challenges").select("id").limit(1)

  if (!existingChallenges || existingChallenges.length === 0) {
    const { error: insertError } = await supabase.from("challenges").insert(challenges)

    if (insertError) console.error("Error inserting sample challenges:", insertError)
    else console.log("Sample challenges inserted successfully")
  } else {
    console.log("Challenges already exist, skipping sample data insertion")
  }

  // Insert sample achievements
  const achievements = [
    {
      name: "First Steps",
      description: "Complete your first challenge",
      icon: "trophy",
      category: "progress",
      points: 10,
    },
    {
      name: "Brain Starter",
      description: "Complete 5 challenges",
      icon: "brain",
      category: "progress",
      points: 25,
    },
    {
      name: "Mind Master",
      description: "Complete 25 challenges",
      icon: "award",
      category: "progress",
      points: 100,
    },
    {
      name: "Streak Beginner",
      description: "Maintain a 3-day streak",
      icon: "flame",
      category: "streak",
      points: 15,
    },
    {
      name: "Streak Enthusiast",
      description: "Maintain a 7-day streak",
      icon: "flame",
      category: "streak",
      points: 50,
    },
    {
      name: "Streak Master",
      description: "Maintain a 30-day streak",
      icon: "flame",
      category: "streak",
      points: 200,
    },
    {
      name: "Logic Novice",
      description: "Complete 3 logic challenges",
      icon: "puzzle",
      category: "category",
      points: 20,
    },
    {
      name: "Memory Whiz",
      description: "Complete 3 memory challenges",
      icon: "brain",
      category: "category",
      points: 20,
    },
    {
      name: "Riddle Solver",
      description: "Complete 3 riddle challenges",
      icon: "lightbulb",
      category: "category",
      points: 20,
    },
    {
      name: "Puzzle Master",
      description: "Complete 3 puzzle challenges",
      icon: "puzzle-piece",
      category: "category",
      points: 20,
    },
  ]

  // Insert achievements if they don't exist
  const { data: existingAchievements } = await supabase.from("achievements").select("id").limit(1)

  if (!existingAchievements || existingAchievements.length === 0) {
    const { error: insertError } = await supabase.from("achievements").insert(achievements)

    if (insertError) console.error("Error inserting sample achievements:", insertError)
    else console.log("Sample achievements inserted successfully")
  } else {
    console.log("Achievements already exist, skipping sample data insertion")
  }

  // Set up RLS (Row Level Security) policies
  // These policies control who can access what data

  // Profiles table policies
  const profilesPolicies = [
    {
      name: "Users can view their own profile",
      definition: `
        CREATE POLICY view_own_profile ON profiles
        FOR SELECT USING (auth.uid() = id);
      `,
    },
    {
      name: "Users can update their own profile",
      definition: `
        CREATE POLICY update_own_profile ON profiles
        FOR UPDATE USING (auth.uid() = id);
      `,
    },
    {
      name: "Users can insert their own profile",
      definition: `
        CREATE POLICY insert_own_profile ON profiles
        FOR INSERT WITH CHECK (auth.uid() = id);
      `,
    },
  ]

  for (const policy of profilesPolicies) {
    const { error } = await supabase.query(policy.definition)
    if (error) console.error(`Error creating policy "${policy.name}":`, error)
    else console.log(`Policy "${policy.name}" created successfully`)
  }

  // User challenges policies
  const userChallengesPolicies = [
    {
      name: "Users can view their own challenge progress",
      definition: `
        CREATE POLICY view_own_challenges ON user_challenges
        FOR SELECT USING (auth.uid() = user_id);
      `,
    },
    {
      name: "Users can update their own challenge progress",
      definition: `
        CREATE POLICY update_own_challenges ON user_challenges
        FOR UPDATE USING (auth.uid() = user_id);
      `,
    },
    {
      name: "Users can insert their own challenge progress",
      definition: `
        CREATE POLICY insert_own_challenges ON user_challenges
        FOR INSERT WITH CHECK (auth.uid() = user_id);
      `,
    },
  ]

  for (const policy of userChallengesPolicies) {
    const { error } = await supabase.query(policy.definition)
    if (error) console.error(`Error creating policy "${policy.name}":`, error)
    else console.log(`Policy "${policy.name}" created successfully`)
  }

  // User achievements policies
  const userAchievementsPolicies = [
    {
      name: "Users can view their own achievements",
      definition: `
        CREATE POLICY view_own_achievements ON user_achievements
        FOR SELECT USING (auth.uid() = user_id);
      `,
    },
    {
      name: "Users can insert their own achievements",
      definition: `
        CREATE POLICY insert_own_achievements ON user_achievements
        FOR INSERT WITH CHECK (auth.uid() = user_id);
      `,
    },
  ]

  for (const policy of userAchievementsPolicies) {
    const { error } = await supabase.query(policy.definition)
    if (error) console.error(`Error creating policy "${policy.name}":`, error)
    else console.log(`Policy "${policy.name}" created successfully`)
  }

  // Streak logs policies
  const streakLogsPolicies = [
    {
      name: "Users can view their own streak logs",
      definition: `
        CREATE POLICY view_own_streak_logs ON streak_logs
        FOR SELECT USING (auth.uid() = user_id);
      `,
    },
    {
      name: "Users can insert their own streak logs",
      definition: `
        CREATE POLICY insert_own_streak_logs ON streak_logs
        FOR INSERT WITH CHECK (auth.uid() = user_id);
      `,
    },
  ]

  for (const policy of streakLogsPolicies) {
    const { error } = await supabase.query(policy.definition)
    if (error) console.error(`Error creating policy "${policy.name}":`, error)
    else console.log(`Policy "${policy.name}" created successfully`)
  }

  // Public read access for challenges and achievements
  const publicReadPolicies = [
    {
      name: "Anyone can view challenges",
      definition: `
        CREATE POLICY public_view_challenges ON challenges
        FOR SELECT USING (true);
      `,
    },
    {
      name: "Anyone can view achievements",
      definition: `
        CREATE POLICY public_view_achievements ON achievements
        FOR SELECT USING (true);
      `,
    },
  ]

  for (const policy of publicReadPolicies) {
    const { error } = await supabase.query(policy.definition)
    if (error) console.error(`Error creating policy "${policy.name}":`, error)
    else console.log(`Policy "${policy.name}" created successfully`)
  }

  // Enable RLS on all tables
  const enableRLS = [
    "ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;",
    "ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;",
    "ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;",
    "ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;",
    "ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;",
    "ALTER TABLE streak_logs ENABLE ROW LEVEL SECURITY;",
  ]

  for (const sql of enableRLS) {
    const { error } = await supabase.query(sql)
    if (error) console.error("Error enabling RLS:", error)
    else console.log("RLS enabled successfully")
  }

  console.log("Database setup completed!")
}

setupDatabase().catch((error) => {
  console.error("Error setting up database:", error)
})

