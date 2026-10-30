# Lopes & Fernandes Advogados — LP Direito à Saúde

LP de reajuste de plano de saúde (falso coletivo). Produção: https://www.lopesefernandes.adv.br

- Hospedagem: Vercel, time `ads-br`, projeto `coelho-fernandes-lp`
- HTML/CSS/JS puro em `public/`; página pós-formulário em `public/redirect/` (redireciona ao WhatsApp em 3 s)
- `api/lead.js`: recebe o formulário e grava em Vercel Blob (`leads/saude/`); envia também para `LEAD_WEBHOOK_URL`, se configurada
- Build (`npm run build`): `scripts/fetch-images.mjs` gera as fotos em WebP e o favicon

Tags (Pixel/GTM/GA4): inserir no `<head>` de `public/index.html` e `public/redirect/index.html`. O formulário já dispara `fbq('track','Lead')` e `gtag('event','generate_lead')` quando as tags existem.
