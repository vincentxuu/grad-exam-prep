import { fireEvent, render, screen } from '@testing-library/react'
import {
  DailyReflectionForm,
  TaskEvidenceForm,
} from '@/components/study-plan/learning-evidence-forms'

describe('TaskEvidenceForm', () => {
  it('forces a retest below 80% and saves the evidence', () => {
    const onSave = jest.fn(() => true)
    render(
      <TaskEvidenceForm
        taskId="task-1"
        today={new Date(2026, 7, 16)}
        onCancel={() => {}}
        onSave={onSave}
      />
    )

    fireEvent.change(screen.getByLabelText(/自測正確率/), { target: { value: '79' } })
    fireEvent.change(screen.getByLabelText('完成證據'), {
      target: { value: '閉卷答對四題，但流程仍不穩' },
    })
    fireEvent.click(screen.getByRole('button', { name: '儲存成果' }))

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        taskId: 'task-1',
        accuracy: 79,
        needsRetest: true,
        retestAt: '2026-08-19',
      })
    )
  })

  it('allows an 80% result with evidence to complete without a retest', () => {
    const onSave = jest.fn(() => true)
    render(
      <TaskEvidenceForm
        taskId="task-1"
        today={new Date(2026, 7, 16)}
        onCancel={() => {}}
        onSave={onSave}
      />
    )

    fireEvent.change(screen.getByLabelText(/自測正確率/), { target: { value: '80' } })
    fireEvent.change(screen.getByLabelText('完成證據'), {
      target: { value: '白紙重建成功並答對 4/5 題' },
    })
    fireEvent.click(screen.getByRole('button', { name: '儲存成果' }))

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ accuracy: 80, needsRetest: false })
    )
  })
})

describe('DailyReflectionForm', () => {
  it('requires recall accuracy and tomorrow question before saving', () => {
    const onSave = jest.fn(() => true)
    render(<DailyReflectionForm onSave={onSave} />)
    const saveButton = screen.getByRole('button', { name: '儲存今日紀錄' })
    expect((saveButton as HTMLButtonElement).disabled).toBe(true)

    fireEvent.change(screen.getByLabelText('今日回想正確率'), { target: { value: '75' } })
    fireEvent.change(screen.getByLabelText('明天開始時先回答什麼？'), {
      target: { value: '為什麼需要 virtual memory？' },
    })
    fireEvent.change(screen.getByLabelText('今天完成的輸出'), {
      target: { value: 'whiteboard' },
    })
    fireEvent.click(saveButton)

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        recallAccuracy: 75,
        outputKind: 'whiteboard',
        tomorrowQuestion: '為什麼需要 virtual memory？',
      })
    )
    expect(screen.queryByText('今日紀錄已儲存')).not.toBeNull()
  })
})
