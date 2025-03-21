import { BrainIcon, PuzzleIcon, LightbulbIcon, BookOpenIcon } from "lucide-react"

export const challenges = [
  {
    id: 1,
    title: "Word Association Puzzle",
    description: "Find the word that connects these three words",
    category: "puzzle",
    icon: PuzzleIcon,
    type: "puzzle",
    difficulty: "Medium",
    points: 100,
    estimatedTime: 5,
    question: "Find the word that connects these three words",
    content: "TENNIS • NOISE • RACKET",
    hint: "Think about sports equipment",
    answer: "racket",
  },
  {
    id: 2,
    title: "Classic Riddle",
    description: "Solve this classic riddle that tests your lateral thinking",
    category: "riddle",
    icon: LightbulbIcon,
    type: "riddle",
    difficulty: "Easy",
    points: 75,
    estimatedTime: 3,
    question: "What can you catch but not throw?",
    content: "Think about things that can be 'caught' but not physically thrown.",
    hint: "It's something that happens to you, not an object",
    answer: "cold",
  },
  {
    id: 3,
    title: "Number Sequence",
    description: "Find the next number in this logical sequence",
    category: "logic",
    icon: BrainIcon,
    type: "logic",
    difficulty: "Hard",
    points: 150,
    estimatedTime: 8,
    question: "What is the next number in this sequence?",
    content: "2, 3, 5, 9, 17, ?",
    hint: "The relationship between consecutive numbers follows a pattern",
    answer: "33",
  },
  {
    id: 4,
    title: "Memory Challenge",
    description: "Memorize and recall a sequence of symbols",
    category: "memory",
    icon: BookOpenIcon,
    type: "memory",
    difficulty: "Medium",
    points: 125,
    estimatedTime: 5,
    question: "What was the middle symbol in the second row?",
    content: ["🌟", "🔥", "🌈", "🍎", "🌊", "💎", "🚀", "🎮", "🎸"],
    hint: "Try creating a story with the symbols to help remember them",
    answer: "🌊",
  },
  {
    id: 5,
    title: "Word Ladder",
    description: "Transform one word into another by changing one letter at a time",
    category: "puzzle",
    icon: PuzzleIcon,
    type: "puzzle",
    difficulty: "Hard",
    points: 175,
    estimatedTime: 10,
    question: "Transform COLD into WARM using only valid words, changing one letter at a time",
    content: "Example: CAT → COT → DOT → DOG (changing one letter at each step)",
    hint: "There are multiple possible paths",
    answer: "cold cord word warm",
  },
  {
    id: 6,
    title: "Logic Grid Puzzle",
    description: "Use the clues to fill in a logic grid and solve the mystery",
    category: "logic",
    icon: BrainIcon,
    type: "logic",
    difficulty: "Hard",
    points: 200,
    estimatedTime: 15,
    question: "Based on the given information, who owns the zebra?",
    content:
      "Five people of different nationalities live in five consecutive houses of different colors. They own different pets, drink different beverages, and the houses are numbered 1-5 from left to right. The Englishman lives in the red house. The Spaniard owns a dog. Coffee is drunk in the green house. The Ukrainian drinks tea. The green house is immediately to the right of the ivory house. The Old Gold smoker owns snails. Kools are smoked in the yellow house. Milk is drunk in the middle house. The Norwegian lives in the first house. The man who smokes Chesterfields lives in the house next to the man with the fox. Kools are smoked in the house next to the house where the horse is kept. The Lucky Strike smoker drinks orange juice. The Japanese smokes Parliaments. The Norwegian lives next to the blue house.",
    hint: "Start by placing the Norwegian in house #1, and work through the clues methodically",
    answer: "Japanese",
  },
  {
    id: 7,
    title: "Visual Pattern Recognition",
    description: "Identify the pattern and select the missing element",
    category: "puzzle",
    icon: PuzzleIcon,
    type: "puzzle",
    difficulty: "Medium",
    points: 125,
    estimatedTime: 6,
    question: "Which figure completes the pattern?",
    content:
      "A set of shapes is arranged in a 3x3 grid, with each row and column following specific rules of rotation and transformation. The bottom right shape is missing.",
    options: [
      "Circle with two dots",
      "Square with diagonal line",
      "Triangle pointing up",
      "Pentagon with dot in center",
    ],
    hint: "Look at how shapes transform across rows and columns",
    answer: "Triangle pointing up",
  },
  {
    id: 8,
    title: "Famous Brain Teaser",
    description: "Solve this classic brain teaser that has stumped many",
    category: "riddle",
    icon: LightbulbIcon,
    type: "riddle",
    difficulty: "Hard",
    points: 150,
    estimatedTime: 8,
    question:
      "A man is looking at a photograph and says, 'Brothers and sisters I have none, but this man's father is my father's son.' Who is in the photograph?",
    content: "Think about family relationships carefully.",
    hint: "Draw out the family tree to visualize the relationship",
    answer: "his son",
  },
]

