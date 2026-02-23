"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import { MessageSquare, X, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface ChatMessage {
  id: string
  text: string
  createdAt: string
  user: { id: string; name: string | null; image: string | null }
}

const POLL_MS = 3000

export default function GroupChatPanel({ groupId, groupName }: { groupId: string; groupName: string }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [myUserId, setMyUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const lastIdRef = useRef<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Fetch session once on mount
  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((s) => setMyUserId(s?.user?.id ?? null))
  }, [])

  const fetchMessages = useCallback(async (initial = false) => {
    if (initial) setLoading(true)
    try {
      const url = !initial && lastIdRef.current
        ? `/api/groups/${groupId}/messages?cursor=${lastIdRef.current}`
        : `/api/groups/${groupId}/messages`
      const res = await fetch(url)
      if (!res.ok) return
      const data: ChatMessage[] = await res.json()
      if (data.length === 0) return
      setMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m.id))
        const newOnes = data.filter((m) => !existingIds.has(m.id))
        return newOnes.length > 0 ? [...prev, ...newOnes] : prev
      })
      lastIdRef.current = data[data.length - 1].id
    } finally {
      if (initial) setLoading(false)
    }
  }, [groupId])

  // Start/stop polling when panel opens or closes
  useEffect(() => {
    if (open) {
      fetchMessages(true)
      pollRef.current = setInterval(() => fetchMessages(false), POLL_MS)
    } else {
      if (pollRef.current) clearInterval(pollRef.current)
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [open, fetchMessages])

  // Scroll to bottom whenever messages change and panel is open
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, open])

  async function sendMessage() {
    const text = input.trim()
    if (!text || sending) return
    setSending(true)
    setInput("")
    try {
      const res = await fetch(`/api/groups/${groupId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })
      if (res.ok) {
        const msg: ChatMessage = await res.json()
        setMessages((prev) => {
          if (prev.find((m) => m.id === msg.id)) return prev
          return [...prev, msg]
        })
        lastIdRef.current = msg.id
      }
    } finally {
      setSending(false)
    }
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
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
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center pt-8">
              <Loader2 className="h-5 w-5 animate-spin text-zinc-600" />
            </div>
          ) : messages.length === 0 ? (
            <p className="mt-8 text-center text-xs text-zinc-600">No messages yet. Say something!</p>
          ) : (
            <div className="space-y-3">
              {messages.map((m) => {
                const isMe = m.user.id === myUserId
                return (
                  <div key={m.id} className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                    {/* Avatar + name for others */}
                    {!isMe && (
                      <div className="mb-1 flex items-center gap-1.5">
                        {m.user.image ? (
                          <Image src={m.user.image} alt={m.user.name ?? ""} width={16} height={16} className="rounded-full" />
                        ) : (
                          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-zinc-700 text-[9px] font-bold text-zinc-300">
                            {m.user.name?.[0] ?? "?"}
                          </div>
                        )}
                        <span className="text-[10px] text-zinc-500">{m.user.name?.split(" ")[0] ?? "User"}</span>
                      </div>
                    )}
                    <div className={cn(
                      "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                      isMe ? "bg-indigo-600 text-white rounded-tr-none" : "bg-zinc-800 text-zinc-200 rounded-tl-none"
                    )}>
                      {m.text}
                    </div>
                    <span className="mt-0.5 text-[10px] text-zinc-600">{formatTime(m.createdAt)}</span>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>
          )}
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
              disabled={sending}
            />
            <Button size="icon" onClick={sendMessage} disabled={!input.trim() || sending} className="h-9 w-9 flex-shrink-0">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {open && <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setOpen(false)} />}
    </>
  )
}
