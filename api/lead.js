import { put } from '@vercel/blob';

const clean = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok: false, error: 'Método não permitido' }); }
  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch { b = {}; } }
  b = b || {};
  if (b.empresa) return res.status(200).json({ ok: true });

  const lead = {
    area: 'Direito à Saúde',
    nome: clean(b.nome, 120),
    whatsapp: clean(b.whatsapp, 20).replace(/\D/g, ''),
    consentimento: b.consentimento === true,
    origem: clean(b.origem, 500),
    utm: clean(b.utm, 500),
    recebido_em: new Date().toISOString()
  };
  const errs = [];
  if (lead.nome.length < 3) errs.push('nome');
  if (!(lead.whatsapp.length === 10 || lead.whatsapp.length === 11)) errs.push('whatsapp');
  if (errs.length) return res.status(400).json({ ok: false, error: 'Campos inválidos: ' + errs.join(', ') });

  try {
    const id = lead.recebido_em.replace(/[:.]/g, '-') + '-' + Math.random().toString(36).slice(2, 8);
    await put(`leads/saude/${id}.json`, JSON.stringify(lead, null, 2), { access: 'private', contentType: 'application/json', addRandomSuffix: false });
    if (process.env.LEAD_WEBHOOK_URL) {
      await fetch(process.env.LEAD_WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lead) }).catch(() => {});
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('lead_store_failed', e?.message);
    return res.status(500).json({ ok: false, error: 'Falha ao registrar' });
  }
}
