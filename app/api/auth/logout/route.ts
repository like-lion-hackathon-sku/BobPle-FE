import { type NextRequest, NextResponse } from "next/server"

/**
 * 로그아웃 API 엔드포인트
 * POST /api/auth/logout
 */
export async function POST(request: NextRequest) {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "인증 토큰이 필요합니다." }, { status: 401 })
    }

    // 실제 구현에서는 토큰을 블랙리스트에 추가하거나 무효화
    // 현재는 Mock 로직으로 성공 응답만 반환

    return NextResponse.json({
      success: true,
      message: "로그아웃이 완료되었습니다.",
    })
  } catch (error) {
    console.error("로그아웃 API 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
