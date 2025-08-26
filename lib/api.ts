/**
 * API 호출 엔드포인트 래퍼 모음 (기존 이름 그대로)
 * - 코어 유틸은 api.core.ts에서 import
 * - 외부 사용처는 계속 "@/lib/api" 에서 import
 */

import { apiRequest, refreshPOST, getAuthToken, API_BASE_URL } from "./api.core";
export { apiRequest, refreshPOST, getAuthToken, API_BASE_URL }; // 밖으로도 다시 내보내기
export type { Profile } from "./api.core";
import { eventAPI_mutation } from "./api.routes";

// ─────────────────────────────────────────────────────────────
// 보조 유틸(도메인 변환)
// ─────────────────────────────────────────────────────────────
/** UI 라벨 → 서버 포맷 */
const toWireGender = (g: any): "Male" | "Female" | "None" | undefined => {
  if (g === "남성" || g === "M") return "Male";
  if (g === "여성" || g === "F") return "Female";
  if (g === "상관없음" || g === "무관" || g === "N" || g === "선택안함") return "None";
  return undefined;
};
const toWireGrade = (v: any): number | undefined => {
  if (v == null) return undefined;
  const n = typeof v === "number" ? v : parseInt(String(v).replace(/\D/g, ""), 10);
  return Number.isFinite(n) ? n : undefined;
};

/** 보조: 현재 로그인 유저 로컬 */
export function getCurrentUser(): any | null {
  if (typeof window === "undefined") return null;
  const s = localStorage.getItem("user");
  return s ? JSON.parse(s) : null;
}
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return !!getAuthToken();
}

// ─────────────────────────────────────────────────────────────
// 인증
// ─────────────────────────────────────────────────────────────
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (response?.success && (response?.token || response?.accessToken)) {
      const t = response?.token ?? response?.accessToken;
      localStorage.setItem("authToken", t);
    }
    if (response?.user) localStorage.setItem("user", JSON.stringify(response.user));
    if (response?.success || response?.user) localStorage.setItem("isLoggedIn", "true");
    return response;
  },

  /** Google OAuth */
  loginWithIdToken: async (idToken: string) => {
    const response = await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ idToken }),
    });
    const token =
      response?.token ??
      response?.accessToken ??
      response?.access_token ??
      response?.jwt ??
      response?.data?.token ??
      response?.data?.accessToken ?? null;
    if (token) localStorage.setItem("authToken", token);

    const user = response?.user ?? response?.success ?? null;
    if (user) localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("isLoggedIn", "true");
    return response;
  },

  logout: async () => {
    try {
      await apiRequest("/api/auth/logout", { method: "POST" });
    } finally {
      localStorage.removeItem("authToken");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      localStorage.removeItem("isLoggedIn");
    }
  },

  /** 내 프로필 조회: refresh(POST)로만 회수 */
  getProfile: async () => {
    try {
      const refreshed = await refreshPOST();
      const me = refreshed?.user ?? refreshed ?? null;

      if (me?.id) {
        localStorage.setItem("user", JSON.stringify(me));
        localStorage.setItem("isLoggedIn", "true");
      }
      return me;
    } catch {
      return null;
    }
  },

  /** 초기 프로필 설정 */
  updateProfile: async (profileData: { grade: any; gender: any; nickname: string }) => {
    const grade = toWireGrade(profileData.grade);
    const gender = toWireGender(profileData.gender);
    const nickname = profileData.nickname?.trim();
    if (!grade || !gender || !nickname) {
      throw new Error("학년, 성별, 닉네임은 모두 입력해야 합니다.");
    }
    const payload = { grade, gender, nickname };
    return apiRequest("/api/auth/profile/", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
};

// ─────────────────────────────────────────────────────────────
// 사용자
// ─────────────────────────────────────────────────────────────
export const userAPI = {
  getUserProfile: async (userId: number) => apiRequest(`/api/users/${userId}`),
};

// ─────────────────────────────────────────────────────────────
// 이벤트
// ─────────────────────────────────────────────────────────────
export const eventAPI_read = {
  createEvent: async (eventData: any) =>
    apiRequest("/api/events/creation", { method: "POST", body: JSON.stringify(eventData) }),

  getEvents: async (params?: {
    search?: string; category?: string; region?: string; genderRestriction?: string; page?: number; limit?: number;
  }) => {
    const sp = new URLSearchParams();
    if (params)
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== "") sp.append(k, String(v));
      });
    const q = sp.toString();
    return apiRequest(`/api/events${q ? `?${q}` : ""}`);
  },

  getEvent: async (eventId: number) => apiRequest(`/api/events/${eventId}`),

  
};

// ─────────────────────────────────────────────────────────────
// 채팅
// ─────────────────────────────────────────────────────────────
export const chatAPI = {
  getChatRoom: async (chatId: number) => apiRequest(`/api/chats/${chatId}`),
  sendMessage: async (chatId: number, content: string) =>
    apiRequest(`/api/chats/${chatId}`, { method: "POST", body: JSON.stringify({ content }) }),
  leaveChat: async (chatId: number) => apiRequest(`/api/chats/${chatId}`, { method: "PATCH" }),
};
export const eventAPI = { ...eventAPI_read, ...eventAPI_mutation };

// ─────────────────────────────────────────────────────────────
// 알림
// ─────────────────────────────────────────────────────────────
export const notificationAPI = {
  getNotifications: async (params?: { unreadOnly?: boolean; type?: string; page?: number; limit?: number }) => {
    const sp = new URLSearchParams();
    if (params)
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== "") sp.append(k, String(v));
      });
    const q = sp.toString();
    return apiRequest(`/api/notifications${q ? `?${q}` : ""}`);
  },
  markAsRead: async (notificationId: string) =>
    apiRequest(`/api/notifications/${notificationId}`, { method: "PATCH", body: JSON.stringify({ isRead: true }) }),
  deleteNotification: async (notificationId: string) =>
    apiRequest(`/api/notifications/${notificationId}`, { method: "DELETE" }),
  createNotification: async (notificationData: {
    eventId: string; participantIds: number[]; type: string; title: string; message: string; actionData?: any;
  }) => apiRequest("/api/notification", { method: "POST", body: JSON.stringify(notificationData) }),
};



// ─────────────────────────────────────────────────────────────
// 추천 식당
// ─────────────────────────────────────────────────────────────
export const restaurantAPI = {
  search: async (params?: {
    q?: string; location?: string; category?: string; sponsoredOnly?: 0 | 1; page?: number; limit?: number;
  }) => {
    const sp = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") sp.append(k, String(v));
      });
    }
    const qs = sp.toString();
    return apiRequest(`/api/restaurants${qs ? `?${qs}` : ""}`);
  },
  getRecommendations: async (params?: { category?: string; location?: string; priceRange?: string; limit?: number }) => {
    const sp = new URLSearchParams();
    if (params) Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") sp.append(k, String(v));
    });
    const qs = sp.toString();
    return apiRequest(`/api/restaurants/recommends${qs ? `?${qs}` : ""}`);
  },
};
export { /*chatAPI,  notificationAPI,*/ commentAPI,reviewAPI } from "./api.routes";