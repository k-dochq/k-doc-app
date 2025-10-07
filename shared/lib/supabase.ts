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
      flowType: "pkce",
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
