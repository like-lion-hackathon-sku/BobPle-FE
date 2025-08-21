import { type NextRequest, NextResponse } from "next/server"

/**
 * 로그인 API 엔드포인트
 * POST /api/auth/login
 */
export async function POST(request: NextRequest) {
  try {
    // 요청 본문에서 이메일과 비밀번호 추출
    const { email, password } = await request.json()

    // 입력값 검증
    if (!email || !password) {
      return NextResponse.json({ error: "이메일과 비밀번호를 입력해주세요." }, { status: 400 })
    }

    // 실제 구현에서는 데이터베이스에서 사용자 인증을 수행
    // 현재는 간단한 Mock 인증 로직
    const mockUsers = [
      { id: 1, email: "test@example.com", password: "password123", name: "김민수" },
      { id: 2, email: "user@bobple.com", password: "bobple123", name: "이지은" },
    ]

    const user = mockUsers.find((u) => u.email === email && u.password === password)

    if (!user) {
      return NextResponse.json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." }, { status: 401 })
    }

    // JWT 토큰 생성 (실제 구현에서는 JWT 라이브러리 사용)
    const token = `mock-jwt-token-${user.id}-${Date.now()}`

    // 사용자 정보 반환 (비밀번호 제외)
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      token,
      message: "로그인이 완료되었습니다.",
    })
  } catch (error) {
    console.error("로그인 API 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
