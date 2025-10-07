/**
 * Supabase 클라이언트 설정
 */

import { createClient } from "@supabase/supabase-js";
import { SUPABASE_CONFIG } from "../../constants/config";

export const supabase = createClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.anonKey,
  {
    auth: {
      // 모바일 앱에서 사용할 수 있도록 설정
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // 딥링크로 처리하므로 false
    },
  }
);
