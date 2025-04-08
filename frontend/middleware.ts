import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value; // Get the access token from cookies
  const url = req.nextUrl.clone();

  //   if token expire
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1])); // Decode the JWT payload
      const isExpired = payload.exp * 1000 < Date.now(); // Check if the token is expired
      if (isExpired) {
        url.pathname = "/sign-in"; // Redirect to /sign-in if token is expired
        return NextResponse.redirect(url);
      }
    } catch (error) {
      console.error("Invalid token:", error);
      url.pathname = "/sign-in"; // Redirect to /sign-in if token is invalid
      return NextResponse.redirect(url);
    }
  }

  // Check if the user is trying to access /home without being logged in
  if (!token && url.pathname === "/home") {
    url.pathname = "/sign-in"; // Redirect to /sign-in
    return NextResponse.redirect(url);
  }

  console.log("mingza1236", token, url.pathname);

  if (token && (url.pathname === "/sign-in" || url.pathname === "/sign-up")) {
    url.pathname = "/home"; // Redirect to /home if already logged in
    console.log("mingza1236");
    return NextResponse.redirect(url);
  }

  return NextResponse.next(); // Allow the request to proceed
}

// Apply middleware to specific routes
export const config = {
  matcher: ["/home", "/sign-in", "/sign-up"], // Apply middleware to /home, /sign-in, and /sign-up
};
