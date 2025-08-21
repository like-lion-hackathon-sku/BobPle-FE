"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Check, X, MessageCircle, Star, Users, Clock } from "lucide-react"
import { useRouter } from "next/navigation"

/**
 * 알림 데이터 인터페이스
 * Context와 동일한 구조를 유지
 */
interface Notification {
  id: string // 고유 식별자
  type: "application_approved" | "review_request" | "chat_message" | "event_reminder" // 알림 타입
  title: string // 알림 제목
  message: string // 알림 내용
  timestamp: string // 생성 시간 (ISO 형식)
  isRead: boolean // 읽음 여부
  actionData?: {
    // 알림 클릭 시 필요한 추가 데이터
    eventId?: string // 밥약 ID
    userId?: string // 사용자 ID
    chatId?: string // 채팅방 ID
  }
}

// 알림 목 데이터 - 실제로는 API에서 가져올 데이터
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "application_approved",
    title: "참여 신청이 승인되었습니다!",
    message: "강남역 맛집 탐방 밥약에 참여가 승인되었습니다. 채팅방에 입장하여 다른 참여자들과 대화해보세요.",
    timestamp: "2024-01-20T10:30:00Z",
    isRead: false,
    actionData: { eventId: "1", chatId: "chat-1" },
  },
  {
    id: "2",
    type: "review_request",
    title: "리뷰 작성 요청",
    message: "홍대 브런치 모임이 종료되었습니다. 함께한 참여자들에 대한 리뷰를 작성해주세요.",
    timestamp: "2024-01-19T15:00:00Z",
    isRead: false,
    actionData: { eventId: "2" },
  },
  {
    id: "3",
    type: "chat_message",
    title: "새로운 메시지",
    message: '김민수님이 메시지를 보냈습니다: "안녕하세요! 내일 만나뵙겠습니다."',
    timestamp: "2024-01-19T14:20:00Z",
    isRead: true,
    actionData: { chatId: "chat-1" },
  },
  {
    id: "4",
    type: "event_reminder",
    title: "밥약 시간 알림",
    message: "1시간 후 강남역 맛집 탐방 밥약이 시작됩니다. 준비해주세요!",
    timestamp: "2024-01-19T12:00:00Z",
    isRead: true,
    actionData: { eventId: "1" },
  },
]

/**
 * 알림 페이지 컴포넌트
 * 사용자의 모든 알림을 표시하고 관리하는 페이지
 */
export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications) // 알림 목록 상태
  const router = useRouter() // 페이지 라우팅을 위한 Next.js 라우터

  /**
   * 특정 알림을 읽음으로 표시하는 함수
   * @param id 읽음으로 표시할 알림의 ID
   */
  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif)))
  }

  /**
   * 모든 알림을 읽음으로 표시하는 함수
   * 헤더의 "모두 읽음" 버튼에서 사용
   */
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })))
  }

  /**
   * 특정 알림을 삭제하는 함수
   * @param id 삭제할 알림의 ID
   */
  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id))
  }

  /**
   * 알림 클릭 시 해당 페이지로 이동하는 함수
   * 알림 타입에 따라 다른 페이지로 라우팅
   * @param notification 클릭된 알림 객체
   */
  const handleNotificationAction = (notification: Notification) => {
    markAsRead(notification.id) // 클릭 시 자동으로 읽음 처리

    switch (notification.type) {
      case "application_approved": // 참여 승인 알림 -> 채팅방으로 이동
        if (notification.actionData?.chatId) {
          router.push(`/chat/${notification.actionData.chatId}`)
        }
        break
      case "review_request": // 리뷰 요청 알림 -> 리뷰 작성 페이지로 이동
        if (notification.actionData?.eventId) {
          router.push(`/events/${notification.actionData.eventId}/review`)
        }
        break
      case "chat_message": // 채팅 메시지 알림 -> 채팅방으로 이동
        if (notification.actionData?.chatId) {
          router.push(`/chat/${notification.actionData.chatId}`)
        }
        break
      case "event_reminder": // 밥약 알림 -> 밥약 상세 페이지로 이동
        if (notification.actionData?.eventId) {
          router.push(`/events/${notification.actionData.eventId}`)
        }
        break
    }
  }

  /**
   * 알림 타입에 따른 아이콘을 반환하는 함수
   * @param type 알림 타입
   * @returns 해당 타입에 맞는 아이콘 컴포넌트
   */
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "application_approved":
        return <Check className="w-5 h-5 text-green-500" /> // 승인 - 초록색 체크
      case "review_request":
        return <Star className="w-5 h-5 text-amber-500" /> // 리뷰 - 노란색 별
      case "chat_message":
        return <MessageCircle className="w-5 h-5 text-blue-500" /> // 채팅 - 파란색 말풍선
      case "event_reminder":
        return <Clock className="w-5 h-5 text-orange-500" /> // 알림 - 주황색 시계
      default:
        return <Users className="w-5 h-5 text-gray-500" /> // 기본 - 회색 사용자
    }
  }

  /**
   * 타임스탬프를 상대적 시간으로 포맷팅하는 함수
   * @param timestamp ISO 형식의 타임스탬프
   * @returns 상대적 시간 문자열 (예: "2시간 전", "방금 전")
   */
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "방금 전"
    if (diffInHours < 24) return `${diffInHours}시간 전`
    return date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" })
  }

  // 읽지 않은 알림 개수 계산
  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* 뒤로가기 버튼 */}
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">알림</h1>
                {/* 읽지 않은 알림 개수 표시 */}
                {unreadCount > 0 && <p className="text-sm text-muted-foreground">읽지 않은 알림 {unreadCount}개</p>}
              </div>
            </div>
            {/* 모두 읽음 버튼 (읽지 않은 알림이 있을 때만 표시) */}
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                모두 읽음
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="space-y-4">
          {/* 알림이 없는 경우 빈 상태 표시 */}
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">알림이 없습니다.</p>
              <p className="text-muted-foreground">새로운 알림이 오면 여기에 표시됩니다.</p>
            </div>
          ) : (
            /* 알림 목록 */
            notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  !notification.isRead ? "border-primary/50 bg-primary/5" : "" // 읽지 않은 알림 강조 표시
                }`}
                onClick={() => handleNotificationAction(notification)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    {/* 알림 타입별 아이콘 */}
                    <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* 알림 제목 */}
                          <h3
                            className={`text-sm font-medium ${
                              !notification.isRead ? "text-foreground" : "text-muted-foreground"
                            }`}
                          >
                            {notification.title}
                          </h3>
                          {/* 알림 내용 */}
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>
                          {/* 상대적 시간 표시 */}
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatTimestamp(notification.timestamp)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          {/* 읽지 않은 알림 표시 점 */}
                          {!notification.isRead && <div className="w-2 h-2 bg-primary rounded-full"></div>}
                          {/* 알림 삭제 버튼 */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation() // 카드 클릭 이벤트 방지
                              deleteNotification(notification.id)
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
