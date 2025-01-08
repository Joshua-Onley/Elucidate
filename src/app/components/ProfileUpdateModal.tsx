'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from 'lucide-react'

interface ProfileUpdateModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (profileData: ProfileData) => void
  initialData: ProfileData
}

interface ProfileData {
  name: string
  photo: string
  questions: Array<{
    question: string
    options: string[]
    correctAnswer: number
  }>
}

export function ProfileUpdateModal({ isOpen, onClose, onSave, initialData }: ProfileUpdateModalProps) {
  const [profileData, setProfileData] = useState<ProfileData>(initialData)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index?: number) => {
    const { name, value } = e.target
    if (index !== undefined && name.startsWith('question')) {
      const newQuestions = [...profileData.questions]
      newQuestions[index] = { ...newQuestions[index], [name.split('.')[1]]: value }
      setProfileData({ ...profileData, questions: newQuestions })
    } else {
      setProfileData({ ...profileData, [name]: value })
    }
  }

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...profileData.questions]
    newQuestions[questionIndex].options[optionIndex] = value
    setProfileData({ ...profileData, questions: newQuestions })
  }

  const handleCorrectAnswerChange = (questionIndex: number, value: number) => {
    const newQuestions = [...profileData.questions]
    newQuestions[questionIndex].correctAnswer = value
    setProfileData({ ...profileData, questions: newQuestions })
  }

  const handleSave = () => {
    onSave(profileData)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Update Profile</h2>
              <Button variant="ghost" onClick={onClose} aria-label="Close">
                <X className="h-6 w-6" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={profileData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="photo">Photo URL</Label>
                <Input
                  id="photo"
                  name="photo"
                  value={profileData.photo}
                  onChange={handleInputChange}
                />
              </div>
              {profileData.questions.map((question, index) => (
                <div key={index} className="space-y-2">
                  <Label htmlFor={`question-${index}`}>Question {index + 1}</Label>
                  <Input
                    id={`question-${index}`}
                    name={`question.question`}
                    value={question.question}
                    onChange={(e) => handleInputChange(e, index)}
                  />
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center space-x-2">
                      <Input
                        value={option}
                        onChange={(e) => handleOptionChange(index, optionIndex, e.target.value)}
                        placeholder={`Option ${optionIndex + 1}`}
                      />
                      <input
                        type="radio"
                        name={`correctAnswer-${index}`}
                        checked={question.correctAnswer === optionIndex}
                        onChange={() => handleCorrectAnswerChange(index, optionIndex)}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

