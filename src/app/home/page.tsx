'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown } from 'lucide-react'

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
  const [users, setUsers] = useState<User[]>([])
  const [currentUserIndex, setCurrentUserIndex] = useState(0)

  useEffect(() => {
    const fetchUsers = async () => {
      // Get email from URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const email = urlParams.get('email'); // Assuming the URL has the format /home?email=user@example.com

      if (!email) {
        console.error('Email not found in URL');
        return;
      }

      try {
        const response = await fetch('/api/users/fetchUsers', {
          method: 'GET',
          headers: {
            'Authorization': email // Send current user's email in the Authorization header
          }
        })
        const data = await response.json()
        console.log('Fetched Users:', data);
        setUsers(data)
      } catch (error) {
        console.error('Failed to fetch users:', error)
      }
    }
    fetchUsers()
  }, [])

  const moveToNextUser = () => {
    setCurrentUserIndex((prevIndex) => (prevIndex + 1) % users.length)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-8 flex flex-col items-center justify-center">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white">Elucidate</h1>
        <p className="text-xl text-white mt-2">Unblur your perfect match</p>
      </header>
      <div className="w-full max-w-md">
        {users.length > 0 && (
          <UserCard key={users[currentUserIndex].id} user={users[currentUserIndex]} onComplete={moveToNextUser} />
        )}
      </div>
    </div>
  )
}

function UserCard({ user, onComplete }: { user: User, onComplete: () => void }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answeredQuestions, setAnsweredQuestions] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [shuffledOptions, setShuffledOptions] = useState<Option[]>([])
  const [showRatingButtons, setShowRatingButtons] = useState(false)
  const [ratingAnimation, setRatingAnimation] = useState<'like' | 'dislike' | null>(null)

  const shuffleOptions = (options: Option[]) => {
    const shuffledOptions = [...options];
    for (let i = shuffledOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
    }
    return shuffledOptions;
  };

  useEffect(() => {
    const currentQuestion = user.questions[currentQuestionIndex];
    setShuffledOptions(shuffleOptions(currentQuestion.options));
  }, [currentQuestionIndex, user.questions]);

  const handleAnswer = (selectedOption: Option) => {
    if (attempts >= 3) return;

    const currentQuestion = user.questions[currentQuestionIndex];

    if (selectedOption.option === currentQuestion.correctAnswer) {
      setAnsweredQuestions((prev) => Math.min(prev + 1, 3));
    }

    setCurrentQuestionIndex((prev) => (prev + 1) % user.questions.length);
    setAttempts((prev) => prev + 1);
  };

  const blurAmount = answeredQuestions === 3 ? 0 : Math.max(0, 20 - answeredQuestions * 6);

  useEffect(() => {
    if (attempts >= 3) {
      setShowRatingButtons(true);
    }
  }, [attempts]);

  
  const handleRating = async (rating: 'like' | 'dislike') => {
    setRatingAnimation(rating);

    const urlParams = new URLSearchParams(window.location.search);
    const likerEmail = urlParams.get('email')

    if (!likerEmail) {
      console.error("liker email not found in the url");
      return;
    }

    const likedId = user.id;
    console.log('likerEmail:', likerEmail, 'likedId:', likedId); // Debugging

    if (rating == 'like') {
      try {
        const response = await fetch('/api/users/like', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            likerEmail,
            likedId,
          }),
        });
        if (!response.ok) {
          throw new Error('Failed to record like/dislike');
        }
        console.log("Rating successfully recorded:", await response.json());
      } catch (error) {
        console.error("Error recording rating:", error);
      }
    } else {
      // Ensure the correct API route is used for dislikes
      try {
        const response = await fetch('/api/users/dislike', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            likerEmail,
            likedId,
          }),
        });
        if (!response.ok) {
          throw new Error('Failed to record dislike');
        }
        console.log("Dislike successfully recorded:", await response.json());
      } catch (error) {
        console.error("Error recording dislike:", error);
      }
    }

    setTimeout(() => {
      setRatingAnimation(null);
      onComplete();
    }, 1000);
  };



  const currentQuestion = user.questions[currentQuestionIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-white bg-opacity-90 overflow-hidden relative">
        {ratingAnimation && (
          <motion.div
            className={`absolute inset-0 ${ratingAnimation === 'like' ? 'bg-green-500' : 'bg-red-500'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
          />
        )}
        <CardHeader className="relative h-96 mb-4">
          <div className="absolute inset-0 bg-cover bg-center" style={{
            backgroundImage: `url(${user.photo})`,
            filter: `blur(${blurAmount}px)`,
            transform: 'scale(1.1)'
          }} />
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 px-2 py-1 rounded">
            <p className="text-white font-semibold">{user.name}</p>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <AnimatePresence mode="wait">
            {!showRatingButtons ? (
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
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex justify-between"
              >
                <Button
                  variant="outline"
                  className="text-red-500 hover:bg-red-100"
                  onClick={() => handleRating('dislike')}
                >
                  <ThumbsDown className="w-6 h-6" />
                </Button>
                <Button
                  variant="outline"
                  className="text-green-500 hover:bg-green-100"
                  onClick={() => handleRating('like')}
                >
                  <ThumbsUp className="w-6 h-6" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
        <CardFooter className="bg-gray-100 p-4">
          <p className="text-sm text-gray-600">
            {showRatingButtons
              ? "Rate this profile!"
              : `Answer correctly to unblur the photo! (${answeredQuestions}/3)`
            }
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

