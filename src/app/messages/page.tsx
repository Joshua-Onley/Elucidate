'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, MessageSquare } from 'lucide-react'

interface Message {
  id: number
  senderId: string
  senderName: string
  senderAvatar: string
  content: string
  timestamp: string
}

interface Conversation {
  id: number
  participantName: string
  participantAvatar: string
  messages: Message[]
}


export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)

  useEffect(() => {
      const fetchCurrentUser = async () => {
        try {
          const response = await fetch('/api/users/fetchCurrentUser');
          if (!response.ok) {
            throw new Error('Failed to fetch current user');
          }
          const data = await response.json();
          setCurrentUserId(data.userId);
        } catch (error) {
          console.error('Error fetching current user:', error);
        }
      };
  
      fetchCurrentUser();
    }, [])



  useEffect(() => {

    if (!currentUserId) {
        return;
    }

    const fetchConversations = async () => {
        try {
            const response = await fetch(`/api/messages/getConversations?userId=${currentUserId}`);
            if (!response.ok) {
                throw new Error('failed to find conversations')
            }
            const data = await response.json();
            setConversations(data);

        } catch (error) {
            console.error('error fetching conversations', error)

        } finally {
            setLoading(false);
        }
    }

    fetchConversations()
  }, [currentUserId])

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConversation) {
      const updatedConversation = {
        ...selectedConversation,
        messages: [
          ...selectedConversation.messages,
          {
            id: Date.now().toString(),
            senderId: '2',
            senderName: 'You',
            senderAvatar: '/placeholder.svg?height=40&width=40',
            content: newMessage,
            timestamp: new Date().toISOString(),
          }
        ]
      }
      setSelectedConversation(updatedConversation)
      setConversations(conversations.map(conv => 
        conv.id === updatedConversation.id ? updatedConversation : conv
      ))
      setNewMessage('')
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">Loading messages...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-6xl bg-white/90 backdrop-blur-md shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-3xl font-extrabold text-center text-gray-900">Messages</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[600px]">
          {/* Conversation List */}
          <div className="w-1/3 border-r border-gray-200 pr-4">
            <ScrollArea className="h-full">
              {conversations.map(conversation => (
                <Card 
                  key={conversation.id} 
                  className={`mb-2 cursor-pointer transition-colors ${selectedConversation?.id === conversation.id ? 'bg-purple-100' : 'hover:bg-purple-50'}`}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <CardContent className="flex items-center p-4">
                    <Avatar className="h-10 w-10 mr-4">
                      <AvatarImage src={conversation.participantAvatar} alt={conversation.participantName} />
                      <AvatarFallback>{conversation.participantName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900">{conversation.participantName}</h3>
                      <p className="text-sm text-gray-500 truncate">
                        {conversation.messages[conversation.messages.length - 1].content}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </ScrollArea>
          </div>

          {/* Message Thread */}
          <div className="flex-1 flex flex-col pl-4">
            {selectedConversation ? (
              <>
                <div className="bg-purple-100 p-4 rounded-t-lg">
                  <h2 className="text-xl font-semibold text-gray-900">{selectedConversation.participantName}</h2>
                </div>
                <ScrollArea className="flex-1 p-4">
                  {selectedConversation.messages.map(message => (
                    <div key={message.id} className={`flex mb-4 ${message.senderId === '2' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex items-end ${message.senderId === '2' ? 'flex-row-reverse' : ''}`}>
                        <Avatar className="h-8 w-8 mx-2">
                          <AvatarImage src={message.senderAvatar} alt={message.senderName} />
                          <AvatarFallback>{message.senderName[0]}</AvatarFallback>
                        </Avatar>
                        <div className={`px-4 py-2 rounded-lg ${message.senderId === '2' ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-900'}`}>
                          {message.content}
                        </div>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
                <div className="p-4 bg-purple-100 rounded-b-lg">
                  <div className="flex">
                    <Input
                      type="text"
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1 mr-2 border-purple-300 focus:border-purple-500 focus:ring-purple-500"
                    />
                    <Button onClick={handleSendMessage} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-purple-500" />
                  <p>Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

