import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// manifest, icons and the service worker have to load before sign-in, or
// Android can't install the app.
const PUBLIC = [
  "/login",
  "/auth",
  "/landing",
  "/manifest.webmanifest",
  "/sw.js",
  "/offline",
  "/api/pwa-icon",
  "/api/signup",
  "/teacher/signin",
  "/api/teacher-signup",
  "/api/classroom/callback",
  "/opengraph-image",
  "/twitter-image",
  "/apple-icon",
  "/icon",
];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  // The mobile app calls /api/* with a bearer token instead of cookies; the
  // route checks it (requestAuth), so don't bounce it to the login page.
  if (pathname.startsWith("/api/") && /^Bearer\s/i.test(request.headers.get("authorization") ?? "")) {
    return response;
  }
  const isPublic = PUBLIC.some((p) => pathname.startsWith(p));

  // Signed out at the root: show the front door without changing the URL.
  if (!user && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/landing";
    return NextResponse.rewrite(url);
  }

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // A fresh account can't go anywhere until it has its own password. One
  // small query per request; profiles is own-row-only under RLS so this
  // is the user's own flag.
  if (user && !pathname.startsWith("/welcome") && !pathname.startsWith("/api/")) {
    // "*" rather than named columns so a column that isn't there yet
    // (a migration not run) can't make this read fail and skip the gate
    const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    if (p?.must_change_password) {
      const url = request.nextUrl.clone();
      url.pathname = "/welcome";
      url.search = "";
      return NextResponse.redirect(url);
    }
    // Teachers have no class or curriculum of their own: /teacher is home,
    // and until the admin approves them it's the only page.
    const waiting = p?.faculty_status && !p.is_faculty;
    if ((p?.is_faculty && pathname === "/") || (waiting && !pathname.startsWith("/teacher"))) {
      const url = request.nextUrl.clone();
      url.pathname = "/teacher";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  if (user && (pathname === "/login" || pathname === "/landing")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
