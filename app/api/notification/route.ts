import { type NextRequest, NextResponse } from "next/server"

/**
 * 밥약 종료 후 알림 생성 API 엔드포인트
 * POST /api/notification
 */
export async function POST(request: NextRequest) {
  try {
    // Authorization 헤더에서 토큰 추출 (시스템 또는 관리자 권한 필요)
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "인증 토큰이 필요합니다." }, { status: 401 })
    }

    // 요청 본문에서 알림 데이터 추출
    const { eventId, participantIds, type, title, message, actionData } = await request.json()

    // 필수 필드 검증
    if (!eventId || !participantIds || !Array.isArray(participantIds) || !type || !title || !message) {
      return NextResponse.json({ error: "필수 필드가 누락되었습니다." }, { status: 400 })
    }

    // 지원되는 알림 타입 검증
    const supportedTypes = ["application_approved", "review_request", "chat_message", "event_reminder"]
    if (!supportedTypes.includes(type)) {
      return NextResponse.json({ error: "지원되지 않는 알림 타입입니다." }, { status: 400 })
    }

    // 각 참여자에게 알림 생성
    const notifications = participantIds.map((userId: number) => ({
      id: `${Date.now()}-${userId}`,
      userId,
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      isRead: false,
      actionData: {
        eventId,
        ...actionData,
      },
    }))

    // 실제 구현에서는 데이터베이스에 알림들 저장
    console.log("생성된 알림들:", notifications)

    // 실시간 알림 전송 (WebSocket, Push Notification 등)
    // await sendRealTimeNotifications(notifications)

    return NextResponse.json({
      success: true,
      message: `${participantIds.length}명에게 알림이 전송되었습니다.`,
      notificationCount: notifications.length,
    })
  } catch (error) {
    console.error("알림 생성 API 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
