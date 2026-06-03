'use client'

import { useEffect, useState } from 'react'
import { SyncPanel } from '@/components/sync/sync-panel'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { isAuthenticated } from '@/lib/auth'
import type { Note } from '@/lib/sync'
import { createNote, deleteNote, fetchNotes, updateNote } from '@/lib/sync'

export default function NotesPage() {
  const [authed, setAuthed] = useState(false)
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newContent, setNewContent] = useState('')
  const [newTags, setNewTags] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [editTags, setEditTags] = useState('')

  useEffect(() => {
    setAuthed(isAuthenticated())
  }, [])

  async function loadNotes() {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchNotes()
      setNotes(data)
    } catch (e) {
      setError('載入失敗，請確認已登入')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authed) loadNotes()
  }, [authed])

  async function handleCreate() {
    if (!newContent.trim()) return
    const tags = newTags
      .split(/[,，\s]+/)
      .map((t) => t.trim())
      .filter(Boolean)
    try {
      const note = await createNote(newContent, tags)
      setNotes([note, ...notes])
      setNewContent('')
      setNewTags('')
    } catch {
      setError('新增失敗')
    }
  }

  async function handleUpdate(id: string) {
    const tags = editTags
      .split(/[,，\s]+/)
      .map((t) => t.trim())
      .filter(Boolean)
    try {
      const updated = await updateNote(id, editContent, tags)
      setNotes(notes.map((n) => (n.id === id ? updated : n)))
      setEditingId(null)
    } catch {
      setError('更新失敗')
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteNote(id)
      setNotes(notes.filter((n) => n.id !== id))
    } catch {
      setError('刪除失敗')
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">時事筆記</h1>
        <p className="text-muted-foreground text-sm mt-1">
          記錄科技時事、考試重點、個人心得，同步至雲端
        </p>
      </div>

      <SyncPanel onAuthChange={setAuthed} />

      {authed ? (
        <>
          {/* New note form */}
          <div className="rounded-lg border p-4 space-y-3">
            <h2 className="text-sm font-medium">新增筆記</h2>
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="輸入時事內容或備考心得…"
              rows={3}
              className="w-full text-sm bg-background border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
            <div className="flex gap-2">
              <input
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                placeholder="標籤（逗號分隔）：AI, ESG, MIS…"
                className="flex-1 text-sm bg-background border rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <Button onClick={handleCreate} disabled={!newContent.trim()}>
                新增
              </Button>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          {loading ? (
            <p className="text-muted-foreground text-sm">載入中…</p>
          ) : (
            <ul className="space-y-3">
              {notes.length === 0 ? (
                <li className="text-center py-8 text-muted-foreground text-sm">
                  尚無筆記，新增第一則吧
                </li>
              ) : (
                notes.map((note) => (
                  <li key={note.id} className="rounded-lg border p-4 space-y-2">
                    {editingId === note.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={3}
                          className="w-full text-sm bg-background border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                        />
                        <div className="flex gap-2">
                          <input
                            value={editTags}
                            onChange={(e) => setEditTags(e.target.value)}
                            className="flex-1 text-sm bg-background border rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring"
                          />
                          <Button size="sm" onClick={() => handleUpdate(note.id)}>
                            儲存
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                            取消
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                        {note.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {note.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            {new Date(note.updatedAt).toLocaleDateString('zh-TW', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingId(note.id)
                                setEditContent(note.content)
                                setEditTags(note.tags.join(', '))
                              }}
                              className="hover:text-foreground transition-colors"
                            >
                              編輯
                            </button>
                            <button
                              onClick={() => handleDelete(note.id)}
                              className="hover:text-destructive transition-colors"
                            >
                              刪除
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </li>
                ))
              )}
            </ul>
          )}
        </>
      ) : (
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          <p className="text-sm">請先在上方輸入通行碼以存取雲端筆記</p>
          <p className="text-xs mt-1">未登入時可在本地使用備考計畫和閃卡功能</p>
        </div>
      )}
    </div>
  )
}
