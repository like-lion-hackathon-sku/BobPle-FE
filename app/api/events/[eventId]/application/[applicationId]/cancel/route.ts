import { type NextRequest, NextResponse } from "next/server"

/**
 * 밥약 신청 취소 API 엔드포인트
 * DELETE /api/events/{eventId}/application/{applicationId}/cancel
 */
export async function DELETE(request: NextRequest, { params }: { params: { eventId: string; applicationId: string } }) {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "인증 토큰이 필요합니다." }, { status: 401 })
    }

    const eventId = Number.parseInt(params.eventId)
    const applicationId = Number.parseInt(params.applicationId)
    const userId = token.includes("mock-jwt-token-1") ? 1 : 2

    if (isNaN(eventId) || isNaN(applicationId)) {
      return NextResponse.json({ error: "유효하지 않은 ID입니다." }, { status: 400 })
    }

    // 실제 구현에서는 데이터베이스에서 신청 정보 조회 및 권한 확인
    // 신청자 본인만 취소 가능

    console.log(`밥약 ${eventId}의 신청 ${applicationId} 취소됨 (사용자: ${userId})`)

    return NextResponse.json({
      success: true,
      message: "밥약 신청이 취소되었습니다.",
    })
  } catch (error) {
    console.error("밥약 신청 취소 API 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
