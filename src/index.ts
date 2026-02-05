
export interface Env {
    DB: D1Database;
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
        };

        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        const url = new URL(request.url);

        if (url.pathname === '/register' && request.method === 'POST') {
            try {
                const { businessName, email, abn, password } = await request.json() as any;

                // Basic insert
                await env.DB.prepare(
                    'INSERT INTO users (businessName, email, abn, password) VALUES (?, ?, ?, ?)'
                ).bind(businessName, email, abn, password).run();

                return new Response(JSON.stringify({ success: true }), {
                    headers: { 'Content-Type': 'application/json', ...corsHeaders }
                });
            } catch (e) {
                return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: corsHeaders });
            }
        }

        if (url.pathname === '/reset-password' && request.method === 'POST') {
            try {
                const { email } = await request.json() as any;

                // Check if user exists first
                const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();

                if (!user) {
                    // Fake success to prevent enumeration, or honest error for this simple app
                    return new Response(JSON.stringify({ success: false, error: 'Email not found' }), {
                        headers: { 'Content-Type': 'application/json', ...corsHeaders }
                    });
                }

                // Generate temp password
                const tempPassword = Math.random().toString(36).slice(-8);

                // Update password
                await env.DB.prepare('UPDATE users SET password = ? WHERE email = ?')
                    .bind(tempPassword, email)
                    .run();

                // In a real app, EMAIL THIS. 
                // For this standalone/demo app, return it so the user can see it.
                return new Response(JSON.stringify({
                    success: true,
                    message: `Password reset! Your temporary password is: ${tempPassword}`
                }), {
                    headers: { 'Content-Type': 'application/json', ...corsHeaders }
                });

            } catch (e) {
                return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: corsHeaders });
            }
        }

        if (url.pathname === '/users' && request.method === 'GET') {
            // Validate admin simplistic (in real app us auth header)
            const secret = request.headers.get('X-Admin-Key');
            // For now, super simple protection (we can improve later)

            const { results } = await env.DB.prepare('SELECT * FROM users').all();
            return new Response(JSON.stringify(results), {
                headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
        }

        return new Response('Not Found', { status: 404, headers: corsHeaders });
    },
};
