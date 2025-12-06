import { NextRequest, NextResponse } from 'next/server';

const STOCKFISH_API_URL = "https://stockfish.online/api/s/v2.php";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const fen = searchParams.get('fen');
  const depth = searchParams.get('depth') || '10';

  if (!fen) {
    return NextResponse.json({ error: 'FEN parameter is required' }, { status: 400 });
  }

  // Limit depth to 15 as per original backend logic
  const validDepth = Math.min(parseInt(depth as string, 10), 15);

  try {
    const apiUrl = `${STOCKFISH_API_URL}?fen=${encodeURIComponent(fen)}&depth=${validDepth}`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Stockfish API responded with status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
       return NextResponse.json({ error: "Stockfish API returned an error", details: data }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching from Stockfish API:', error);
    return NextResponse.json({ error: 'Failed to fetch best move' }, { status: 500 });
  }
}
