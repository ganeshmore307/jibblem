import { redirect } from "next/navigation";
import { currentMember } from "@/lib/auth";

export default function Home() {
  redirect(currentMember() ? "/dashboard" : "/login");
}
