"use server";

import { cookies } from "next/headers";
import { createServerSupabaseClient } from "@/lib/supabase";
import { redirect } from "next/navigation";

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Email and password are required" };
  }

  const supabase = createServerSupabaseClient();
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });

  if (authError || !authData.user) {
    return { success: false, error: "Invalid email or password" };
  }

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("role")
    .eq("email", email)
    .single();

  if (userError || !userData) {
    return { success: false, error: "User role not found" };
  }

  cookies().set("user_role", userData.role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return { success: true, role: userData.role };
}

export async function signOut() {
  const supabase = createServerSupabaseClient();
  await supabase.auth.signOut();
  cookies().delete("user_role");
  redirect("/");
}

export async function getUserRole() {
  const role = cookies().get("user_role")?.value;
  return role || null;
}
