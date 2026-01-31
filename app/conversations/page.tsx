import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import ConversationsList from "./ConversationsList"

export default async function ConversationsPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/signin")
  }

  return <ConversationsList user={session.user} />
}
