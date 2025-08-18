"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, Send, MoreVertical, UserMinus, Flag, Info, AlertTriangle } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { ChatTimer } from "@/components/chat-timer"
import { useNotifications } from "@/components/notification-context"

// 채팅방 목 데이터 - 실제로는 GET /api/chats/{chatId} API 호출로 대체
const mockChatData = {
  id: 1,
  eventTitle: "강남역 맛집 탐방", // 밥약 제목
  eventDate: "2024-01-20 19:00", // 밥약 날짜 및 시간
  eventEndTime: "2025-12-31 23:59", // 채팅방 종료 시간 (미래 날짜로 설정하여 활성 상태 유지)
  isExpired: false, // 채팅방 만료 상태
  participants: [
    {
      id: 1,
      name: "김민수",
      avatar: "/placeholder.svg?height=32&width=32",
      isHost: true, // 호스트 여부
      isOnline: true, // 온라인 상태
    },
    {
      id: 2,
      name: "이지은",
      avatar: "/placeholder.svg?height=32&width=32",
      isHost: false,
      isOnline: true,
    },
    {
      id: 3,
      name: "박준호",
      avatar: "/placeholder.svg?height=32&width=32",
      isHost: false,
      isOnline: false,
    },
  ],
  messages: [
    {
      id: 1,
      userId: 1,
      userName: "김민수",
      userAvatar: "/placeholder.svg?height=32&width=32",
      content: "안녕하세요! 내일 저녁 7시에 강남역 2번 출구에서 만나요.",
      timestamp: "2024-01-19 15:30",
      isSystem: false, // 시스템 메시지 여부
    },
    {
      id: 2,
      userId: 2,
      userName: "이지은",
      userAvatar: "/placeholder.svg?height=32&width=32",
      content: "네! 기대되네요. 혹시 레스토랑 예약은 하셨나요?",
      timestamp: "2024-01-19 15:35",
      isSystem: false,
    },
    {
      id: 3,
      userId: 1,
      userName: "김민수",
      userAvatar: "/placeholder.svg?height=32&width=32",
      content: "네, 4명으로 예약했어요. 박준호님도 참여 확정이시죠?",
      timestamp: "2024-01-19 15:40",
      isSystem: false,
    },
    {
      id: 4,
      userId: 3,
      userName: "박준호",
      userAvatar: "/placeholder.svg?height=32&width=32",
      content: "네! 정말 기대됩니다. 이탈리안 음식 정말 좋아해요.",
      timestamp: "2024-01-19 16:00",
      isSystem: false,
    },
    {
      id: 5,
      userId: 0, // 시스템 메시지는 userId 0
      userName: "System",
      userAvatar: "",
      content: "새로운 참여자가 채팅방에 입장했습니다.",
      timestamp: "2024-01-19 16:30",
      isSystem: true,
    },
  ],
}

/**
 * 채팅 페이지 컴포넌트
 * 특정 밥약의 채팅방에서 실시간 메시지를 주고받을 수 있는 기능을 제공
 */
export default function ChatPage() {
  const router = useRouter() // 페이지 라우팅을 위한 Next.js 라우터
  const params = useParams() // URL 파라미터 접근 (chatId)
  const { addNotification } = useNotifications() // 알림 추가 함수
  const [chatData, setChatData] = useState(mockChatData) // 채팅방 데이터 상태
  const [newMessage, setNewMessage] = useState("") // 새 메시지 입력 상태
  const [isSending, setIsSending] = useState(false) // 메시지 전송 중 상태
  const [showParticipants, setShowParticipants] = useState(false) // 참여자 목록 다이얼로그 표시 여부
  const messagesEndRef = useRef<HTMLDivElement>(null) // 메시지 목록 하단 참조 (자동 스크롤용)
  const currentUserId = 2 // 현재 사용자 ID (목 데이터)

  /**
   * 메시지 목록을 맨 아래로 스크롤하는 함수
   * 새 메시지가 추가될 때마다 자동으로 스크롤
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // 메시지가 업데이트될 때마다 자동 스크롤
  useEffect(() => {
    scrollToBottom()
  }, [chatData.messages])

  /**
   * 채팅방 만료 처리 함수
   * 밥약 종료 시간이 되면 호출되어 채팅방을 비활성화하고 리뷰 작성 알림을 발송
   */
  const handleChatExpired = () => {
    setChatData((prev) => ({ ...prev, isExpired: true }))

    // 채팅방 종료 시스템 메시지 추가
    const systemMessage = {
      id: Date.now(),
      userId: 0,
      userName: "System",
      userAvatar: "",
      content: "밥약 시간이 종료되어 채팅방이 곧 삭제됩니다. 함께한 참여자들에 대한 리뷰를 작성해주세요.",
      timestamp: new Date().toISOString(),
      isSystem: true,
    }

    setChatData((prev) => ({
      ...prev,
      messages: [...prev.messages, systemMessage],
    }))

    // 모든 참여자에게 리뷰 작성 알림 발송
    addNotification({
      type: "review_request",
      title: "리뷰 작성 요청",
      message: `${chatData.eventTitle} 밥약이 종료되었습니다. 함께한 참여자들에 대한 리뷰를 작성해주세요.`,
      actionData: {
        eventId: chatData.id.toString(),
      },
    })

    // 30초 후 자동으로 홈페이지로 이동
    setTimeout(() => {
      router.push("/")
    }, 30000)
  }

  /**
   * 새 메시지 전송 처리 함수
   * 폼 제출 시 호출되어 새 메시지를 채팅방에 추가
   */
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isSending || chatData.isExpired) return

    setIsSending(true)
    try {
      // Mock API 호출 - 실제로는 POST /api/chats/{chatId} 엔드포인트 호출
      const message = {
        id: Date.now(),
        userId: currentUserId,
        userName: "이지은", // 현재 사용자 이름
        userAvatar: "/placeholder.svg?height=32&width=32",
        content: newMessage,
        timestamp: new Date().toISOString(),
        isSystem: false,
      }

      // 메시지 목록에 새 메시지 추가
      setChatData((prev) => ({
        ...prev,
        messages: [...prev.messages, message],
      }))
      setNewMessage("")
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setIsSending(false)
    }
  }

  /**
   * 채팅방 나가기 처리 함수
   * 사용자가 채팅방을 떠날 때 호출
   */
  const handleLeaveChat = async () => {
    try {
      // Mock API 호출 - 실제로는 PATCH /api/chats/{chatId} 엔드포인트 호출
      console.log("Leaving chat:", params.chatId)
      await new Promise((resolve) => setTimeout(resolve, 500))
      router.push("/")
    } catch (error) {
      console.error("Failed to leave chat:", error)
    }
  }

  /**
   * 시간 포맷팅 함수 (시:분 형태)
   * @param timestamp ISO 형태의 타임스탬프
   * @returns 한국어 시간 형식 문자열
   */
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  /**
   * 날짜 포맷팅 함수 (월 일 요일 형태)
   * @param timestamp ISO 형태의 타임스탬프
   * @returns 한국어 날짜 형식 문자열
   */
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("ko-KR", {
      month: "long",
      day: "numeric",
      weekday: "short",
    })
  }

  // 채팅방이 만료된 경우 종료 화면 표시
  if (chatData.isExpired) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <header className="sticky top-0 z-50 bg-card border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex-1">
                <h1 className="text-lg font-semibold">{chatData.eventTitle}</h1>
                <p className="text-sm text-muted-foreground">채팅방이 종료되었습니다</p>
              </div>
            </div>
          </div>
        </header>

        {/* 채팅방 종료 안내 화면 */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <AlertTriangle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">채팅방이 종료되었습니다</h2>
            <p className="text-muted-foreground mb-6">
              밥약 시간이 끝나서 채팅방이 자동으로 삭제되었습니다. 함께한 참여자들에 대한 리뷰를 작성해주세요.
            </p>
            <div className="space-y-3">
              <Button onClick={() => router.push(`/events/${chatData.id}/review`)} className="w-full">
                리뷰 작성하기
              </Button>
              <Button variant="outline" onClick={() => router.push("/")} className="w-full bg-transparent">
                홈으로 돌아가기
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* 뒤로가기 버튼 */}
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex-1">
                {/* 채팅방 제목 (밥약 제목) */}
                <h1 className="text-lg font-semibold">{chatData.eventTitle}</h1>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-muted-foreground">
                    {chatData.participants.length}명 참여 • {formatDate(chatData.eventDate)}
                  </p>
                  {/* 채팅방 자동 삭제 타이머 */}
                  <ChatTimer eventEndTime={chatData.eventEndTime} onExpired={handleChatExpired} />
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* 참여자 목록 다이얼로그 */}
              <Dialog open={showParticipants} onOpenChange={setShowParticipants}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Info className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>참여자 목록</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    {chatData.participants.map((participant) => (
                      <div key={participant.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            {/* 참여자 아바타 (클릭 시 프로필로 이동) */}
                            <Avatar
                              className="w-10 h-10 cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => router.push(`/profile/${participant.id}`)}
                            >
                              <AvatarImage src={participant.avatar || "/placeholder.svg"} />
                              <AvatarFallback>{participant.name[0]}</AvatarFallback>
                            </Avatar>
                            {/* 온라인 상태 표시 */}
                            {participant.isOnline && (
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span
                                className="font-medium cursor-pointer hover:text-primary transition-colors"
                                onClick={() => router.push(`/profile/${participant.id}`)}
                              >
                                {participant.name}
                              </span>
                              {/* 호스트 배지 */}
                              {participant.isHost && (
                                <Badge variant="secondary" className="text-xs">
                                  호스트
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {participant.isOnline ? "온라인" : "오프라인"}
                            </span>
                          </div>
                        </div>
                        {/* 신고 버튼 (호스트가 아니고 본인이 아닌 경우) */}
                        {!participant.isHost && participant.id !== currentUserId && (
                          <Button variant="ghost" size="sm">
                            <Flag className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-4">
                    {/* 채팅방 나가기 버튼 */}
                    <Button variant="outline" className="flex-1 bg-transparent" onClick={handleLeaveChat}>
                      <UserMinus className="w-4 h-4 mr-2" />
                      채팅방 나가기
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 메시지 목록 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatData.messages.map((message, index) => {
          // 날짜가 바뀌는 경우 날짜 구분선 표시
          const showDate =
            index === 0 || formatDate(message.timestamp) !== formatDate(chatData.messages[index - 1].timestamp)

          return (
            <div key={message.id}>
              {/* 날짜 구분선 */}
              {showDate && (
                <div className="flex justify-center mb-4">
                  <Badge variant="outline" className="text-xs">
                    {formatDate(message.timestamp)}
                  </Badge>
                </div>
              )}

              {/* 시스템 메시지 */}
              {message.isSystem ? (
                <div className="flex justify-center">
                  <Badge variant="secondary" className="text-xs">
                    {message.content}
                  </Badge>
                </div>
              ) : (
                /* 일반 메시지 */
                <div className={`flex ${message.userId === currentUserId ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`flex space-x-2 max-w-[70%] ${message.userId === currentUserId ? "flex-row-reverse space-x-reverse" : ""}`}
                  >
                    {/* 상대방 메시지인 경우 아바타 표시 */}
                    {message.userId !== currentUserId && (
                      <Avatar
                        className="w-8 h-8 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => router.push(`/profile/${message.userId}`)}
                      >
                        <AvatarImage src={message.userAvatar || "/placeholder.svg"} />
                        <AvatarFallback>{message.userName[0]}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`flex flex-col ${message.userId === currentUserId ? "items-end" : "items-start"}`}>
                      {/* 상대방 메시지인 경우 이름 표시 */}
                      {message.userId !== currentUserId && (
                        <span
                          className="text-xs text-muted-foreground mb-1 cursor-pointer hover:text-primary transition-colors"
                          onClick={() => router.push(`/profile/${message.userId}`)}
                        >
                          {message.userName}
                        </span>
                      )}
                      {/* 메시지 내용 */}
                      <div
                        className={`rounded-lg px-3 py-2 ${
                          message.userId === currentUserId ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                      {/* 메시지 전송 시간 */}
                      <span className="text-xs text-muted-foreground mt-1">{formatTime(message.timestamp)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
        {/* 자동 스크롤을 위한 참조 요소 */}
        <div ref={messagesEndRef} />
      </div>

      {/* 메시지 입력 영역 */}
      <div className="border-t border-border p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            placeholder={chatData.isExpired ? "채팅방이 종료되었습니다" : "메시지를 입력하세요..."}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
            disabled={isSending || chatData.isExpired}
          />
          <Button type="submit" disabled={!newMessage.trim() || isSending || chatData.isExpired}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
