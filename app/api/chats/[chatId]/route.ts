import { type NextRequest, NextResponse } from "next/server"

// Mock 채팅방 데이터
const mockChatData = {
  1: {
    id: 1,
    eventTitle: "강남역 맛집 탐방",
    eventDate: "2024-01-20 19:00",
    eventEndTime: "2025-12-31 23:59",
    isExpired: false,
    participants: [
      {
        id: 1,
        name: "김민수",
        avatar: "/placeholder.svg?height=32&width=32",
        isHost: true,
        isOnline: true,
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
        timestamp: "2024-01-19T15:30:00Z",
        isSystem: false,
      },
      {
        id: 2,
        userId: 2,
        userName: "이지은",
        userAvatar: "/placeholder.svg?height=32&width=32",
        content: "네! 기대되네요. 혹시 레스토랑 예약은 하셨나요?",
        timestamp: "2024-01-19T15:35:00Z",
        isSystem: false,
      },
    ],
  },
}

/**
 * 채팅방 내용 불러오기 API 엔드포인트
 * GET /api/chats/{chatId}
 */
export async function GET(request: NextRequest, { params }: { params: { chatId: string } }) {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "인증 토큰이 필요합니다." }, { status: 401 })
    }

    const chatId = Number.parseInt(params.chatId)

    if (isNaN(chatId)) {
      return NextResponse.json({ error: "유효하지 않은 채팅방 ID입니다." }, { status: 400 })
    }

    const chatData = mockChatData[chatId as keyof typeof mockChatData]

    if (!chatData) {
      return NextResponse.json({ error: "채팅방을 찾을 수 없습니다." }, { status: 404 })
    }

    // 사용자가 채팅방 참여자인지 확인
    const userId = token.includes("mock-jwt-token-1") ? 1 : 2
    const isParticipant = chatData.participants.some((p) => p.id === userId)

    if (!isParticipant) {
      return NextResponse.json({ error: "채팅방에 참여할 권한이 없습니다." }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      chat: chatData,
    })
  } catch (error) {
    console.error("채팅방 조회 API 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}

/**
 * 채팅방에 메시지 보내기 API 엔드포인트
 * POST /api/chats/{chatId}
 */
export async function POST(request: NextRequest, { params }: { params: { chatId: string } }) {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "인증 토큰이 필요합니다." }, { status: 401 })
    }

    const chatId = Number.parseInt(params.chatId)
    const userId = token.includes("mock-jwt-token-1") ? 1 : 2

    if (isNaN(chatId)) {
      return NextResponse.json({ error: "유효하지 않은 채팅방 ID입니다." }, { status: 400 })
    }

    // 요청 본문에서 메시지 내용 추출
    const { content } = await request.json()

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "메시지 내용이 필요합니다." }, { status: 400 })
    }

    // 채팅방 존재 여부 및 참여 권한 확인
    const chatData = mockChatData[chatId as keyof typeof mockChatData]

    if (!chatData) {
      return NextResponse.json({ error: "채팅방을 찾을 수 없습니다." }, { status: 404 })
    }

    if (chatData.isExpired) {
      return NextResponse.json({ error: "종료된 채팅방입니다." }, { status: 400 })
    }

    const isParticipant = chatData.participants.some((p) => p.id === userId)

    if (!isParticipant) {
      return NextResponse.json({ error: "채팅방에 참여할 권한이 없습니다." }, { status: 403 })
    }

    // 새 메시지 생성
    const newMessage = {
      id: Date.now(),
      userId,
      userName: userId === 1 ? "김민수" : "이지은",
      userAvatar: "/placeholder.svg?height=32&width=32",
      content: content.trim(),
      timestamp: new Date().toISOString(),
      isSystem: false,
    }

    // 실제 구현에서는 데이터베이스에 메시지 저장
    console.log("새 메시지 저장:", newMessage)

    return NextResponse.json({
      success: true,
      message: newMessage,
    })
  } catch (error) {
    console.error("메시지 전송 API 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}

/**
 * 채팅방 나가기 API 엔드포인트
 * PATCH /api/chats/{chatId}
 */
export async function PATCH(request: NextRequest, { params }: { params: { chatId: string } }) {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "인증 토큰이 필요합니다." }, { status: 401 })
    }

    const chatId = Number.parseInt(params.chatId)
    const userId = token.includes("mock-jwt-token-1") ? 1 : 2

    if (isNaN(chatId)) {
      return NextResponse.json({ error: "유효하지 않은 채팅방 ID입니다." }, { status: 400 })
    }

    // 채팅방 존재 여부 확인
    const chatData = mockChatData[chatId as keyof typeof mockChatData]

    if (!chatData) {
      return NextResponse.json({ error: "채팅방을 찾을 수 없습니다." }, { status: 404 })
    }

    const isParticipant = chatData.participants.some((p) => p.id === userId)

    if (!isParticipant) {
      return NextResponse.json({ error: "채팅방에 참여하지 않았습니다." }, { status: 403 })
    }

    // 실제 구현에서는 데이터베이스에서 사용자를 채팅방 참여자 목록에서 제거
    console.log(`사용자 ${userId}가 채팅방 ${chatId}에서 나감`)

    return NextResponse.json({
      success: true,
      message: "채팅방에서 나갔습니다.",
    })
  } catch (error) {
    console.error("채팅방 나가기 API 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
