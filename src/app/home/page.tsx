"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ThumbsUp,
  ThumbsDown,
  LogOut,
  Heart,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";

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

export interface CurrentUser {
  id: number;
}

export default function HomePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch the current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/users/fetchCurrentUser");
        const data = await response.json();
        setCurrentUser({ id: data.userId as number });
      } catch (error) {
        console.error("Error fetching user from session:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      if (!currentUser) return;

      try {
        const response = await fetch("/api/users/fetchUsers", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${currentUser.id}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };

    if (currentUser) fetchUsers();
  }, [currentUser]);

  // Remove current user and move to next
  const moveToNextUser = () => {
    setUsers((prevUsers) => {
      const updatedUsers = prevUsers.filter(
        (_, index) => index !== currentUserIndex,
      );
      setCurrentUserIndex((prevIndex) =>
        updatedUsers.length > 0 ? prevIndex % updatedUsers.length : 0,
      );
      return updatedUsers;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-4 sm:p-8 flex flex-col items-center">
      <nav className="self-end mb-8 flex items-center space-x-4">
        <Link href="/matches" passHref>
          <Button
            variant="ghost"
            className="text-white hover:bg-white hover:bg-opacity-20"
          >
            <Heart className="w-5 h-5 mr-2" />
            Matches
          </Button>
        </Link>
        <Link href="/messages" passHref>
          <Button
            variant="ghost"
            className="text-white hover:bg-white hover:bg-opacity-20"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Messages
          </Button>
        </Link>
        <Button
          variant="ghost"
          className="text-white hover:bg-white hover:bg-opacity-20"
          onClick={async () => {
            try {
              const response = await fetch("/api/users/deleteSession", {
                method: "POST",
              });
              if (!response.ok) {
                throw new Error("Logout failed");
              }
              window.location.href = "/";
            } catch (error) {
              console.error("Error during logout:", error);
            }
          }}
        >
          <LogOut className="w-5 h-5 mr-2" />
          Logout
        </Button>
      </nav>
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white">Elucidate</h1>
        <p className="text-xl text-white mt-2">Unblur your perfect match</p>
      </header>
      <div className="w-full max-w-md mx-auto">
        {users.length > 0 ? (
          <UserCard
            key={users[currentUserIndex].id}
            user={users[currentUserIndex]}
            onComplete={moveToNextUser}
            currentUser={currentUser}
          />
        ) : (
          <div className="text-white text-xl">
            <p className="text-center">
              No more profiles available that match your preferences. Please
              check back later!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function UserCard({
  user,
  onComplete,
  currentUser,
}: {
  user: User;
  onComplete: () => void;
  currentUser: CurrentUser | null;
}) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState<Option[]>([]);
  const [showRatingButtons, setShowRatingButtons] = useState(false);
  const [ratingAnimation, setRatingAnimation] = useState<
    "like" | "dislike" | null
  >(null);

  useEffect(() => {
    const shuffleOptions = (options: Option[]) => {
      const shuffled = [...options];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    const currentQuestion = user.questions[currentQuestionIndex];
    setShuffledOptions(shuffleOptions(currentQuestion.options));
  }, [currentQuestionIndex, user.questions]);

  useEffect(() => {
    if (attempts >= 3) setShowRatingButtons(true);
  }, [attempts]);

  const handleAnswer = (selectedOption: Option) => {
    if (attempts >= 3) return;

    const currentQuestion = user.questions[currentQuestionIndex];
    if (selectedOption.option === currentQuestion.correctAnswer) {
      setAnsweredQuestions((prev) => Math.min(prev + 1, 3));
    }
    setCurrentQuestionIndex((prev) => (prev + 1) % user.questions.length);
    setAttempts((prev) => prev + 1);
  };

  const handleRating = async (rating: "like" | "dislike") => {
    setRatingAnimation(rating);

    try {
      // Record the current user's like/dislike action
      const response = await fetch(`/api/users/${rating}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ likerId: currentUser?.id, likedId: user.id }),
      });

      if (!response.ok) {
        throw new Error(`Failed to record ${rating}`);
      }

      // If the action is a 'like', check for a mutual match
      if (rating === "like") {
        const mutualMatchResponse = await fetch("/api/matches/checkForMatch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ likerId: currentUser?.id, likedId: user.id }),
        });

        if (!mutualMatchResponse.ok) {
          throw new Error("Failed to check for mutual match");
        }

        const { isMutualMatch } = await mutualMatchResponse.json();

        // If it's a mutual match, send a default message
        if (isMutualMatch) {
          await fetch("/api/matches/defaultMessage", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              senderId: currentUser?.id,
              receiverId: user.id,
              messageText:
                "Hi! We have a match! Let's start chatting! (Automatic message)",
            }),
          });
        }
      }
    } catch (error) {
      console.error(`Error handling ${rating}:`, error);
    } finally {
      // Reset animation and complete action
      setTimeout(() => {
        setRatingAnimation(null);
        onComplete();
      }, 1000);
    }
  };

  const blurAmount = answeredQuestions === 3 ? 0 : 20 - answeredQuestions * 6;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-white bg-opacity-90 overflow-hidden relative">
        {ratingAnimation && (
          <motion.div
            className={`absolute inset-0 ${ratingAnimation === "like" ? "bg-green-500" : "bg-red-500"}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
          />
        )}
        <CardHeader className="relative h-96 mb-4">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${user.photo})`,
              filter: `blur(${blurAmount}px)`,
            }}
          />
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
                <p className="font-semibold mb-2">
                  {user.questions[currentQuestionIndex].question}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {shuffledOptions.map((option) => (
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
                  onClick={() => handleRating("dislike")}
                >
                  <ThumbsDown className="w-6 h-6" />
                </Button>
                <Button
                  variant="outline"
                  className="text-green-500 hover:bg-green-100"
                  onClick={() => handleRating("like")}
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
              : `Answer correctly to unblur the photo! (${answeredQuestions}/3)`}
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
