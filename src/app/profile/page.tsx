
'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Sparkles } from 'lucide-react'

export default function ProfileSetup() {
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0])
      setPhotoPreview(URL.createObjectURL(e.target.files[0]))
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // TODO: Implement form submission logic
    console.log('Form submitted')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-2xl bg-white/90 backdrop-blur-md shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-3xl font-extrabold text-center text-gray-900">Set Up Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="photo" className="block text-lg font-medium text-gray-700">Profile Photo</Label>
              <div className="flex items-center space-x-4">
                <Avatar className="w-32 h-32 border-4 border-purple-500 shadow-lg">
                  <AvatarImage src={photoPreview || '/placeholder.svg'} alt="Profile photo preview" />
                  <AvatarFallback className="bg-purple-100 text-purple-600 text-2xl font-bold">
                    {photoPreview ? <Camera className="w-8 h-8" /> : 'UP'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Input 
                    id="photo" 
                    type="file" 
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <Label htmlFor="photo" className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                    <Camera className="w-5 h-5 mr-2" />
                    Upload Photo
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-lg font-medium text-gray-700">Name</Label>
              <Input id="name" placeholder="Your full name" required className="border-purple-300 focus:border-purple-500 focus:ring-purple-500" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-lg font-medium text-gray-700">Email</Label>
              <Input id="email" type="email" placeholder="your@email.com" required className="border-purple-300 focus:border-purple-500 focus:ring-purple-500" />
            </div>

            {[1, 2, 3].map((questionNumber) => (
              <div key={questionNumber} className="space-y-2 p-4 bg-purple-50 rounded-lg">
                <Label htmlFor={`question${questionNumber}`} className="text-lg font-medium text-gray-700">Question {questionNumber}</Label>
                <Textarea 
                  id={`question${questionNumber}`} 
                  placeholder={`Enter your question ${questionNumber}`}
                  required
                  className="border-purple-300 focus:border-purple-500 focus:ring-purple-500"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Correct answer" required className="border-green-300 focus:border-green-500 focus:ring-green-500" />
                  <Input placeholder="Wrong answer 1" required className="border-red-300 focus:border-red-500 focus:ring-red-500" />
                  <Input placeholder="Wrong answer 2" required className="border-red-300 focus:border-red-500 focus:ring-red-500" />
                  <Input placeholder="Wrong answer 3" required className="border-red-300 focus:border-red-500 focus:ring-red-500" />
                </div>
              </div>
            ))}

            <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
              <Sparkles className="w-5 h-5 mr-2" />
              Create Your Elucidate Profile
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

