import { redirect } from "react-router";
import type { Route } from "./+types/home";
import { getTokenFromCookie, verifyToken } from "~/lib/auth";

export function meta() {
  return [
    { title: "نظام إدارة الإيرادات" },
    { name: "description", content: "نظام متكامل لإدارة ومتابعة الإيرادات اليومية" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const token = getTokenFromCookie(cookieHeader);

  if (token) {
    const payload = await verifyToken(token);
    if (payload) {
      return redirect("/dashboard");
    }
  }

  return redirect("/login");
}

export default function Home() {
  return null;
}
