import { NextRequest, NextResponse } from "next/server"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params
  const body = await req.json()

  const backendRes = await fetch(
    `${process.env.BACKEND_URL}/auth/oauth/${provider}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  )

  const text = await backendRes.text()
  const res = new NextResponse(text, {
    status: backendRes.status,
    headers: { "Content-Type": "application/json" },
  })

  // Forward the refresh_token httpOnly cookie set by the backend
  const setCookie = backendRes.headers.get("set-cookie")
  if (setCookie) res.headers.set("set-cookie", setCookie)

  return res
}
