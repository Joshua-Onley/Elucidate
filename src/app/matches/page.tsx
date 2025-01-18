"use client";

import React from "react";
import Matches from "@/app/components/Matches";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function MatchesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      <Card className="w-full max-w-6xl bg-white/90 backdrop-blur-md shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-3xl font-extrabold text-center text-gray-900 flex items-center justify-center">
            <Users className="w-8 h-8 mr-2 text-purple-600" />
            Your Matches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Matches />
        </CardContent>
      </Card>
    </div>
  );
}
