import { NextResponse } from 'next/server'
import { isAuthed, withAuth } from '@/lib/api-auth'
import type { CustomTask, DailyLearningRecord } from '@/types/storage'

export async function GET(request: Request) {
  const ctx = await withAuth(request)
  if (!isAuthed(ctx)) return ctx

  const [completedRows, customRows, dailyRows] = await Promise.all([
    ctx.db
      .prepare('SELECT task_id, done FROM user_completed_tasks WHERE user_id = ?')
      .bind(ctx.user.id)
      .all<{ task_id: string; done: number }>(),
    ctx.db
      .prepare(
        'SELECT id, phase_id, exam_id, description, subject_tag, created_at FROM user_custom_tasks WHERE user_id = ? ORDER BY created_at'
      )
      .bind(ctx.user.id)
      .all<{
        id: string
        phase_id: string
        exam_id: string
        description: string
        subject_tag: string | null
        created_at: number
      }>(),
    ctx.db
      .prepare('SELECT record_key, data FROM user_daily_learning WHERE user_id = ?')
      .bind(ctx.user.id)
      .all<{ record_key: string; data: string }>(),
  ])

  const completedTasks: Record<string, boolean> = {}
  for (const row of completedRows.results) {
    completedTasks[row.task_id] = !!row.done
  }

  const customTasks: CustomTask[] = customRows.results.map((row) => ({
    id: row.id,
    phaseId: row.phase_id,
    examId: row.exam_id as CustomTask['examId'],
    description: row.description,
    ...(row.subject_tag ? { subjectTag: row.subject_tag } : {}),
    createdAt: row.created_at,
  }))

  const dailyLearning: Record<string, DailyLearningRecord> = {}
  for (const row of dailyRows.results) {
    dailyLearning[row.record_key] = JSON.parse(row.data)
  }

  return NextResponse.json({ completedTasks, customTasks, dailyLearning })
}

export async function POST(request: Request) {
  const ctx = await withAuth(request)
  if (!isAuthed(ctx)) return ctx

  const body: {
    action: string
    taskId?: string
    done?: boolean
    customTask?: CustomTask
    updates?: Partial<Pick<CustomTask, 'description' | 'subjectTag'>>
    recordKey?: string
    dailyLearning?: DailyLearningRecord
  } = await request.json()

  switch (body.action) {
    case 'completeTask': {
      if (!body.taskId) return NextResponse.json({ error: 'taskId required' }, { status: 400 })
      if (body.done === false) {
        await ctx.db
          .prepare('DELETE FROM user_completed_tasks WHERE user_id = ? AND task_id = ?')
          .bind(ctx.user.id, body.taskId)
          .run()
      } else {
        await ctx.db
          .prepare(
            `INSERT INTO user_completed_tasks (user_id, task_id, done) VALUES (?, ?, 1)
             ON CONFLICT(user_id, task_id) DO UPDATE SET done = 1`
          )
          .bind(ctx.user.id, body.taskId)
          .run()
      }
      return NextResponse.json({ ok: true })
    }

    case 'addCustomTask': {
      const t = body.customTask
      if (!t) return NextResponse.json({ error: 'customTask required' }, { status: 400 })
      await ctx.db
        .prepare(
          'INSERT INTO user_custom_tasks (user_id, id, phase_id, exam_id, description, subject_tag, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
        )
        .bind(ctx.user.id, t.id, t.phaseId, t.examId, t.description, t.subjectTag ?? null, t.createdAt)
        .run()
      return NextResponse.json({ ok: true })
    }

    case 'updateCustomTask': {
      if (!body.taskId || !body.updates)
        return NextResponse.json({ error: 'taskId and updates required' }, { status: 400 })
      const sets: string[] = []
      const vals: (string | null)[] = []
      if (body.updates.description !== undefined) {
        sets.push('description = ?')
        vals.push(body.updates.description)
      }
      if (body.updates.subjectTag !== undefined) {
        sets.push('subject_tag = ?')
        vals.push(body.updates.subjectTag ?? null)
      }
      if (sets.length > 0) {
        await ctx.db
          .prepare(
            `UPDATE user_custom_tasks SET ${sets.join(', ')} WHERE user_id = ? AND id = ?`
          )
          .bind(...vals, ctx.user.id, body.taskId)
          .run()
      }
      return NextResponse.json({ ok: true })
    }

    case 'removeCustomTask': {
      if (!body.taskId) return NextResponse.json({ error: 'taskId required' }, { status: 400 })
      await ctx.db
        .prepare('DELETE FROM user_custom_tasks WHERE user_id = ? AND id = ?')
        .bind(ctx.user.id, body.taskId)
        .run()
      return NextResponse.json({ ok: true })
    }

    case 'saveDailyLearning': {
      if (!body.recordKey || !body.dailyLearning)
        return NextResponse.json({ error: 'recordKey and dailyLearning required' }, { status: 400 })
      await ctx.db
        .prepare(
          `INSERT INTO user_daily_learning (user_id, record_key, data, updated_at) VALUES (?, ?, ?, ?)
           ON CONFLICT(user_id, record_key) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`
        )
        .bind(ctx.user.id, body.recordKey, JSON.stringify(body.dailyLearning), Date.now())
        .run()
      return NextResponse.json({ ok: true })
    }

    default:
      return NextResponse.json({ error: 'unknown action' }, { status: 400 })
  }
}
