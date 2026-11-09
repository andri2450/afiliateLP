# Deploy
1. Upload folder ini ke GitHub lalu import di Vercel (atau `vercel` CLI).
2. Di dashboard Vercel: Storage -> buat Upstash Redis (KV), hubungkan ke project. Otomatis menambah KV_REST_API_URL & KV_REST_API_TOKEN.
3. Settings -> Environment Variables, tambah:
   - ADMIN_PASSWORD  (password dashboard)
   - ANTHROPIC_API_KEY (untuk tulis ulang judul & deskripsi)
4. Redeploy. Landing: /  | Dashboard: /admin.html
