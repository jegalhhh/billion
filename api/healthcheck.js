export default async function handler(req, res) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    return res.status(500).json({ error: "missing env" });
  }

  const r = await fetch(`${url}/rest/v1/transactions?select=id&limit=1`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  });

  res.status(r.ok ? 200 : 500).json({ ok: r.ok, status: r.status });
}
