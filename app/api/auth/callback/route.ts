import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  // Display the code in a user-friendly way
  return new Response(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Authorization Code</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 40px auto;
            padding: 20px;
            line-height: 1.6;
          }
          .code-box {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 4px;
            word-break: break-all;
            margin: 20px 0;
          }
          .instructions {
            color: #666;
          }
        </style>
      </head>
      <body>
        <h1>Authorization Code Received</h1>
        <div class="code-box">
          <strong>Your authorization code:</strong><br>
          ${code}
        </div>
        <div class="instructions">
          <p>Please use this code to get your refresh token. The code will expire in a few minutes.</p>
          <p>Use this code in the curl command to get your refresh token:</p>
          <pre style="background: #f5f5f5; padding: 15px; border-radius: 4px; overflow-x: auto;">
curl -X POST "https://accounts.zoho.eu/oauth/v2/token" \\
  -d "grant_type=authorization_code" \\
  -d "client_id=YOUR_CLIENT_ID" \\
  -d "client_secret=YOUR_CLIENT_SECRET" \\
  -d "code=${code}" \\
  -d "redirect_uri=http://localhost:3000/api/auth/callback"</pre>
        </div>
      </body>
    </html>
  `, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
} 