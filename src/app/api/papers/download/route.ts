import { type NextRequest, NextResponse } from 'next/server'
import pastPapersData from '../../../../../public/data/past-papers.json'

const ALLOWED_HOST = 'exam.lib.ntu.edu.tw'

export async function GET(request: NextRequest) {
  const paperId = request.nextUrl.searchParams.get('id')
  if (!paperId) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  const paper = (pastPapersData.papers as { id: string; url: string | null }[]).find(
    (p) => p.id === paperId
  )
  if (!paper?.url) {
    return NextResponse.json({ error: 'Paper not found' }, { status: 404 })
  }

  const parsed = new URL(paper.url)
  if (parsed.hostname !== ALLOWED_HOST) {
    return NextResponse.json({ error: 'Invalid source' }, { status: 403 })
  }

  const upstream = await fetch(paper.url)
  if (!upstream.ok) {
    return NextResponse.json(
      { error: 'Failed to fetch PDF' },
      { status: upstream.status }
    )
  }

  const filename = `${paperId}.pdf`
  return new NextResponse(upstream.body, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
