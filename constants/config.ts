/**
 * 환경 설정 상수
 * 실제 프로덕션에서는 환경변수로 관리하되, 개발 편의를 위해 하드코딩
 */

// Supabase 설정 (k-doc 프로젝트와 동일한 설정)
export const SUPABASE_CONFIG = {
  url: "https://hmzwblmwusrxbyqcvtlu.supabase.co",
  anonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtendibG13dXNyeGJ5cWN2dGx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2Mzk4NzMsImV4cCI6MjA3MDIxNTg3M30.dM9HxtZiOdL13rIsywjfeF_XZNItPk4JQTK3bQn8hJ4",
} as const;

// 웹뷰 설정
export const WEBVIEW_CONFIG = {
  baseUrl: "http://172.30.1.100:3000",
  //   baseUrl: "https://k-doc.kr",
  productionUrl: "https://k-doc.kr", // 프로덕션 URL
} as const;

// 딥링크 설정
export const DEEP_LINK_CONFIG = {
  scheme: "kdoc",
  callbackPath: "/auth/callback",
} as const;
