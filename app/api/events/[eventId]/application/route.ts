import { type NextRequest, NextResponse } from "next/server"

/**
 * 밥약 신청 API 엔드포인트
 * POST /api/events/{eventId}/application
 */
export async function POST(request: NextRequest, { params }: { params: { eventId: string } }) {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "인증 토큰이 필요합니다." }, { status: 401 })
    }

    const eventId = Number.parseInt(params.eventId)
    const userId = token.includes("mock-jwt-token-1") ? 1 : 2

    if (isNaN(eventId)) {
      return NextResponse.json({ error: "유효하지 않은 밥약 ID입니다." }, { status: 400 })
    }

    // 요청 본문에서 신청 메시지 등 추가 정보 추출 (선택사항)
    const { message } = await request.json().catch(() => ({}))

    // Mock 신청 데이터 생성
    const application = {
      id: Date.now(),
      eventId,
      userId,
      message: message || "",
      status: "pending", // pending, approved, rejected
      createdAt: new Date().toISOString(),
    }

    // 실제 구현에서는 데이터베이스에 신청 정보 저장
    console.log("밥약 신청:", application)

    return NextResponse.json({
      success: true,
      application,
      message: "밥약 신청이 완료되었습니다.",
    })
  } catch (error) {
    console.error("밥약 신청 API 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
