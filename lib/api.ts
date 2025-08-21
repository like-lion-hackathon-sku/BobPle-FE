/**
 * API 호출을 위한 유틸리티 함수들
 */

// API 기본 URL (환경변수에서 가져오거나 기본값 사용)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ""

/**
 * 로컬 스토리지에서 인증 토큰 가져오기
 */
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("authToken")
}

/**
 * API 요청을 위한 공통 fetch 함수
 */
async function apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
  const token = getAuthToken()

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

/**
 * 인증 관련 API 함수들
 */
export const authAPI = {
  // 로그인
  login: async (email: string, password: string) => {
    const response = await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })

    // 로그인 성공 시 토큰 저장
    if (response.success && response.token) {
      localStorage.setItem("authToken", response.token)
      localStorage.setItem("user", JSON.stringify(response.user))
    }

    return response
  },

  // 로그아웃
  logout: async () => {
    const response = await apiRequest("/api/auth/logout", {
      method: "POST",
    })

    // 로그아웃 성공 시 로컬 데이터 삭제
    if (response.success) {
      localStorage.removeItem("authToken")
      localStorage.removeItem("user")
    }

    return response
  },

  // 프로필 조회
  getProfile: async () => {
    return apiRequest("/api/auth/profile")
  },

  // 프로필 수정
  updateProfile: async (profileData: any) => {
    return apiRequest("/api/auth/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    })
  },
}

/**
 * 사용자 관련 API 함수들
 */
export const userAPI = {
  // 다른 사용자 프로필 조회
  getUserProfile: async (userId: number) => {
    return apiRequest(`/api/users/${userId}`)
  },
}

/**
 * 밥약 관련 API 함수들
 */
export const eventAPI = {
  // 밥약 생성
  createEvent: async (eventData: any) => {
    return apiRequest("/api/events/creation", {
      method: "POST",
      body: JSON.stringify(eventData),
    })
  },

  // 밥약 목록 조회
  getEvents: async (params?: {
    search?: string
    category?: string
    region?: string
    genderRestriction?: string
    page?: number
    limit?: number
  }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          searchParams.append(key, value.toString())
        }
      })
    }

    const queryString = searchParams.toString()
    return apiRequest(`/api/events${queryString ? `?${queryString}` : ""}`)
  },

  // 밥약 상세 조회
  getEvent: async (eventId: number) => {
    return apiRequest(`/api/events/${eventId}`)
  },

  // 밥약 수정
  updateEvent: async (eventId: number, eventData: any) => {
    return apiRequest(`/api/events/${eventId}/edit`, {
      method: "PUT",
      body: JSON.stringify(eventData),
    })
  },

  // 밥약 삭제
  deleteEvent: async (eventId: number) => {
    return apiRequest(`/api/events/${eventId}/cancel`, {
      method: "DELETE",
    })
  },

  // 밥약 신청
  applyToEvent: async (eventId: number, message?: string) => {
    return apiRequest(`/api/events/${eventId}/application`, {
      method: "POST",
      body: JSON.stringify({ message }),
    })
  },

  // 밥약 신청 취소
  cancelApplication: async (eventId: number, applicationId: number) => {
    return apiRequest(`/api/events/${eventId}/application/${applicationId}/cancel`, {
      method: "DELETE",
    })
  },

  // 내가 참여한 밥약 조회
  getMyEvents: async () => {
    return apiRequest("/api/events/me")
  },
}

/**
 * 채팅 관련 API 함수들
 */
export const chatAPI = {
  // 채팅방 정보 조회
  getChatRoom: async (chatId: number) => {
    return apiRequest(`/api/chats/${chatId}`)
  },

  // 메시지 전송
  sendMessage: async (chatId: number, content: string) => {
    return apiRequest(`/api/chats/${chatId}`, {
      method: "POST",
      body: JSON.stringify({ content }),
    })
  },

  // 채팅방 나가기
  leaveChat: async (chatId: number) => {
    return apiRequest(`/api/chats/${chatId}`, {
      method: "PATCH",
    })
  },
}

/**
 * 댓글 관련 API 함수들
 */
export const commentAPI = {
  // 댓글 목록 조회
  getComments: async (eventId: number, page = 1, limit = 10) => {
    return apiRequest(`/api/events/${eventId}/comments?page=${page}&limit=${limit}`)
  },

  // 댓글 작성
  createComment: async (eventId: number, content: string) => {
    return apiRequest(`/api/events/${eventId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content }),
    })
  },

  // 댓글 삭제
  deleteComment: async (eventId: number, commentId: number) => {
    return apiRequest(`/api/events/${eventId}/comments/${commentId}`, {
      method: "DELETE",
    })
  },
}

/**
 * 알림 관련 API 함수들
 */
export const notificationAPI = {
  // 알림 목록 조회
  getNotifications: async (params?: {
    unreadOnly?: boolean
    type?: string
    page?: number
    limit?: number
  }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          searchParams.append(key, value.toString())
        }
      })
    }

    const queryString = searchParams.toString()
    return apiRequest(`/api/notifications${queryString ? `?${queryString}` : ""}`)
  },

  // 알림 읽음 처리
  markAsRead: async (notificationId: string) => {
    return apiRequest(`/api/notifications/${notificationId}`, {
      method: "PATCH",
      body: JSON.stringify({ isRead: true }),
    })
  },

  // 알림 삭제
  deleteNotification: async (notificationId: string) => {
    return apiRequest(`/api/notifications/${notificationId}`, {
      method: "DELETE",
    })
  },

  // 시스템 알림 생성 (관리자/시스템용)
  createNotification: async (notificationData: {
    eventId: string
    participantIds: number[]
    type: string
    title: string
    message: string
    actionData?: any
  }) => {
    return apiRequest("/api/notification", {
      method: "POST",
      body: JSON.stringify(notificationData),
    })
  },
}

/**
 * 리뷰 관련 API 함수들
 */
export const reviewAPI = {
  // 사용자 리뷰 조회
  getUserReviews: async (userId: number, page = 1, limit = 10) => {
    return apiRequest(`/api/reviews/${userId}?page=${page}&limit=${limit}`)
  },

  // 리뷰 작성
  createReview: async (
    userId: number,
    reviewData: {
      rating: number
      comment?: string
      eventId: string
    },
  ) => {
    return apiRequest(`/api/reviews/${userId}`, {
      method: "POST",
      body: JSON.stringify(reviewData),
    })
  },
}

/**
 * 식당 관련 API 함수들
 */
export const restaurantAPI = {
  // 추천 식당 조회
  getRecommendations: async (params?: {
    category?: string
    location?: string
    priceRange?: string
    limit?: number
  }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          searchParams.append(key, value.toString())
        }
      })
    }

    const queryString = searchParams.toString()
    return apiRequest(`/api/restaurants/recommends${queryString ? `?${queryString}` : ""}`)
  },
}

/**
 * 인증 상태 확인 함수
 */
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false
  return !!getAuthToken()
}

/**
 * 현재 로그인한 사용자 정보 가져오기
 */
export function getCurrentUser(): any | null {
  if (typeof window === "undefined") return null
  const userStr = localStorage.getItem("user")
  return userStr ? JSON.parse(userStr) : null
}
