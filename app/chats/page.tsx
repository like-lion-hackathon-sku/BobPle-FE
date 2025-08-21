"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, MessageCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import ChatList from "@/components/chat-list"

export default function ChatsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <h1 className="text-xl font-semibold">채팅</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <ChatList />
      </div>
    </div>
  )
}
