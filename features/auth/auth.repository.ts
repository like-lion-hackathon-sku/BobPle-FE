import { apiFetch } from '@/shared/api/client';

/**
 * 로그인
 * @param {{ idToken: string }} payload - 구글 등 외부 인증 토큰
 * @returns {{ ok: boolean }}
 */
export function postLogin(payload: { idToken: string }) {
  return apiFetch<{ ok: boolean }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** 로그아웃 */
export async function postLogout() {
  return apiFetch('/api/auth/logout', { method: 'POST' }); // body 넣지 말기
}

/** 내 프로필 조회 */
export async function getMyProfile(): Promise<UserProfile | null> {
  try {
    return await apiFetch<UserProfile>('/api/auth/profile', { method: 'GET' });
  } catch (e: any) {
    if (String(e?.message).includes('HTTP 404')) return null; // 엔드포인트 없거나 프로필 미생성
    throw e;
  }
}
/*export async function getMyProfile() {
  try {
    return await apiFetch<UserProfile>('/api/auth/profile');
  } catch (e: any) {
    if (String(e.message).includes('404')) return null; // 404면 임시 null
    throw e;
  }
}*/

/** 내 프로필 수정 */
export function putMyProfile(payload: Partial<UserProfile>) {
  return apiFetch<UserProfile>('/api/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export type UserProfile = {
  id: number;
  email: string;
  nickname: string | null;
  grade?: number | null;
  gender?: 'M' | 'F' | 'N' | null;
  profile_img?: string | null;
  isCompleted?: boolean;
  created_at?: string;
  updated_at?: string;
};
