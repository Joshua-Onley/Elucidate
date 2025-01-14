'use client';
import React from 'react'
import Matches from '@/app/components/Matches';


export default function MatchesPage() {
    


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-8 flex flex-col items-center justify-center">
        <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white">Matches</h1>
        
      </header>
            <Matches />
    </div>
  )
}


