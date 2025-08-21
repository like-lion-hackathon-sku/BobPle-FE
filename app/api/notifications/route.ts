import { type NextRequest, NextResponse } from "next/server"

// Mock 알림 데이터
const mockNotifications = [
  {
    id: "1",
    userId: 1,
    type: "application_approved",
    title: "참여 신청 승인",
    message: "강남역 맛집 탐방 밥약 참여가 승인되었습니다.",
    timestamp: "2024-01-19T10:30:00Z",
    isRead: false,
    actionData: {
      eventId: "1",
      chatId: "1",
    },
  },
  {
    id: "2",
    userId: 1,
    type: "review_request",
    title: "리뷰 작성 요청",
    message: "홍대 브런치 모임이 종료되었습니다. 함께한 참여자들에 대한 리뷰를 작성해주세요.",
    timestamp: "2024-01-18T14:00:00Z",
    isRead: false,
    actionData: {
      eventId: "2",
    },
  },
  {
    id: "3",
    userId: 1,
    type: "chat_message",
    title: "새 메시지",
    message: "김민수님이 메시지를 보냈습니다: 내일 7시에 만나요!",
    timestamp: "2024-01-17T16:45:00Z",
    isRead: true,
    actionData: {
      chatId: "1",
    },
  },
  {
    id: "4",
    userId: 1,
    type: "event_reminder",
    title: "밥약 알림",
    message: "1시간 후 강남역 맛집 탐방 밥약이 시작됩니다.",
    timestamp: "2024-01-16T18:00:00Z",
    isRead: true,
    actionData: {
      eventId: "1",
    },
  },
]

/**
 * 알림 조회 API 엔드포인트
 * GET /api/notifications
 */
export async function GET(request: NextRequest) {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "인증 토큰이 필요합니다." }, { status: 401 })
    }

    const userId = token.includes("mock-jwt-token-1") ? 1 : 2

    // 쿼리 파라미터에서 필터링 옵션 추출
    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get("unreadOnly") === "true"
    const type = searchParams.get("type")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    // 사용자의 알림만 필터링
    let userNotifications = mockNotifications.filter((notif) => notif.userId === userId)

    // 읽지 않은 알림만 필터링 (옵션)
    if (unreadOnly) {
      userNotifications = userNotifications.filter((notif) => !notif.isRead)
    }

    // 알림 타입별 필터링 (옵션)
    if (type) {
      userNotifications = userNotifications.filter((notif) => notif.type === type)
    }

    // 페이지네이션 적용
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedNotifications = userNotifications.slice(startIndex, endIndex)

    // 읽지 않은 알림 개수 계산
    const unreadCount = mockNotifications.filter((notif) => notif.userId === userId && !notif.isRead).length

    return NextResponse.json({
      success: true,
      notifications: paginatedNotifications,
      unreadCount,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(userNotifications.length / limit),
        totalNotifications: userNotifications.length,
        hasNext: endIndex < userNotifications.length,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("알림 조회 API 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
