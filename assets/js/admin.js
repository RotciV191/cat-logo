
let data = {settings:{}, products:[]};
const $ = s => document.querySelector(s);
const uid = s => (s||'producto').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'') + '-' + Date.now().toString().slice(-4);
async function load(){
  const local = localStorage.getItem('catalogoLocal');
  if(local) data = JSON.parse(local);
  else { const res = await fetch('productos.json', {cache:'no-store'}); data = await res.json(); }
  renderSettings(); renderList(); fillImageOptions();
}
function renderSettings(){
  $('#brandName').value=data.settings.brandName||''; $('#tagline').value=data.settings.tagline||''; $('#description').value=data.settings.description||''; $('#whatsapp').value=data.settings.whatsapp||''; $('#heroImage').value=data.settings.heroImage||'';
}
function saveSettings(){ data.settings.brandName=$('#brandName').value; data.settings.tagline=$('#tagline').value; data.settings.description=$('#description').value; data.settings.whatsapp=$('#whatsapp').value; data.settings.heroImage=$('#heroImage').value; persist(); }
function persist(){ localStorage.setItem('catalogoLocal', JSON.stringify(data)); renderList(); }
function fillImageOptions(){
  const options = ['assets/productos/paquete_negocio.jpg','assets/productos/tarjeta_digital.jpg','assets/productos/menu_catalogo.jpg','assets/productos/qr_display.jpg','assets/productos/flyer_digital.jpg','assets/productos/diseno_visual.jpg','assets/productos/llavero.jpg','assets/productos/iman.jpg','assets/productos/placa_letrero.jpg','assets/productos/etiqueta_tag.jpg','assets/productos/recuerdo_evento.jpg','assets/productos/mascotas_fotos.jpg','assets/productos/proyecto_especial.jpg'];
  $('#imagen').innerHTML = options.map(o=>`<option value="${o}">${o.split('/').pop()}</option>`).join('');
}
function clearForm(){ ['editId','nombre','linea','categoria','precio','unidad','descripcion','incluye','tiempo','imagen'].forEach(id=>{ const el=$('#'+id); if(el) el.value='';}); $('#visible').checked=true; $('#destacado').checked=false; $('#unidad').value='desde'; $('#tiempo').value='3-5 días'; $('#imagen').value='assets/productos/proyecto_especial.jpg'; }
function edit(id){ const p=data.products.find(x=>x.id===id); if(!p) return; $('#editId').value=p.id; $('#nombre').value=p.nombre||''; $('#linea').value=p.linea||''; $('#categoria').value=p.categoria||''; $('#precio').value=p.precio||0; $('#unidad').value=p.unidad||'desde'; $('#descripcion').value=p.descripcion||''; $('#incluye').value=p.incluye||''; $('#tiempo').value=p.tiempo||''; $('#imagen').value=p.imagen||''; $('#visible').checked=p.visible!==false; $('#destacado').checked=!!p.destacado; window.scrollTo({top:0,behavior:'smooth'}); }
function removeProduct(id){ if(!confirm('¿Borrar producto?')) return; data.products = data.products.filter(p=>p.id!==id); persist(); }
function saveProduct(){
  const id=$('#editId').value || uid($('#nombre').value);
  const p={id,nombre:$('#nombre').value,linea:$('#linea').value,categoria:$('#categoria').value,precio:Number($('#precio').value||0),unidad:$('#unidad').value,descripcion:$('#descripcion').value,incluye:$('#incluye').value,tiempo:$('#tiempo').value,imagen:$('#imagen').value,visible:$('#visible').checked,destacado:$('#destacado').checked};
  const idx=data.products.findIndex(x=>x.id===id); if(idx>=0) data.products[idx]=p; else data.products.unshift(p); persist(); clearForm();
}
function renderList(){
  $('#count').textContent = `${data.products.length} productos cargados`;
  $('#list').innerHTML = data.products.map(p=>`<div class="row"><img src="${p.imagen}"/><div><strong>${p.nombre}</strong><span>${p.linea} / ${p.categoria} · ${p.unidad} $${p.precio||0} · ${p.visible===false?'Oculto':'Visible'}</span></div><button onclick="edit('${p.id}')">Editar</button><button onclick="removeProduct('${p.id}')">Borrar</button></div>`).join('');
}
function downloadJson(){ const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='productos.json'; a.click(); }
function resetLocal(){ if(confirm('Esto borra cambios locales y recarga productos.json original.')){ localStorage.removeItem('catalogoLocal'); location.reload(); }}
function importJson(ev){ const file=ev.target.files[0]; if(!file) return; const r=new FileReader(); r.onload=()=>{data=JSON.parse(r.result); persist(); renderSettings();}; r.readAsText(file); }
window.addEventListener('DOMContentLoaded',()=>{ load(); $('#saveSettings').onclick=saveSettings; $('#saveProduct').onclick=saveProduct; $('#clear').onclick=clearForm; $('#downloadJson').onclick=downloadJson; $('#resetLocal').onclick=resetLocal; $('#importJson').onchange=importJson; });
