import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import StartChatForm from "./StartChatForm"

export default async function StartChatPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/signin")
  }

  return <StartChatForm user={session.user} />
}

