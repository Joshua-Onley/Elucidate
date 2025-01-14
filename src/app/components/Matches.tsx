'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Match {
  match_id: number
  name: string
  photo: string
}

export default function MatchesComponent() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)

  // Fetch the current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/users/fetchCurrentUser')
        if (!response.ok) {
          throw new Error('Failed to fetch current user')
        }
        const data = await response.json()
        setCurrentUserId(data.userId)
      } catch (error) {
        console.error('Error fetching current user:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCurrentUser()
  }, [])

  // Fetch matches for the current user
  useEffect(() => {
    if (!currentUserId) return

    const fetchMatches = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/matches/fetchMatches?userId=${currentUserId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch matches')
        }
        const data = await response.json()
        console.log(data)
        setMatches(data)
      } catch (error) {
        console.error('Error fetching matches:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMatches()
  }, [currentUserId])

  if (loading) {
    return <div className="text-center mt-8">Loading matches...</div>
  }

  if (!currentUserId) {
    return <div className="text-center mt-8">No user logged in</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
      {matches.map(match => (
        <Card key={match.match_id}>
          <CardHeader>
            <CardTitle>{match.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Avatar className="w-24 h-24 mb-4">
              <AvatarImage src={match.photo} alt={match.name} />
              <AvatarFallback>{match.name[0]}</AvatarFallback>
            </Avatar>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
