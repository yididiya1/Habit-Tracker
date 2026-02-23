"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Loader2 } from "lucide-react"

interface Props {
  defaultCode?: string
  onClose: () => void
}

export default function JoinGroupModal({ defaultCode = "", onClose }: Props) {
  const router = useRouter()
  const [code, setCode] = useState(defaultCode)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ joinCode: code.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push(`/dashboard/groups/${data.groupId}`)
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid code")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <h2 className="text-base font-semibold text-zinc-100">Join a Group</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-100"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleJoin} className="space-y-4 p-6">
          <div className="space-y-1.5">
            <Label htmlFor="join-code">Enter invite code</Label>
            <Input
              id="join-code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ABC12345"
              className="font-mono tracking-widest"
              maxLength={8}
              required
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading || code.length < 6}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Join"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
