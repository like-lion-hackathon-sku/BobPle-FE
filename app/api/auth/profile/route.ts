import { type NextRequest, NextResponse } from "next/server"

/**
 * 프로필 조회 API 엔드포인트
 * GET /api/auth/profile
 */
export async function GET(request: NextRequest) {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "인증 토큰이 필요합니다." }, { status: 401 })
    }

    // 토큰에서 사용자 ID 추출 (Mock 로직)
    const userId = token.includes("mock-jwt-token-1") ? 1 : 2

    // Mock 사용자 프로필 데이터
    const mockProfile = {
      id: userId,
      name: userId === 1 ? "김민수" : "이지은",
      email: userId === 1 ? "test@example.com" : "user@bobple.com",
      profileImage: "/abstract-profile.png",
      statusMessage: userId === 1 ? "맛있는 음식과 좋은 사람들과 함께!" : "새로운 사람들과의 만남을 기대해요",
      location: userId === 1 ? "강남구" : "홍대입구",
      grade: userId === 1 ? "3학년" : "2학년",
      gender: userId === 1 ? "남성" : "여성",
      bio: userId === 1 ? "음식을 사랑하는 대학생입니다." : "다양한 음식을 좋아해요!",
      joinDate: "2023-06-01",
      rating: userId === 1 ? 4.8 : 4.6,
      reviewCount: userId === 1 ? 23 : 18,
    }

    return NextResponse.json({
      success: true,
      profile: mockProfile,
    })
  } catch (error) {
    console.error("프로필 조회 API 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}

/**
 * 프로필 수정 API 엔드포인트
 * PUT /api/auth/profile
 */
export async function PUT(request: NextRequest) {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "인증 토큰이 필요합니다." }, { status: 401 })
    }

    // 요청 본문에서 수정할 프로필 데이터 추출
    const profileData = await request.json()

    // 입력값 검증
    const allowedFields = ["name", "statusMessage", "location", "grade", "bio", "profileImage"]
    const updateData: any = {}

    for (const field of allowedFields) {
      if (profileData[field] !== undefined) {
        updateData[field] = profileData[field]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "수정할 데이터가 없습니다." }, { status: 400 })
    }

    // 실제 구현에서는 데이터베이스에 프로필 정보 업데이트
    // 현재는 Mock 로직으로 성공 응답 반환

    return NextResponse.json({
      success: true,
      message: "프로필이 성공적으로 수정되었습니다.",
      updatedFields: Object.keys(updateData),
    })
  } catch (error) {
    console.error("프로필 수정 API 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
