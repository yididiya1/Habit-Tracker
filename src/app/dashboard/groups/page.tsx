"use client"

import { useEffect, useState } from "react"
import { Plus, LogIn, Users, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import GroupCard from "@/components/groups/GroupCard"
import CreateGroupModal from "@/components/groups/CreateGroupModal"
import JoinGroupModal from "@/components/groups/JoinGroupModal"

interface Group {
  id: string
  name: string
  description: string | null
  emoji: string
  color: string
  endDate: string | null
  myRole: string
  habits: { id: string; name: string; type: string; color: string }[]
  members: { user: { id: string; name: string | null; image: string | null } }[]
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)

  async function load() {
    const res = await fetch("/api/groups")
    if (res.ok) setGroups(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Groups</h1>
          <p className="text-sm text-zinc-500">Track habits together, stay accountable.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowJoin(true)}>
            <LogIn className="mr-1.5 h-4 w-4" /> Join
          </Button>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> Create Group
          </Button>
        </div>
      </div>

      {/* Groups grid */}
      {loading ? (
        <div className="flex items-center gap-2 text-zinc-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-700 py-20 text-center">
          <Users className="mb-4 h-10 w-10 text-zinc-600" />
          <p className="font-medium text-zinc-400">No groups yet</p>
          <p className="mt-1 text-sm text-zinc-600">Create one or join with an invite code.</p>
          <div className="mt-5 flex gap-3">
            <Button variant="outline" size="sm" onClick={() => setShowJoin(true)}>
              <LogIn className="mr-1.5 h-4 w-4" /> Join with code
            </Button>
            <Button size="sm" onClick={() => setShowCreate(true)}>
              <Plus className="mr-1.5 h-4 w-4" /> Create Group
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((g) => <GroupCard key={g.id} group={g} />)}
        </div>
      )}

      {showCreate && <CreateGroupModal onClose={() => { setShowCreate(false); load() }} />}
      {showJoin && <JoinGroupModal onClose={() => { setShowJoin(false); load() }} />}
    </div>
  )
}
