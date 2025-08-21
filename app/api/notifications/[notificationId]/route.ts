import { type NextRequest, NextResponse } from "next/server"

/**
 * 알림 읽음 처리 API 엔드포인트
 * PATCH /api/notifications/{notificationId}
 */
export async function PATCH(request: NextRequest, { params }: { params: { notificationId: string } }) {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "인증 토큰이 필요합니다." }, { status: 401 })
    }

    const notificationId = params.notificationId
    const userId = token.includes("mock-jwt-token-1") ? 1 : 2

    // 요청 본문에서 업데이트할 데이터 추출
    const { isRead } = await request.json()

    if (typeof isRead !== "boolean") {
      return NextResponse.json({ error: "isRead 값이 필요합니다." }, { status: 400 })
    }

    // 실제 구현에서는 데이터베이스에서 알림 조회 및 권한 확인
    // 알림 소유자만 읽음 상태 변경 가능

    console.log(`알림 ${notificationId} 읽음 상태 변경: ${isRead} (사용자: ${userId})`)

    return NextResponse.json({
      success: true,
      message: "알림 상태가 업데이트되었습니다.",
    })
  } catch (error) {
    console.error("알림 읽음 처리 API 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}

/**
 * 알림 삭제 API 엔드포인트
 * DELETE /api/notifications/{notificationId}
 */
export async function DELETE(request: NextRequest, { params }: { params: { notificationId: string } }) {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "인증 토큰이 필요합니다." }, { status: 401 })
    }

    const notificationId = params.notificationId
    const userId = token.includes("mock-jwt-token-1") ? 1 : 2

    // 실제 구현에서는 데이터베이스에서 알림 조회 및 권한 확인
    // 알림 소유자만 삭제 가능

    console.log(`알림 ${notificationId} 삭제됨 (사용자: ${userId})`)

    return NextResponse.json({
      success: true,
      message: "알림이 삭제되었습니다.",
    })
  } catch (error) {
    console.error("알림 삭제 API 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
