import sharp from 'sharp';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const OUT = 'public/img';
const B = 'https://img.magnific.com/free-photo/';
const IMAGES = [
  // Arquivos licenciados (sem marca-d'água). O link assinado expira; depois disso o build reaproveita a cópia publicada.
  { name: 'familia', url: 'https://downloadscdn6.magnific.com/637285/4/3331.jpg?filename=young-couple-communicating-while-going-through-their-home-finances.jpg&token=exp=1793281133~hmac=356d209890a613b99b88596f99ca57c3' },
  { name: 'consulta', url: 'https://downloadscdn6.magnific.com/637285/5/4578.jpg?filename=doctor-consoling-his-worried-mature-patient-before-mri-scan-procedure-hospital.jpg&token=exp=1793281433~hmac=268faa02699c16be04842eca5d013708' },
  { name: 'negativa', url: 'https://downloadscdn6.magnific.com/23/2148752/2148751497.jpg?filename=mid-shot-woman-couch-talking-phone-looking-paper.jpg&token=exp=1793281435~hmac=0a9673225188780332682216924db2e1' }
];

async function get(url) {
  const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (build)' } });
  if (!r.ok) throw new Error(r.status + ' ' + url);
  return Buffer.from(await r.arrayBuffer());
}

await mkdir(OUT, { recursive: true });
const PROD = 'https://www.lopesefernandes.adv.br';
for (const img of IMAGES) {
  let buf;
  try { buf = await get(img.url || B + img.src + '.jpg?w=2000'); }
  catch (e) { console.log('fonte indisponível, usando cópia publicada:', img.name); buf = await get(`${PROD}/img/${img.name}-1200.webp`); }
  const meta = await sharp(buf).metadata();
  console.log('origem', img.name, meta.width + 'x' + meta.height);
  for (const w of [800, 1200]) {
    await sharp(buf).rotate().resize({ width: w, height: Math.round(w * 2 / 3), fit: 'cover' }).webp({ quality: 76, effort: 5 }).toFile(`${OUT}/${img.name}-${w}.webp`);
  }
}

// Favicon gerado a partir do símbolo da marca
const mark = await readFile('public/brand/lf-mark.svg', 'utf8');
const d = mark.match(/ d="([^"]+)"/)[1];
await writeFile('public/favicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="112" fill="#0b2452"/><path transform="translate(104 79) scale(0.62)" fill="#e3b077" d="${d}"/></svg>`);
console.log('favicon gerado');
