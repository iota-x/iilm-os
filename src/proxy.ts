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
  "/api/pwa-icon",
  "/api/signup",
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
    const { data: p } = await supabase
      .from("profiles")
      .select("must_change_password")
      .eq("id", user.id)
      .maybeSingle();
    if (p?.must_change_password) {
      const url = request.nextUrl.clone();
      url.pathname = "/welcome";
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
