"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Sparkles } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface FormValues {
  name: string;
  age: number;
  gender: "male" | "female";
  showUserProfileTo: "male" | "female";
  showToUser: "male" | "female";
  questions: Array<{
    question: string;
    options: string[];
    correctAnswer: string;
  }>;
}

interface CurrentUser {
  id: number;
}

export default function ProfileSetup() {
  const router = useRouter();
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<FormValues>({
    name: "",
    age: 18, 
    gender: "male", 
    showUserProfileTo: "male", 
    showToUser: "male", 
    questions: Array(3)
      .fill(null)
      .map(() => ({
        question: "",
        options: ["", "", "", ""],
        correctAnswer: "0",
      })),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [file, setFile] = useState<File>();

  useEffect(() => {
    
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/users/fetchCurrentUser"); 
        const data = await response.json();
        setCurrentUser({ id: data.userId as number }); 
      } catch (error) {
        console.error("Error fetching user from session", error);
      }
    };

    fetchUser();
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
      setFile(e.target.files[0]);
      setPhotoPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index?: number,
    optionIndex?: number,
  ) => {
    const { id, value } = e.target;

    if (index !== undefined && optionIndex !== undefined) {
      const updatedQuestions = [...formValues.questions];
      updatedQuestions[index].options[optionIndex] = value;

      if (optionIndex === 0) {
        updatedQuestions[index].correctAnswer = value;
      }

      setFormValues({ ...formValues, questions: updatedQuestions });
    } else if (index !== undefined) {
      const updatedQuestions = [...formValues.questions];
      updatedQuestions[index].question = value;
      setFormValues({ ...formValues, questions: updatedQuestions });
    } else {
      setFormValues({ ...formValues, [id]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!file) return;

    if (!currentUser) {
      setError("User is not logged in.");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("id", currentUser.id.toString());
      formData.append("name", formValues.name);
      formData.append("age", formValues.age.toString());
      formData.append("gender", formValues.gender);
      formData.append("showUserProfileTo", formValues.showUserProfileTo);
      formData.append("showToUser", formValues.showToUser);
      formData.append("questions", JSON.stringify(formValues.questions));

      const response = await fetch("/api/users/profilesetup", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to set up profile");
      }

      alert("Profile setup successful!");
      router.push(`/home`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "An unknown error occurred");
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-2xl bg-white/90 backdrop-blur-md shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-3xl font-extrabold text-center text-gray-900">
            Set Up Your Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="photo"
                className="block text-lg font-medium text-gray-700"
              >
                Profile Photo
              </Label>
              <div className="flex items-center space-x-4">
                <Avatar className="w-32 h-32 border-4 border-purple-500 shadow-lg">
                  <AvatarImage
                    src={photoPreview || "/placeholder.svg"}
                    alt="Profile photo preview"
                  />
                  <AvatarFallback className="bg-purple-100 text-purple-600 text-2xl font-bold">
                    {photoPreview ? <Camera className="w-8 h-8" /> : "UP"}
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
                  <Label
                    htmlFor="photo"
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Upload Photo
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-lg font-medium text-gray-700"
              >
                Name
              </Label>
              <Input
                id="name"
                placeholder="Your full name"
                required
                className="border-purple-300 focus:border-purple-500 focus:ring-purple-500"
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="age"
                className="text-lg font-medium text-gray-700"
              >
                Age
              </Label>
              <Input
                id="age"
                type="number"
                min="18" // Assuming 18 is the minimum age
                placeholder="Your age"
                required
                className="border-purple-300 focus:border-purple-500 focus:ring-purple-500"
                value={formValues.age}
                onChange={(e) =>
                  setFormValues({
                    ...formValues,
                    age: parseInt(e.target.value, 10),
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="gender"
                className="text-lg font-medium text-gray-700"
              >
                Gender
              </Label>
              <select
                id="gender"
                className="w-full border border-purple-300 rounded-md focus:border-purple-500 focus:ring-purple-500"
                value={formValues.gender}
                onChange={(e) =>
                  setFormValues({
                    ...formValues,
                    gender: e.target.value as "male" | "female",
                  })
                }
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="showUserProfileTo"
                className="text-lg font-medium text-gray-700"
              >
                Show my profile to
              </Label>
              <select
                id="showUserProfileTo"
                className="w-full border border-purple-300 rounded-md focus:border-purple-500 focus:ring-purple-500"
                value={formValues.showUserProfileTo}
                onChange={(e) =>
                  setFormValues({
                    ...formValues,
                    showUserProfileTo: e.target.value as "male" | "female",
                  })
                }
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="showToUser"
                className="text-lg font-medium text-gray-700"
              >
                Do you want to be shown male or female profiles?
              </Label>
              <select
                id="showToUser"
                className="w-full border border-purple-300 rounded-md focus:border-purple-500 focus:ring-purple-500"
                value={formValues.showToUser}
                onChange={(e) =>
                  setFormValues({
                    ...formValues,
                    showToUser: e.target.value as "male" | "female",
                  })
                }
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            {formValues.questions.map((_, index) => (
              <div
                key={index}
                className="space-y-2 p-4 bg-purple-50 rounded-lg"
              >
                <Label
                  htmlFor={`question${index}`}
                  className="text-lg font-medium text-gray-700"
                >
                  Question {index + 1}
                </Label>
                <Textarea
                  id={`question${index}`}
                  placeholder={`Enter your question ${index + 1}`}
                  required
                  className="border-purple-300 focus:border-purple-500 focus:ring-purple-500"
                  onChange={(e) => handleInputChange(e, index)}
                />
                <div className="grid grid-cols-2 gap-2">
                  {formValues.questions[index].options.map((_, optionIndex) => (
                    <Input
                      key={optionIndex}
                      placeholder={
                        optionIndex === 0
                          ? "Correct Answer"
                          : "Incorrect Answer"
                      }
                      required
                      className={`border-purple-300 focus:border-purple-500 focus:ring-purple-500 ${
                        optionIndex === 0 ? "border-green-500" : ""
                      }`}
                      onChange={(e) => handleInputChange(e, index, optionIndex)}
                    />
                  ))}
                </div>
              </div>
            ))}

            {error && <p className="text-red-500">{error}</p>}

            <Button
              type="submit"
              disabled={loading || !formValues.name || !photo}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              {loading ? "Saving..." : "Create Your Elucidate Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
