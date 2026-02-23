"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Loader2, Trash2, Shield, UserMinus } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface Group {
  id: string
  name: string
  description: string | null
  emoji: string
  color: string
  endDate: string | null
  myRole: string
  members: { role: string; user: { id: string; name: string | null; image: string | null } }[]
}

export default function GroupSettingsPanel({ group, onClose, onUpdate }: { group: Group; onClose: () => void; onUpdate: () => void }) {
  const router = useRouter()
  const [name, setName] = useState(group.name)
  const [description, setDescription] = useState(group.description ?? "")
  const [endDate, setEndDate] = useState(group.endDate ? group.endDate.split("T")[0] : "")
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleSave() {
    setSaving(true)
    await fetch(`/api/groups/${group.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, endDate: endDate || null }),
    })
    setSaving(false)
    onUpdate()
    onClose()
  }

  async function handleDelete() {
    if (!confirm(`Delete "${group.name}"? This cannot be undone.`)) return
    setDeleting(true)
    await fetch(`/api/groups/${group.id}`, { method: "DELETE" })
    router.push("/dashboard/groups")
  }

  async function changeRole(userId: string, role: string) {
    await fetch(`/api/groups/${group.id}/members/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    })
    onUpdate()
  }

  async function removeMember(userId: string) {
    if (!confirm("Remove this member?")) return
    await fetch(`/api/groups/${group.id}/members/${userId}`, { method: "DELETE" })
    onUpdate()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4 sticky top-0 bg-zinc-900">
          <h2 className="text-base font-semibold">Group Settings</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-100"><X className="h-4 w-4" /></button>
        </div>

        <div className="space-y-6 p-6">
          {/* Basic info */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Group Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" />
            </div>
            <div className="space-y-1.5">
              <Label>Challenge End Date</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-48" />
            </div>
            <Button onClick={handleSave} disabled={saving} size="sm">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
            </Button>
          </div>

          {/* Member management */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">Members</p>
            <div className="space-y-2">
              {group.members.map((m) => (
                <div key={m.user.id} className="flex items-center gap-3 rounded-xl bg-zinc-800/40 px-3 py-2">
                  {m.user.image ? (
                    <Image src={m.user.image} alt={m.user.name ?? ""} width={26} height={26} className="rounded-full" />
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-700 text-xs text-zinc-300">{m.user.name?.[0]}</div>
                  )}
                  <span className="flex-1 text-sm text-zinc-200 truncate">{m.user.name}</span>
                  <span className={cn("rounded-full px-1.5 py-0.5 text-[10px]",
                    m.role === "OWNER" ? "bg-amber-900/40 text-amber-400" :
                    m.role === "ADMIN" ? "bg-indigo-900/40 text-indigo-400" : "bg-zinc-700/60 text-zinc-400")}>
                    {m.role}
                  </span>
                  {group.myRole === "OWNER" && m.role !== "OWNER" && (
                    <div className="flex gap-1">
                      <button onClick={() => changeRole(m.user.id, m.role === "ADMIN" ? "MEMBER" : "ADMIN")}
                        title={m.role === "ADMIN" ? "Demote to member" : "Promote to admin"}
                        className="text-zinc-600 hover:text-indigo-400 transition-colors">
                        <Shield className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => removeMember(m.user.id)}
                        className="text-zinc-600 hover:text-red-400 transition-colors">
                        <UserMinus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Danger zone */}
          {group.myRole === "OWNER" && (
            <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-4">
              <p className="mb-3 text-xs font-semibold text-red-400">Danger Zone</p>
              <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Trash2 className="mr-2 h-4 w-4" /> Delete Group</>}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
