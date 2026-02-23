"use client"

import { useState } from "react"
import { MessageSquare, X, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  text: string
  sender: string
  time: string
}

// Note: This is a UI-only chat panel using local state.
// To add real-time persistence, connect to a WebSocket or Pusher channel.
export default function GroupChatPanel({ groupId, groupName }: { groupId: string; groupName: string }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")

  function sendMessage() {
    if (!input.trim()) return
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), text: input.trim(), sender: "You", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
    ])
    setInput("")
  }

  return (
    <>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpen(true)} title="Group chat">
        <MessageSquare className="h-4 w-4" />
      </Button>

      {/* Slide-in panel */}
      <div className={cn(
        "fixed inset-y-0 right-0 z-50 flex w-80 flex-col border-l border-zinc-800 bg-zinc-900 shadow-2xl transition-transform duration-300",
        open ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-zinc-100">Group Chat</p>
            <p className="text-xs text-zinc-500">{groupName}</p>
          </div>
          <button onClick={() => setOpen(false)} className="text-zinc-500 hover:text-zinc-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <p className="text-center text-xs text-zinc-600 mt-8">No messages yet. Say something!</p>
          ) : messages.map((m) => (
            <div key={m.id} className={cn("flex flex-col", m.sender === "You" ? "items-end" : "items-start")}>
              <div className={cn("max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                m.sender === "You" ? "bg-indigo-600 text-white rounded-tr-none" : "bg-zinc-800 text-zinc-200 rounded-tl-none")}>
                {m.text}
              </div>
              <span className="mt-0.5 text-[10px] text-zinc-600">{m.sender} · {m.time}</span>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="border-t border-zinc-800 p-3">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message…"
              className="flex-1 text-sm"
            />
            <Button size="icon" onClick={sendMessage} disabled={!input.trim()} className="h-9 w-9 flex-shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {open && <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setOpen(false)} />}
    </>
  )
}
