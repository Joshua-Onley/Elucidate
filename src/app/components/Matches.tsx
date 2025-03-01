"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

interface Match {
  match_id: number;
  name: string;
  avatarUrl: string;
}

export default function Matches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch("/api/users/fetchCurrentUser");
        if (!response.ok) {
          throw new Error("Failed to fetch current user");
        }
        const data = await response.json();
        setCurrentUserId(data.userId);
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };

    fetchCurrentUser();
  }, []);


  useEffect(() => {
    if (!currentUserId) return;

    const fetchMatches = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/matches/fetchMatches?userId=${currentUserId}`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch matches");
        }
        const data = await response.json();
        setMatches(data);
      } catch (error) {
        console.error("Error fetching matches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [currentUserId]);

  const handleMessageClick = (matchId: number) => {
    router.push(`/messages?matchId=${matchId}`);
  };

  if (loading) {
    return (
      <div className="text-center mt-8 text-gray-600">Loading matches...</div>
    );
  }

  if (!currentUserId) {
    return (
      <div className="text-center mt-8 text-gray-600">No user logged in</div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center mt-8 text-gray-600">No matches found</div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {matches.map((match) => (
        <Card
          key={match.match_id}
          className="overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
        >
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <Avatar className="w-32 h-32 mb-4 border-4 border-purple-500">
                <AvatarImage src={`/${match.avatarUrl}`} alt={match.name} />
                <AvatarFallback>{match.name[0]}</AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-semibold mb-4">{match.name}</h3>
              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  className="flex items-center space-x-2 hover:bg-purple-100"
                  onClick={() => handleMessageClick(match.match_id)}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Message</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
