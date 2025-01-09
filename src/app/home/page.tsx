'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"


export interface Option {
  id: number;
  option: string;
}

interface Question {
  id: number;
  question: string;
  correctAnswer: string;
  options: Option[];
}

export interface User {
  id: number;
  name: string;
  photo: string;
  questions: Question[];
  
}
export default function HomePage() {
  const [users, setUsers] = useState<User[]>([]) // State to hold fetched users
  const [currentUser, setCurrentUser] = useState<User | null>(null) // Current user for the modal

  // Fetch users when component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users/fetchUsers') // Replace with your API endpoint
        const data = await response.json()
        console.log('Fetched Users:', data); // Debug output
        setUsers(data)
        if (data.length > 0) setCurrentUser(data[0]) // Set the first user as default
      } catch (error) {
        console.error('Failed to fetch users:', error)
      }
    }
    fetchUsers()
  }, [])


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white">Elucidate</h1>
          <p className="text-xl text-white mt-2">Unblur your perfect match</p>
        </div>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {users.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
    </div>
  )
}

function UserCard({ user }: { user: User }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answeredQuestions, setAnsweredQuestions] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [shuffledOptions, setShuffledOptions] = useState<Option[]>([])

  // Helper function to shuffle options
  const shuffleOptions = (options: Option[]) => {
    const shuffledOptions = [...options];
    for (let i = shuffledOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]]; // Swap elements
    }
    return shuffledOptions;
  };

  // Shuffle options for the current question
  useEffect(() => {
    const currentQuestion = user.questions[currentQuestionIndex];
    setShuffledOptions(shuffleOptions(currentQuestion.options));
  }, [currentQuestionIndex, user.questions]);

  // Handle answer selection
  const handleAnswer = (selectedOption: Option) => {
    if (attempts >= 3) return; // Prevent answering more than 3 times

    const currentQuestion = user.questions[currentQuestionIndex];

    // Check if the selected answer is correct
    if (selectedOption.option === currentQuestion.correctAnswer) {
      setAnsweredQuestions((prev) => Math.min(prev + 1, 3)); // Increase answered questions count, capped at 3
    }

    // Move to the next question
    setCurrentQuestionIndex((prev) => (prev + 1) % user.questions.length);
    setAttempts((prev) => prev + 1); // Track number of attempts
  };

  // Calculate blur amount based on the number of correct answers
  const blurAmount = answeredQuestions === 3 ? 0 : Math.max(0, 20 - answeredQuestions * 6); // Min blur of 0

  // Get current question
  const currentQuestion = user.questions[currentQuestionIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-white bg-opacity-90 overflow-hidden">
        <CardHeader className="relative h-96">
          <div className="absolute inset-0 bg-cover bg-center" style={{
            backgroundImage: `url(${user.photo})`,
            filter: `blur(${blurAmount}px)`,
            transform: 'scale(1.1)' // Prevent blur from showing edges
          }} />
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 px-2 py-1 rounded">
            <p className="text-white font-semibold">{user.name}</p>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <p className="font-semibold mb-2">{currentQuestion.question}</p>
              <div className="grid grid-cols-2 gap-2">
                {shuffledOptions.map((option: Option) => (
                  <Button
                    key={option.id}
                    variant="outline"
                    className="text-sm"
                    onClick={() => handleAnswer(option)}
                  >
                    {option.option}
                  </Button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </CardContent>
        <CardFooter className="bg-gray-100 p-4">
          <p className="text-sm text-gray-600">
            Answer correctly to unblur the photo! ({answeredQuestions}/3)
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}