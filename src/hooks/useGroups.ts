'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { GroupWithMeta, GroupRole } from '@/lib/group-types'
import { generateInviteCode } from '@/lib/group-types'

export function useGroups() {
  const { user } = useAuth()
  const [groups, setGroups] = useState<GroupWithMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGroups = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }
    setError(null)

    const { data: memberships, error: memErr } = await supabase
      .from('group_members')
      .select('role, group_id')
      .eq('user_id', user.id)

    if (memErr) {
      setError(memErr.message)
      setLoading(false)
      return
    }

    const groupIds = memberships?.map((m) => m.group_id) ?? []

    if (groupIds.length === 0) {
      setGroups([])
      setLoading(false)
      return
    }

    const [{ data: groupsData, error: groupsErr }, { data: allMembers }] = await Promise.all([
      supabase.from('groups').select('*').in('id', groupIds),
      supabase.from('group_members').select('group_id').in('group_id', groupIds),
    ])

    if (groupsErr) {
      setError(groupsErr.message)
      setLoading(false)
      return
    }

    const countMap: Record<string, number> = {}
    for (const m of allMembers ?? []) {
      countMap[m.group_id] = (countMap[m.group_id] ?? 0) + 1
    }

    const roleMap: Record<string, GroupRole> = {}
    for (const m of memberships ?? []) {
      roleMap[m.group_id] = m.role as GroupRole
    }

    setGroups(
      (groupsData ?? []).map((g) => ({
        ...g,
        invite_code: g.invite_code ?? null,
        member_count: countMap[g.id] ?? 0,
        my_role: roleMap[g.id] ?? 'editor',
      }))
    )
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  async function createGroup(name: string): Promise<{ groupId: string | null; error: string | null }> {
    if (!user) return { groupId: null, error: 'Nicht eingeloggt' }

    let code = generateInviteCode()
    let attempts = 0
    let groupId: string | null = null

    while (attempts < 5) {
      const { data: group, error: insertErr } = await supabase
        .from('groups')
        .insert({ name, created_by: user.id, invite_code: code })
        .select('id')
        .single()

      if (!insertErr && group) {
        groupId = group.id
        break
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((insertErr as any)?.code === '23505') {
        code = generateInviteCode()
        attempts++
      } else {
        return { groupId: null, error: insertErr?.message ?? 'Gruppe konnte nicht erstellt werden' }
      }
    }

    if (!groupId) return { groupId: null, error: 'Fehler beim Generieren des Einladungs-Codes' }

    const { error: memberErr } = await supabase
      .from('group_members')
      .insert({ group_id: groupId, user_id: user.id, role: 'admin' })

    if (memberErr) {
      // Cleanup is not possible client-side (RLS blocks group DELETE without admin membership).
      // This path is extremely rare; the orphaned group is invisible to all users via RLS.
      return { groupId: null, error: memberErr.message }
    }

    await fetchGroups()
    return { groupId, error: null }
  }

  async function joinGroup(code: string): Promise<{ groupId: string | null; error: string | null }> {
    if (!user) return { groupId: null, error: 'Nicht eingeloggt' }

    const { data, error: rpcErr } = await supabase.rpc('join_group_by_invite_code', {
      p_invite_code: code.trim(),
    })

    if (rpcErr) return { groupId: null, error: rpcErr.message }

    const result = data as { group_id?: string; error?: string }

    if (result.error === 'invalid_code') return { groupId: null, error: 'Ungültiger Einladungs-Code' }
    if (result.error === 'already_member') return { groupId: null, error: 'Du bist bereits Mitglied dieser Gruppe' }
    if (result.error === 'not_active') return { groupId: null, error: 'Bitte bestätige zuerst deine E-Mail-Adresse' }
    if (result.error) return { groupId: null, error: result.error }

    await fetchGroups()
    return { groupId: result.group_id ?? null, error: null }
  }

  return { groups, loading, error, refetch: fetchGroups, createGroup, joinGroup }
}
