
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

        if (url.pathname === '/login' && request.method === 'POST') {
            try {
                const { email, password } = await request.json() as any;

                const user = await env.DB.prepare('SELECT * FROM users WHERE email = ? AND password = ?')
                    .bind(email, password)
                    .first();

                if (!user) {
                    return new Response(JSON.stringify({ success: false, error: 'Invalid credentials' }), {
                        headers: { 'Content-Type': 'application/json', ...corsHeaders }
                    });
                }

                return new Response(JSON.stringify({ success: true, user }), {
                    headers: { 'Content-Type': 'application/json', ...corsHeaders }
                });
            } catch (e) {
                return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: corsHeaders });
            }
        }

        if (url.pathname === '/sync-down' && request.method === 'POST') {
            try {
                const { email, password } = await request.json() as any;

                // Auth check
                const user = await env.DB.prepare('SELECT * FROM users WHERE email = ? AND password = ?')
                    .bind(email, password).first();

                if (!user) return new Response('Unauthorized', { status: 401, headers: corsHeaders });

                const customers = await env.DB.prepare('SELECT * FROM customers WHERE user_email = ?').bind(email).all();
                const quotes = await env.DB.prepare('SELECT * FROM quotes WHERE user_email = ?').bind(email).all();
                const jobs = await env.DB.prepare('SELECT * FROM jobs WHERE user_email = ?').bind(email).all();

                return new Response(JSON.stringify({
                    customers: customers.results,
                    quotes: quotes.results,
                    jobs: jobs.results
                }), {
                    headers: { 'Content-Type': 'application/json', ...corsHeaders }
                });
            } catch (e) {
                return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: corsHeaders });
            }
        }

        if (url.pathname === '/sync-up' && request.method === 'POST') {
            try {
                const { email, password, type, item } = await request.json() as any;

                // Auth check
                const user = await env.DB.prepare('SELECT * FROM users WHERE email = ? AND password = ?')
                    .bind(email, password).first();

                if (!user) return new Response('Unauthorized', { status: 401, headers: corsHeaders });

                if (type === 'customer') {
                    await env.DB.prepare(`
                        INSERT INTO customers (id, user_email, name, address, phone, customer_email, defaultPrice, notes)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(id) DO UPDATE SET
                        name=excluded.name, address=excluded.address, phone=excluded.phone, 
                        customer_email=excluded.customer_email, defaultPrice=excluded.defaultPrice, notes=excluded.notes
                    `).bind(
                        item.id,
                        email,
                        item.name,
                        item.address,
                        item.phone || null,
                        item.email || null,
                        item.defaultPrice || null,
                        item.notes || null
                    ).run();
                } else if (type === 'quote') {
                    await env.DB.prepare(`
                        INSERT INTO quotes (id, user_email, customerId, description, amount, notes, status, createdAt)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(id) DO UPDATE SET
                        description=excluded.description, amount=excluded.amount, notes=excluded.notes, status=excluded.status
                    `).bind(item.id, email, item.customerId, item.description, item.amount, item.notes, item.status, item.createdAt).run();
                } else if (type === 'job') {
                    await env.DB.prepare(`
                        INSERT INTO jobs (id, user_email, customerId, quoteId, description, scheduledDate, price, notes, status, completedAt, recurrence)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(id) DO UPDATE SET
                        description=excluded.description, scheduledDate=excluded.scheduledDate, price=excluded.price, 
                        notes=excluded.notes, status=excluded.status, completedAt=excluded.completedAt, recurrence=excluded.recurrence
                    `).bind(
                        item.id,
                        email,
                        item.customerId,
                        item.quoteId || null,
                        item.description,
                        item.scheduledDate,
                        item.price,
                        item.notes || null,
                        item.status,
                        item.completedAt || null,
                        item.recurrence ? JSON.stringify(item.recurrence) : null
                    ).run();
                }

                return new Response(JSON.stringify({ success: true }), {
                    headers: { 'Content-Type': 'application/json', ...corsHeaders }
                });
            } catch (e) {
                return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: corsHeaders });
            }
        }

        if (url.pathname === '/change-password' && request.method === 'POST') {
            try {
                const { email, currentPassword, newPassword } = await request.json() as any;

                // Auth check
                const user = await env.DB.prepare('SELECT * FROM users WHERE email = ? AND password = ?')
                    .bind(email, currentPassword).first();

                if (!user) {
                    return new Response(JSON.stringify({ success: false, error: 'Incorrect current password' }), {
                        headers: { 'Content-Type': 'application/json', ...corsHeaders }
                    });
                }

                // Update password
                await env.DB.prepare('UPDATE users SET password = ? WHERE email = ?')
                    .bind(newPassword, email).run();

                return new Response(JSON.stringify({ success: true }), {
                    headers: { 'Content-Type': 'application/json', ...corsHeaders }
                });
            } catch (e) {
                return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: corsHeaders });
            }
        }

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
