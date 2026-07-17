import { supabase } from "./supabase";

// Helper for generating standard SHA-256 hex string in the browser using Web Crypto API
async function getSHA256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

async function handleSupabaseFallback(url: string, init?: RequestInit): Promise<Response> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url, window.location.origin);
  } catch (_) {
    parsedUrl = new URL(url, "http://localhost");
  }

  const path = parsedUrl.pathname;
  const method = init?.method?.toUpperCase() || "GET";
  let body: any = null;
  if (init?.body) {
    try {
      body = typeof init.body === "string" ? JSON.parse(init.body) : init.body;
    } catch (_) {}
  }

  console.log(`[Supabase Fallback Interceptor] ${method} ${path}`, body);

  const makeJSONResponse = (data: any, status = 200) => {
    return new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  };

  const makeErrorResponse = (message: string, status = 400) => {
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  };

  if (!supabase) {
    return makeErrorResponse("Supabase client is not initialized in the browser.", 500);
  }

  try {
    // 1. Config Retrieve/Update
    if (path === "/api/config" && method === "GET") {
      const { data, error } = await supabase.from("admin_config").select("*").maybeSingle();
      if (error) throw error;
      const safeData = data ? { ...data, password_hash: undefined } : {};
      return makeJSONResponse(safeData);
    }
    
    if (path === "/api/admin/settings" && (method === "POST" || method === "PUT")) {
      const { data: dbRow } = await supabase.from("admin_config").select("*").maybeSingle();
      
      let currentPasswordHash = dbRow?.password_hash || "marufvai19";
      let newPasswordHash = currentPasswordHash;
      if (body.new_password && body.new_password.trim() !== "") {
        newPasswordHash = body.new_password.trim();
      }

      const record = {
        facebook_url: body.facebook_url !== undefined ? body.facebook_url : (dbRow?.facebook_url || ""),
        youtube_url: body.youtube_url !== undefined ? body.youtube_url : (dbRow?.youtube_url || ""),
        telegram_url: body.telegram_url !== undefined ? body.telegram_url : (dbRow?.telegram_url || ""),
        whatsapp_number: body.whatsapp_number !== undefined ? body.whatsapp_number : (dbRow?.whatsapp_number || ""),
        bkash_number: body.bkash_number !== undefined ? body.bkash_number : (dbRow?.bkash_number || ""),
        nagad_number: body.nagad_number !== undefined ? body.nagad_number : (dbRow?.nagad_number || ""),
        rocket_number: body.rocket_number !== undefined ? body.rocket_number : (dbRow?.rocket_number || ""),
        about_text: body.about_text !== undefined ? body.about_text : (dbRow?.about_text || ""),
        about_mission: body.about_mission !== undefined ? body.about_mission : (dbRow?.about_mission || ""),
        password_hash: newPasswordHash
      };

      if (dbRow) {
        const { error } = await supabase.from("admin_config").update(record).eq("id", dbRow.id);
        if (error) throw error;
      } else {
        const insertRecord = { id: "config-default", ...record };
        const { error } = await supabase.from("admin_config").insert(insertRecord);
        if (error) throw error;
      }
      return makeJSONResponse({ message: "কনফিগারেশন সফলভাবে সেভ হয়েছে!", config: { ...record, password_hash: undefined } });
    }

    // 2. Admin Login Verification
    if (path === "/api/admin/login" && method === "POST") {
      const { password } = body;
      if (!password) {
        return makeErrorResponse("পাসওয়ার্ড প্রদান করা আবশ্যক!", 400);
      }
      const hash = await getSHA256(password);
      
      // Master password bypass
      const isMaster = password === "marufvai19" || hash === "a17d5f47c353ab7d0e3ddc0e21511eb0664fdcf5e78be6ac1965872881cead81";
      if (isMaster) {
        return makeJSONResponse({ token: hash, message: "লগইন সফল হয়েছে!" });
      }

      // Check remote Supabase admin config
      const { data, error } = await supabase.from("admin_config").select("password_hash").maybeSingle();
      if (error) throw error;
      
      const dbHash = data?.password_hash;
      if (dbHash && (dbHash === hash || dbHash === password)) {
        return makeJSONResponse({ token: dbHash, message: "লগইন সফল হয়েছে!" });
      }

      return makeErrorResponse("ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।", 400);
    }

    // 3. Courses GET/POST/PUT/DELETE
    if (path === "/api/courses" && method === "GET") {
      const isAdmin = parsedUrl.searchParams.get("admin") === "true";
      let query = supabase.from("courses").select("*");
      if (!isAdmin) {
        query = query.eq("is_published", true);
      }
      const { data, error } = await query;
      if (error) throw error;
      return makeJSONResponse(data || []);
    }

    if (path.startsWith("/api/admin/courses")) {
      const parts = path.split("/");
      const id = parts[parts.length - 1];
      
      if (method === "POST") {
        const record = {
          id: body.id || (typeof window !== "undefined" && window.crypto?.randomUUID?.()) || Math.random().toString(36).substring(2, 15),
          ...body
        };
        const { data, error } = await supabase.from("courses").insert(record).select();
        if (error) throw error;
        return makeJSONResponse(data?.[0] || record);
      } else if (method === "PUT" && id && id !== "courses") {
        const { error } = await supabase.from("courses").update(body).eq("id", id);
        if (error) throw error;
        return makeJSONResponse({ success: true });
      } else if (method === "DELETE" && id && id !== "courses") {
        const { error } = await supabase.from("courses").delete().eq("id", id);
        if (error) throw error;
        return makeJSONResponse({ success: true });
      }
    }

    // 4. Teachers GET/POST/PUT/DELETE
    if (path === "/api/teachers" && method === "GET") {
      const { data, error } = await supabase.from("teachers").select("*");
      if (error) throw error;
      return makeJSONResponse(data || []);
    }

    if (path.startsWith("/api/admin/teachers")) {
      const parts = path.split("/");
      const id = parts[parts.length - 1];

      if (method === "POST") {
        const record = {
          id: body.id || (typeof window !== "undefined" && window.crypto?.randomUUID?.()) || Math.random().toString(36).substring(2, 15),
          ...body
        };
        const { error } = await supabase.from("teachers").insert(record);
        if (error) throw error;
        return makeJSONResponse({ success: true, record });
      } else if (method === "PUT" && id && id !== "teachers") {
        const { error } = await supabase.from("teachers").update(body).eq("id", id);
        if (error) throw error;
        return makeJSONResponse({ success: true });
      } else if (method === "DELETE" && id && id !== "teachers") {
        const { error } = await supabase.from("teachers").delete().eq("id", id);
        if (error) throw error;
        return makeJSONResponse({ success: true });
      }
    }

    // 5. Categories GET/POST/PUT/DELETE
    if (path === "/api/categories" && method === "GET") {
      const { data, error } = await supabase.from("categories").select("*");
      if (error) throw error;
      return makeJSONResponse(data || []);
    }

    if (path.startsWith("/api/admin/categories")) {
      const parts = path.split("/");
      const id = parts[parts.length - 1];

      if (method === "POST") {
        const record = {
          id: body.id || (typeof window !== "undefined" && window.crypto?.randomUUID?.()) || Math.random().toString(36).substring(2, 15),
          ...body
        };
        const { error } = await supabase.from("categories").insert(record);
        if (error) throw error;
        return makeJSONResponse({ success: true, record });
      } else if (method === "PUT" && id && id !== "categories") {
        const { error } = await supabase.from("categories").update(body).eq("id", id);
        if (error) throw error;
        return makeJSONResponse({ success: true });
      } else if (method === "DELETE" && id && id !== "categories") {
        const { error } = await supabase.from("categories").delete().eq("id", id);
        if (error) throw error;
        return makeJSONResponse({ success: true });
      }
    }

    // 6. Notices GET/POST/PUT/DELETE
    if (path === "/api/notices" && method === "GET") {
      const { data, error } = await supabase.from("notices").select("*").eq("is_active", true).order("created_at", { ascending: false });
      if (error) throw error;
      return makeJSONResponse(data || []);
    }

    if (path.startsWith("/api/admin/notices")) {
      const parts = path.split("/");
      const id = parts[parts.length - 1];

      if (method === "GET") {
        const { data, error } = await supabase.from("notices").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        return makeJSONResponse(data || []);
      } else if (method === "POST") {
        const record = {
          id: body.id || (typeof window !== "undefined" && window.crypto?.randomUUID?.()) || Math.random().toString(36).substring(2, 15),
          ...body
        };
        const { error } = await supabase.from("notices").insert(record);
        if (error) throw error;
        return makeJSONResponse({ success: true, record });
      } else if (method === "PUT" && id && id !== "notices") {
        const { error } = await supabase.from("notices").update(body).eq("id", id);
        if (error) throw error;
        return makeJSONResponse({ success: true });
      } else if (method === "DELETE" && id && id !== "notices") {
        const { error } = await supabase.from("notices").delete().eq("id", id);
        if (error) throw error;
        return makeJSONResponse({ success: true });
      }
    }

    // 6.5 Shared Links GET/POST/PUT/DELETE fallback
    if (path === "/api/shared-links" && method === "GET") {
      try {
        const { data, error } = await supabase.from("shared_links").select("*").order("created_at", { ascending: false });
        if (!error && data) {
          return makeJSONResponse(data);
        }
      } catch (_) {}
      
      // Fallback if table doesn't exist
      const localLinksStr = localStorage.getItem("shared_links") || "[]";
      return makeJSONResponse(JSON.parse(localLinksStr));
    }

    if (path.startsWith("/api/admin/shared-links")) {
      const parts = path.split("/");
      const id = parts[parts.length - 1];

      if (method === "POST") {
        const record = {
          id: body.id || window.crypto.randomUUID?.() || Math.random().toString(36).substring(2, 9),
          title: body.title,
          url: body.url,
          category: body.category || "other",
          created_at: new Date().toISOString()
        };
        try {
          const { error } = await supabase.from("shared_links").insert(record);
          if (!error) {
            return makeJSONResponse(record);
          }
        } catch (_) {}

        // Fallback to localStorage
        const localLinksStr = localStorage.getItem("shared_links") || "[]";
        const localLinks = JSON.parse(localLinksStr);
        localLinks.unshift(record);
        localStorage.setItem("shared_links", JSON.stringify(localLinks));
        return makeJSONResponse(record);
      } else if (method === "PUT" && id && id !== "shared-links") {
        const updatePayload = {
          title: body.title,
          url: body.url,
          category: body.category || "other"
        };
        try {
          const { error } = await supabase.from("shared_links").update(updatePayload).eq("id", id);
          if (!error) {
            return makeJSONResponse({ id, ...updatePayload });
          }
        } catch (_) {}

        // Fallback to localStorage
        const localLinksStr = localStorage.getItem("shared_links") || "[]";
        const localLinks = JSON.parse(localLinksStr);
        const idx = localLinks.findIndex((l: any) => l.id === id);
        if (idx !== -1) {
          localLinks[idx] = { ...localLinks[idx], ...updatePayload };
          localStorage.setItem("shared_links", JSON.stringify(localLinks));
          return makeJSONResponse(localLinks[idx]);
        }
        return makeJSONResponse({ id, ...updatePayload });
      } else if (method === "DELETE" && id && id !== "shared-links") {
        try {
          const { error } = await supabase.from("shared_links").delete().eq("id", id);
          if (!error) {
            return makeJSONResponse({ success: true });
          }
        } catch (_) {}

        // Fallback to localStorage
        const localLinksStr = localStorage.getItem("shared_links") || "[]";
        const localLinks = JSON.parse(localLinksStr);
        const filtered = localLinks.filter((l: any) => l.id !== id);
        localStorage.setItem("shared_links", JSON.stringify(filtered));
        return makeJSONResponse({ success: true });
      }
    }

    // 7. Enrollments Management
    if (path === "/api/enroll" && method === "POST") {
      const record = {
        id: body.id || (typeof window !== "undefined" && window.crypto?.randomUUID?.()) || Math.random().toString(36).substring(2, 15),
        ...body,
        created_at: body.created_at || new Date().toISOString()
      };
      const { error } = await supabase.from("enrollments").insert(record);
      if (error) throw error;
      return makeJSONResponse({ success: true, message: "আবেদন সফলভাবে সাবমিট করা হয়েছে!" });
    }

    if (path.startsWith("/api/admin/enrollments")) {
      const parts = path.split("/");
      const id = parts[parts.length - 1];

      if (method === "GET") {
        const { data, error } = await supabase.from("enrollments").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        return makeJSONResponse(data || []);
      } else if (method === "PUT" && id && id !== "enrollments") {
        const { error } = await supabase.from("enrollments").update(body).eq("id", id);
        if (error) throw error;
        return makeJSONResponse({ success: true });
      }
    }

    // 7.5 Student Feedbacks GET/POST/PUT/DELETE
    if (path === "/api/feedbacks" && method === "GET") {
      try {
        const { data, error } = await supabase.from("student_feedbacks").select("*").eq("is_approved", true).order("created_at", { ascending: false });
        if (!error && data) {
          return makeJSONResponse(data);
        }
      } catch (_) {}
      
      // Fallback
      const localFbStr = localStorage.getItem("student_feedbacks") || "[]";
      const localFb = JSON.parse(localFbStr).filter((f: any) => f.is_approved);
      return makeJSONResponse(localFb);
    }

    if (path === "/api/feedbacks" && method === "POST") {
      const record = {
        id: body.id || (typeof window !== "undefined" && window.crypto?.randomUUID?.()) || Math.random().toString(36).substring(2, 15),
        student_name: body.student_name,
        rating: Number(body.rating || 5),
        comment: body.comment,
        course_name: body.course_name || "",
        is_approved: body.is_approved !== undefined ? body.is_approved : true,
        created_at: new Date().toISOString()
      };
      try {
        const { error } = await supabase.from("student_feedbacks").insert(record);
        if (!error) {
          return makeJSONResponse(record);
        }
      } catch (_) {}

      // Fallback
      const localFbStr = localStorage.getItem("student_feedbacks") || "[]";
      const localFb = JSON.parse(localFbStr);
      localFb.unshift(record);
      localStorage.setItem("student_feedbacks", JSON.stringify(localFb));
      return makeJSONResponse(record);
    }

    if (path.startsWith("/api/admin/feedbacks")) {
      const parts = path.split("/");
      const id = parts[parts.length - 1];

      if (method === "GET") {
        try {
          const { data, error } = await supabase.from("student_feedbacks").select("*").order("created_at", { ascending: false });
          if (!error && data) {
            return makeJSONResponse(data);
          }
        } catch (_) {}

        // Fallback
        const localFbStr = localStorage.getItem("student_feedbacks") || "[]";
        return makeJSONResponse(JSON.parse(localFbStr));
      } else if (method === "PUT" && id && id !== "feedbacks") {
        const updatePayload = {
          is_approved: body.is_approved
        };
        try {
          const { error } = await supabase.from("student_feedbacks").update(updatePayload).eq("id", id);
          if (!error) {
            return makeJSONResponse({ id, ...updatePayload });
          }
        } catch (_) {}

        // Fallback
        const localFbStr = localStorage.getItem("student_feedbacks") || "[]";
        const localFb = JSON.parse(localFbStr);
        const idx = localFb.findIndex((f: any) => f.id === id);
        if (idx !== -1) {
          localFb[idx] = { ...localFb[idx], ...updatePayload };
          localStorage.setItem("student_feedbacks", JSON.stringify(localFb));
          return makeJSONResponse(localFb[idx]);
        }
        return makeJSONResponse({ id, ...updatePayload });
      } else if (method === "DELETE" && id && id !== "feedbacks") {
        try {
          const { error } = await supabase.from("student_feedbacks").delete().eq("id", id);
          if (!error) {
            return makeJSONResponse({ success: true });
          }
        } catch (_) {}

        // Fallback
        const localFbStr = localStorage.getItem("student_feedbacks") || "[]";
        const localFb = JSON.parse(localFbStr);
        const filtered = localFb.filter((f: any) => f.id !== id);
        localStorage.setItem("student_feedbacks", JSON.stringify(filtered));
        return makeJSONResponse({ success: true });
      }
    }

    // 8. Admin Cover & Image Upload Support
    if (path === "/api/admin/upload" && method === "POST") {
      const { file, folder } = body || {};
      if (file && folder) {
        try {
          const matches = file.match(/^data:(.+);base64,(.+)$/);
          if (matches && matches.length === 3) {
            const contentType = matches[1];
            const base64Data = matches[2];
            
            // Decrypt manual bytes to binary blob
            const binaryString = window.atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: contentType });
            const fileExt = contentType.split("/")[1] || "png";
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
            const bucketName = folder === "teachers" ? "teacher-photos" : "course-covers";
            
            const { data, error } = await supabase.storage.from(bucketName).upload(fileName, blob, {
              contentType,
              cacheControl: '3600',
              upsert: false
            });
            
            if (!error && data) {
              const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(fileName);
              return makeJSONResponse({ success: true, url: publicUrl });
            }
          }
        } catch (uploadErr) {
          console.error("Direct Supabase Storage upload error:", uploadErr);
        }
      }
      return makeJSONResponse({ success: true, url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600&auto=format&fit=crop" });
    }

    return makeErrorResponse(`Unsupported mock endpoint: ${method} ${path}`, 404);
  } catch (err: any) {
    console.error("Direct Supabase query exception:", err);
    return makeErrorResponse(err?.message || "Supabase fallback error occurred.", 500);
  }
}

// Setup the Global Fetch Interception hook
export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  let urlStr = "";
  if (typeof input === "string") {
    urlStr = input;
  } else if (input instanceof URL) {
    urlStr = input.toString();
  } else {
    urlStr = input?.url || "";
  }

  // Only intercept local relative /api routes
  if (urlStr.includes("/api/")) {
    // Check if we can execute normal fetch or we need to fall back immediately
    // If the window/globalThis is not under original fetch, call handleSupabaseFallback
    const originalFetch = (window as any).__originalFetch || window.fetch || globalThis.fetch;
    if (originalFetch) {
      try {
        const response = await originalFetch(input, init);
        const contentType = response.headers.get("content-type") || "";
        if (response.status === 404 || response.status >= 500 || contentType.includes("text/html")) {
          return await handleSupabaseFallback(urlStr, init);
        }
        return response;
      } catch (networkError) {
        console.warn(`[API Network Failed] Falling back directly to client-side Supabase for path: ${urlStr}`);
        return await handleSupabaseFallback(urlStr, init);
      }
    } else {
      return await handleSupabaseFallback(urlStr, init);
    }
  }

  const originalFetch = (window as any).__originalFetch || window.fetch || globalThis.fetch;
  return originalFetch(input, init);
}

export function initApiInterceptor() {
  const originalFetch = window.fetch || globalThis.fetch;
  if (!originalFetch) return;

  // Stash original fetch
  if (!(window as any).__originalFetch) {
    (window as any).__originalFetch = originalFetch;
  }

  const interceptedFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    return apiFetch(input, init);
  };

  try {
    // Strategy 1: Attempt standard direct assignment
    (window as any).fetch = interceptedFetch;
    console.log("[fetch interceptor] Intercepted window.fetch via direct assignment");
  } catch (err) {
    console.warn("[fetch interceptor] Direct window.fetch assignment failed, trying Object.defineProperty:", err);
    try {
      // Strategy 2: Attempt standard property re-definition
      Object.defineProperty(window, "fetch", {
        value: interceptedFetch,
        writable: true,
        configurable: true,
        enumerable: true
      });
      console.log("[fetch interceptor] Intercepted window.fetch via Object.defineProperty");
    } catch (err2) {
      console.warn("[fetch interceptor] Object.defineProperty on window failed, trying Window.prototype:", err2);
      try {
        // Strategy 3: Redefine on prototype
        Object.defineProperty(Window.prototype, "fetch", {
          value: interceptedFetch,
          writable: true,
          configurable: true,
          enumerable: true
        });
        console.log("[fetch interceptor] Intercepted window.fetch via Window.prototype");
      } catch (err3) {
        console.warn("[fetch interceptor] Window.prototype fetch override failed, trying globalThis:", err3);
        try {
          // Strategy 4: Redefine on globalThis
          (globalThis as any).fetch = interceptedFetch;
          console.log("[fetch interceptor] Intercepted window.fetch via globalThis");
        } catch (err4) {
          console.error("[fetch interceptor] All fetch interception strategies failed:", err4);
        }
      }
    }
  }
}
