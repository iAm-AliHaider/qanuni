import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";

export async function POST(request: NextRequest) {
  const { room, identity, userId } = await request.json();
  
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  
  if (!apiKey || !apiSecret) {
    return NextResponse.json({ error: "LiveKit not configured" }, { status: 500 });
  }

  const token = new AccessToken(apiKey, apiSecret, {
    identity,
    metadata: JSON.stringify({ user_id: userId }),
  });
  token.addGrant({ room, roomJoin: true, canPublish: true, canSubscribe: true });

  return NextResponse.json({ token: await token.toJwt() });
}
