
const FALLBACK = {
  settings: {
    brandName: 'Catálogo General de Productos Personalizados',
    tagline: 'Productos personalizados para vender, regalar y recordar.',
    description: 'Productos personalizados e imagen visual para negocios, eventos y regalos, con presentación profesional y lista para usar.',
    whatsapp: '12068801104',
    heroImage: 'assets/productos/hero_portada.jpg',
    city: 'Seattle y alrededores'
  }, products: []
};
let catalog = FALLBACK;
let currentFilter = 'Todos';
let query = '';
const $ = (s) => document.querySelector(s);
function money(p){ if(!p || Number(p)===0) return 'Cotizar'; return `$${Number(p).toLocaleString('en-US')}`; }
function cleanPhone(p){ return String(p||'').replace(/\D/g,''); }
function waLink(product){ const phone = cleanPhone(catalog.settings.whatsapp); const msg = product ? `Hola, me interesa cotizar: ${product.nombre}` : `Hola, me interesa cotizar un producto personalizado`; return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`; }
async function loadCatalog(){
  try{
    const local = localStorage.getItem('catalogoLocal');
    if(local) catalog = JSON.parse(local);
    else {
      const res = await fetch('productos.json', {cache:'no-store'});
      if(res.ok) catalog = await res.json();
    }
  } catch(e){ console.warn('Usando fallback', e); }
  render();
}
function categoryList(){ return ['Todos', ...Array.from(new Set((catalog.products||[]).filter(p=>p.visible!==false).map(p=>p.linea))).filter(Boolean)]; }
function render(){
  const s = catalog.settings || FALLBACK.settings;
  document.title = s.brandName || 'Catálogo';
  $('#brandName').textContent = s.brandName || 'Catálogo';
  $('#brandSub').textContent = s.city || 'Productos personalizados';
  $('#heroTitle').textContent = s.tagline || '';
  $('#heroDesc').textContent = s.description || '';
  $('#heroImg').src = s.heroImage || 'assets/productos/hero_portada.jpg';
  $('#waMain').href = waLink(); $('#waCta').href = waLink();
  const cats = categoryList();
  $('#filters').innerHTML = cats.map(c=>`<button class="filter ${c===currentFilter?'active':''}" data-filter="${c}">${c}</button>`).join('');
  document.querySelectorAll('.filter').forEach(b=>b.onclick=()=>{currentFilter=b.dataset.filter;renderProducts();render();});
  renderProducts();
}
function renderProducts(){
  let list = (catalog.products||[]).filter(p=>p.visible!==false);
  if(currentFilter !== 'Todos') list = list.filter(p => p.linea === currentFilter);
  if(query.trim()){
    const q=query.toLowerCase();
    list = list.filter(p => [p.nombre,p.linea,p.categoria,p.descripcion,p.incluye].join(' ').toLowerCase().includes(q));
  }
  list.sort((a,b)=> (b.destacado===true)-(a.destacado===true) || (a.nombre||'').localeCompare(b.nombre||''));
  $('#productCount').textContent = `${list.length} opciones visibles`;
  $('#products').innerHTML = list.map(card).join('') || `<div class="card"><div class="body"><h3>No hay productos</h3><p class="desc">Cambia el filtro o la búsqueda.</p></div></div>`;
}
function card(p){
  const media = (p.imagen||'').match(/\.(mp4|webm)$/i) ? `<video src="${p.imagen}" muted autoplay loop playsinline></video>` : `<img src="${p.imagen||'assets/productos/proyecto_especial.jpg'}" alt="${p.nombre}">`;
  return `<article class="card ${p.destacado?'featured':''}">
    <div class="media">${media}<span class="badge">${p.categoria||p.linea||'Producto'}</span></div>
    <div class="body">
      <div class="chips"><span class="chip">${p.linea||'Catálogo'}</span><span class="chip">${p.tiempo||'Cotizar'}</span></div>
      <h3>${p.nombre}</h3><p class="desc">${p.descripcion||''}</p>
      ${p.incluye?`<p class="desc"><strong>Incluye:</strong> ${p.incluye}</p>`:''}
      <div class="meta"><div class="price"><small>${p.unidad||'desde'}</small>${money(p.precio)}</div><a class="quote" href="${waLink(p)}" target="_blank" rel="noopener">Cotizar</a></div>
    </div>
  </article>`;
}
document.addEventListener('input', e=>{ if(e.target.id==='search'){ query=e.target.value; renderProducts(); }});
loadCatalog();
