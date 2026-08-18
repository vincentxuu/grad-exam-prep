'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/lib/auth-context'
import type { Note } from '@/lib/sync'
import { createNote, deleteNote, fetchNotes, updateNote } from '@/lib/sync'

export default function NotesPage() {
  const { user } = useAuth()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newContent, setNewContent] = useState('')
  const [newTags, setNewTags] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [editTags, setEditTags] = useState('')

  async function loadNotes() {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchNotes()
      setNotes(data)
    } catch {
      setError('載入失敗，請確認已登入')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) loadNotes()
  }, [user])

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
        <h1 className="text-2xl font-bold font-display">時事筆記</h1>
        <p className="text-muted-foreground text-sm mt-1">
          記錄科技時事、考試重點、個人心得，同步至雲端
        </p>
      </div>

      {user ? (
        <>
          <div className="rounded-lg border p-4 space-y-3">
            <h2 className="text-sm font-medium">新增筆記</h2>
            <Textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="輸入時事內容或備考心得…"
              rows={3}
            />
            <div className="flex gap-2">
              <Input
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                placeholder="標籤（逗號分隔）：AI, ESG, MIS…"
                className="flex-1"
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
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Input
                            value={editTags}
                            onChange={(e) => setEditTags(e.target.value)}
                            className="flex-1"
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
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={() => {
                                setEditingId(note.id)
                                setEditContent(note.content)
                                setEditTags(note.tags.join(', '))
                              }}
                            >
                              編輯
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs text-destructive hover:text-destructive"
                              onClick={() => handleDelete(note.id)}
                            >
                              刪除
                            </Button>
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
          <p className="text-sm">請先登入以存取雲端筆記</p>
          <p className="text-xs mt-1">點右上角「登入」按鈕</p>
        </div>
      )}
    </div>
  )
}
