import { redirect } from "react-router";
import type { Route } from "./+types/logout";
import { clearAuthCookie } from "~/lib/auth";

export async function action({ request }: Route.ActionArgs) {
  return redirect("/login", {
    headers: {
      "Set-Cookie": clearAuthCookie(),
    },
  });
}

export async function loader() {
  return redirect("/login");
}
