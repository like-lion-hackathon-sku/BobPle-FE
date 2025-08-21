import { API_BASE } from '@/shared/constants/env';

function joinUrl(base: string, path: string) {
  const b = (base || '').replace(/\/+$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${b}${p}`;
}

/** 공통 fetch (쿠키 포함, 객체 바디 자동 JSON) */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!API_BASE) {
    console.warn('[apiFetch] API_BASE is empty; check NEXT_PUBLIC_API_BASE');
  }
  const url = joinUrl(API_BASE, path);

  // ----- 바디/헤더 준비 -----
  let body = init.body as any;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const isURLParams = typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams;
  const isBlob = typeof Blob !== 'undefined' && body instanceof Blob;
  const isBufferView = typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView?.(body);
  const hasBody = body !== undefined && body !== null;

  // 기존 headers를 보존하면서 조작하기 쉽게 Headers로 래핑
  const headers = new Headers(init.headers as HeadersInit | undefined);

  // content-type이 미지정 && JSON으로 보낼 상황이면 지정
  const hasExplicitContentType = headers.has('content-type');
  const shouldSendJson =
    hasBody &&
    !isFormData &&
    !isURLParams &&
    !isBlob &&
    !isBufferView &&
    typeof body === 'object';

  if (shouldSendJson && !hasExplicitContentType) {
    headers.set('content-type', 'application/json');
  }

  // 객체 바디 자동 JSON 직렬화
  if (shouldSendJson) {
    body = JSON.stringify(body);
  }

  // ----- fetch -----
  const res = await fetch(url, {
    credentials: 'include',                 // ★ 쿠키 전송 필수
    method: init.method ?? 'GET',
    headers,
    body,
    signal: (init as any).signal,
  });

  // 204/205 → 본문 없음
  if (res.status === 204 || res.status === 205) {
    return null as T;
  }

  // 텍스트로 일단 받고 JSON 시도
  const text = await res.text().catch(() => '');
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // 서버가 HTML/텍스트를 반환할 수도 있음 → data는 null 유지
  }

  if (!res.ok) {
    console.warn('[apiFetch] error', {
      url,
      status: res.status,
      statusText: res.statusText,
      body: text,
    });
    throw new Error(data?.message || `HTTP ${res.status}`);
  }

  return (data as T) ?? ({} as T);
}