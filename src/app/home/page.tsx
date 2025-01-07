'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProfileUpdateModal } from '@/app/components/ProfileUpdateModal'

const mockUsers = [
  {
    id: 1,
    name: 'Alice',
    age: 28,
    photo: '/placeholder.svg?height=600&width=400',
    questions: [
      {
        question: 'What\'s my favorite season?',
        options: ['Spring', 'Summer', 'Autumn', 'Winter'],
        correctAnswer: 1
      },
      {
        question: 'Which cuisine do I love the most?',
        options: ['Italian', 'Japanese', 'Mexican', 'Indian'],
        correctAnswer: 2
      },
      {
        question: 'What\'s my ideal weekend activity?',
        options: ['Hiking', 'Movie Marathon', 'Cooking', 'Dancing'],
        correctAnswer: 0
      }
    ]
  },
  {
    id: 2,
    name: 'Bob',
    age: 32,
    photo: '/placeholder.svg?height=600&width=400',
    questions: [
      {
        question: 'What\'s my dream vacation destination?',
        options: ['Beach Resort', 'Mountain Retreat', 'European City Tour', 'African Safari'],
        correctAnswer: 3
      },
      {
        question: 'Which sport do I play regularly?',
        options: ['Tennis', 'Basketball', 'Soccer', 'Swimming'],
        correctAnswer: 1
      },
      {
        question: 'What\'s my go-to drink?',
        options: ['Coffee', 'Green Tea', 'Smoothie', 'Craft Beer'],
        correctAnswer: 2
      }
    ]
  }
]

export default function HomePage() {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(mockUsers[0]) // Assume the first user is the current user

  const handleProfileUpdate = (updatedProfile: any) => {
    setCurrentUser(prevUser => ({
      ...prevUser,
      ...updatedProfile,
    }))
    // In a real app, you would send this data to your backend here
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white">Elucidate</h1>
          <p className="text-xl text-white mt-2">Unblur your perfect match</p>
        </div>
        <Button 
          onClick={() => setIsProfileModalOpen(true)}
          className="bg-white text-purple-600 hover:bg-purple-100"
        >
          Update Profile
        </Button>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {mockUsers.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
      <ProfileUpdateModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={handleProfileUpdate}
        initialData={currentUser}
      />
    </div>
  )
}

function UserCard({ user }: { user: any }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answeredQuestions, setAnsweredQuestions] = useState(0)
  const [attempts, setAttempts] = useState(0)


  const handleAnswer = (optionIndex: number) => {

    if (attempts >= 3) {
      return;
    }


    if (user.questions[currentQuestionIndex].correctAnswer === optionIndex) {
      setAnsweredQuestions(prev => Math.min(prev + 1, 3))
    }
    setCurrentQuestionIndex(prev => (prev + 1) % user.questions.length)
    setAttempts(prev => prev + 1)
  }

  const blurAmount = 20 - (answeredQuestions * 6) // Decrease blur as questions are answered correctly

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
            <p className="text-white font-semibold">{user.name}, {user.age}</p>
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
              <p className="font-semibold mb-2">{user.questions[currentQuestionIndex].question}</p>
              <div className="grid grid-cols-2 gap-2">
                {user.questions[currentQuestionIndex].options.map((option: string, oIndex: number) => (
                  <Button
                    key={oIndex}
                    variant="outline"
                    className="text-sm"
                    onClick={() => handleAnswer(oIndex)}
                  >
                    {option}
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
  )
}

