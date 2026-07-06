import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { copyResponseCookies } from "./cookies";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes — redirect to login if not authenticated
  const protectedPaths = ["/onboarding", "/deck", "/queue", "/dashboard", "/profile", "/settings"];
  const isProtected = protectedPaths.some((p) => request.nextUrl.pathname.startsWith(p));

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    const redirect = NextResponse.redirect(url);
    copyResponseCookies(supabaseResponse.cookies, redirect.cookies);
    return redirect;
  }

  // If logged in, check if profile exists (skip for onboarding itself and API routes)
  if (user && isProtected && request.nextUrl.pathname !== "/onboarding") {
    // Use a cookie cache to avoid DB hit on every request
    const hasProfileCookie = request.cookies.get("x-has-profile")?.value;

    if (hasProfileCookie !== "1") {
      // Check DB for profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("structured_profile")
        .eq("id", user.id)
        .single();

      if (!profile?.structured_profile) {
        // No profile — redirect to onboarding
        const url = request.nextUrl.clone();
        url.pathname = "/onboarding";
        const redirect = NextResponse.redirect(url);
        copyResponseCookies(supabaseResponse.cookies, redirect.cookies);
        return redirect;
      }

      // Profile exists — set cookie so we don't check again this session
      supabaseResponse.cookies.set("x-has-profile", "1", {
        path: "/",
        maxAge: 60 * 60 * 24, // 24 hours
        httpOnly: false,
      });
    }
  }

  // If logged in and hitting login/signup, redirect appropriately
  if (user && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = "/deck";
    const redirect = NextResponse.redirect(url);
    copyResponseCookies(supabaseResponse.cookies, redirect.cookies);
    return redirect;
  }

  return supabaseResponse;
}
