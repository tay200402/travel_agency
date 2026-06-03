const API_URL = 'http://localhost:3000/api';

let dbPaquetes = [];
let listaCompararIds = [];
let tokenApp = null;
let usuarioActivo = null;

// BASE DE DATOS LOCAL DE PREGUNTAS FRECUENTES (FAQ) SEGÚN CAPTURA
const listaFAQ = [
    { id: 1, cat: 'reservas', q: '¿Cómo puedo reservar un paquete turístico?', a: 'Puedes reservarlo directamente a través de nuestro portal web seleccionando el destino de tu preferencia o poniéndote en contacto con uno de nuestros asesores comerciales.' },
    { id: 2, cat: 'reservas', q: '¿Qué métodos de pago aceptan?', a: 'Aceptamos todas las tarjetas de crédito y débito (Visa, Mastercard, Amex), transferencias bancarias directas y pagos mediante PSE.' },
    { id: 3, cat: 'reservas', q: '¿Puedo modificar mi reserva después de confirmarla?', a: 'Sí, puedes realizar modificaciones hasta 15 días antes de la fecha programada del viaje, sujeto a las políticas de disponibilidad de los proveedores de vuelos y hoteles.' },
    { id: 4, cat: 'durante', q: '¿Los paquetes incluyen seguro de viaje?', a: 'Todos nuestros paquetes Premium y de categoría internacional incluyen de manera obligatoria una tarjeta de asistencia médica global.' },
    { id: 5, cat: 'destinos', q: '¿Necesito visa para viajar a estos destinos?', a: 'Depende de tu nacionalidad y el país de destino. Al momento de la cotización, nuestro sistema te indicará los requerimientos consulares correspondientes.' },
    { id: 6, cat: 'general', q: '¿Puedo personalizar un paquete turístico?', a: '¡Por supuesto! En la pestaña "Cotizar" puedes detallar las actividades que deseas agregar y un asesor armará un itinerario a tu medida.' },
    { id: 7, cat: 'destinos', q: '¿Qué incluye "Todo Incluido"?', a: 'Normalmente incluye los tiquetes aéreos de ida y vuelta, traslados aeropuerto-hotel, hospedaje, alimentación completa, snacks y licores ilimitados.' },
    { id: 8, cat: 'durante', q: '¿Hay asistencia durante el viaje?', a: 'Brindamos una línea de atención telefónica y de WhatsApp exclusiva de emergencias operando las 24 horas del día, los 7 días de la semana.' },
    { id: 9, cat: 'cancelaciones', q: '¿Cuál es la política de cancelación?', a: 'Las cancelaciones realizadas con más de 30 días de anticipación aplican para reembolso completo. Posterior a ello, se aplicará penalidad según los términos contractuales.' },
    { id: 10, cat: 'cancelaciones', q: '¿Qué pasa si cancelo por emergencia médica?', a: 'Presentando el certificado médico oficial calificado, nuestro seguro de cancelación procesará la devolución del dinero o reprogramación sin costos extras.' },
    { id: 11, cat: 'general', q: '¿Organizan viajes grupales o corporativos?', a: 'Sí, desarrollamos planes corporativos, de convenciones, viajes de incentivo empresariales y excursiones de grandes grupos familiares.' },
    { id: 12, cat: 'reservas', q: '¿Puedo obtener una cotización sin compromiso?', a: 'Completamente. Todas las cotizaciones emitidas a través de nuestro módulo web son gratuitas y válidas comercialmente por un período de 7 días hábiles.' }
];

function navegar(vistaId) {
    document.querySelectorAll('.vista').forEach(v => {
        v.classList.remove('active');
        v.style.display = 'none';
    });
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

    const activa = document.getElementById(`vista-${vistaId}`);
    if (activa) {
        activa.style.display = 'block';
        setTimeout(() => activa.classList.add('active'), 20);
    }

    const btnNav = document.getElementById(`nav-${vistaId}`);
    if (btnNav) btnNav.classList.add('active');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showToast(msj) {
    const container = document.getElementById('toast-container');
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerText = msj;
    container.appendChild(t);
    setTimeout(() => t.remove(), 3500);
}

// CARGA INICIAL DE LA API
async function sincronizarAPI() {
    try {
        const res = await fetch(`${API_URL}/paquetes`);
        dbPaquetes = await res.json();
        
        cargarSelectoresFormulario();
        aplicarFiltros();
        renderizarGridFAQ(listaFAQ);
    } catch {
        showToast('Error conectando con el servidor académico Node.js');
    }
}

// INYECCIÓN DE SELECTORES DINÁMICOS
function cargarSelectoresFormulario() {
    const dSelect = document.getElementById('filtro-destino');
    const pSelect = document.getElementById('filtro-pais');
    const formSelect = document.getElementById('cot-destino-select');

    if (dSelect && formSelect) {
        // Limpiar para evitar duplicados en los selectores
        dSelect.innerHTML = '<option value="">Todos los destinos</option>';
        formSelect.innerHTML = '<option value="">Selecciona un destino</option>';
        
        const destinosUnicos = [...new Set(dbPaquetes.map(p => p.destino))];
        destinosUnicos.forEach(d => {
            dSelect.innerHTML += `<option value="${d}">${d}</option>`;
            formSelect.innerHTML += `<option value="${d}">${d}</option>`;
        });
    }

    if (pSelect) {
        pSelect.innerHTML = '<option value="">Todos los países</option>';
        pSelect.innerHTML += '<option value="México">México</option>';
        pSelect.innerHTML += '<option value="Francia">Francia</option>';
        pSelect.innerHTML += '<option value="Colombia">Colombia</option>';
        pSelect.innerHTML += '<option value="Perú">Perú</option>';
        pSelect.innerHTML += '<option value="Rep. Dominicana">Rep. Dominicana</option>';
    }
}

function actualizarLabelPrecio(v) {
    document.getElementById('label-max-precio').innerText = `$${v}`;
}

// FILTRADO AVANZADO LATERAL
function aplicarFiltros() {
    const nombre = document.getElementById('filtro-nombre').value.toLowerCase();
    const destino = document.getElementById('filtro-destino').value;
    const pais = document.getElementById('filtro-pais').value.toLowerCase();
    const precioMax = parseFloat(document.getElementById('filtro-precio').value);
    const duracion = document.getElementById('filtro-duracion').value;

    const filtrados = dbPaquetes.filter(p => {
        const matchNombre = p.destino.toLowerCase().includes(nombre) || p.titulo.toLowerCase().includes(nombre);
        const matchDestino = destino === '' || p.destino === destino;
        const matchPrecio = p.precio <= precioMax;
        
        const matchPais = pais === '' || p.descripcion.toLowerCase().includes(pais) || p.destino.toLowerCase().includes(pais);

        let matchDuracion = true;
        if (duracion === '1-5') matchDuracion = p.duracion_dias >= 1 && p.duracion_dias <= 5;
        else if (duracion === '6-9') matchDuracion = p.duracion_dias >= 6 && p.duracion_dias <= 9;
        else if (duracion === '10+') matchDuracion = p.duracion_dias >= 10;

        return matchNombre && matchDestino && matchPrecio && matchPais && matchDuracion;
    });

    // RENDERIZADO EXCLUSIVO: Cada función debe apuntar estrictamente a su contenedor limpio
    renderizarCardsUI(filtrados, 'contenedor-paquetes');
    
    // NOTA: Si en la vista de "Comparar" tienes un contenedor espejo dinámico, 
    // asegúrate de que su ID en el HTML sea exactamente 'contenedor-comparar-grid'.
    renderizarCardsUI(dbPaquetes, 'contenedor-comparar-grid'); 
    
    const contador = document.getElementById('contador-resultados');
    if (contador) contador.innerText = `Mostrando ${filtrados.length} paquetes`;
}

function limpiarFiltros() {
    document.getElementById('filtro-nombre').value = '';
    document.getElementById('filtro-destino').value = '';
    document.getElementById('filtro-pais').value = '';
    document.getElementById('filtro-precio').value = 6000;
    document.getElementById('filtro-duracion').value = '';
    actualizarLabelPrecio(6000);
    aplicarFiltros();
}

// RENDERIZADOR DE TARJETAS COMERCIALES CON SOPORTE DE IMÁGENES REALES
// RENDERIZADOR DE TARJETAS COMERCIALES - OPTIMIZADO PARA IMÁGENES REALES Y SEGURAS
function renderizarCardsUI(lista, targetContainerId) {
    const container = document.getElementById(targetContainerId);
    if (!container) return; // Validación de seguridad por si el contenedor no existe en la vista actual
    
    // LIMPIEZA TOTAL: Evita que las tarjetas se dupliquen o se concatenen infinitamente
    container.innerHTML = '';

    if(lista.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding: 40px; color:#94a3b8;">No se encontraron planes que coincidan con los criterios establecidos.</p>';
        return;
    }

    lista.forEach(p => {
        const esDeComparacion = targetContainerId === 'contenedor-comparar-grid';
        const estaAgregado = listaCompararIds.includes(p.id);
        
        let botonAccionSecundario = `<button class="btn-card-secondary" onclick="conmutarComparador(${p.id})">Comparar</button>`;
        if (esDeComparacion && estaAgregado) {
            botonAccionSecundario = `<button class="btn-card-secondary in-comparison" onclick="conmutarComparador(${p.id})">Quitar</button>`;
        }

        // CONTROL ESTRICTO DE IMÁGENES COHERENTES DE TURISMO (Evita enlaces caídos o espárragos)
        let urlImagen = 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=600'; // Imagen de viaje neutra de alta calidad (Maletas/Pasaporte)

        if (p.imagen_url && p.imagen_url.trim() !== '' && p.imagen_url.startsWith('http')) {
            urlImagen = p.imagen_url;
        } else {
            // Asignación de imágenes fijas de stock turístico de alta calidad según el destino de tu BD
            const destinoNormalizado = p.destino.toLowerCase().trim();
            if (destinoNormalizado.includes('cartagena')) {
                urlImagen = 'https://images.unsplash.com/photo-1583531172005-814191b8b6c0?w=600'; // Murallas de Cartagena
            } else if (destinoNormalizado.includes('san andrés') || destinoNormalizado.includes('andres')) {
                urlImagen = 'https://images.unsplash.com/photo-1590579491746-b187f55f692b?w=600'; // Mar del caribe / San Andrés
            } else if (destinoNormalizado.includes('medellín') || destinoNormalizado.includes('medellin')) {
                urlImagen = 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=600'; // Panorámica de Medellín o Guatapé
            }
        }

        container.innerHTML += `
            <div class="travel-card">
                <div class="card-image-box">
                    <div class="duration-tag">${p.duracion_dias} días</div>
                    <img src="${urlImagen}" alt="${p.destino}" style="width:100%; height:100%; object-fit:cover;" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=600';">
                </div>
                <div class="card-main-info">
                    <div class="rating-line">
                        <div class="geo-tag"><i class="fa-solid fa-location-dot"></i> ${p.destino}</div>
                        <div class="stars"><i class="fa-solid fa-star"></i> 4.8</div>
                    </div>
                    <h3>${p.titulo}</h3>
                    <p>${p.descripcion}</p>
                    <div class="price-container">
                        <span class="price-currency-sym">$</span>
                        <span class="price-value-txt">${parseFloat(p.precio).toLocaleString('en-US')}</span>
                        <span style="font-size:12px; color:#94a3b8; font-weight:500;">/ por persona</span>
                    </div>
                    <div class="card-actions-wrapper">
                        <button class="btn-card-primary" onclick="abrirPlanEnFormulario('${p.destino}')">Ver Detalles</button>
                        ${botonAccionSecundario}
                    </div>
                </div>
            </div>
        `;
    });
}

function abrirPlanEnFormulario(destino) {
    document.getElementById('cot-destino-select').value = destino;
    vincularPrecioSugerido(destino);
    navegar('cotizar');
}

function vincularPrecioSugerido(destino) {
    const plan = dbPaquetes.find(p => p.destino === destino);
    if(plan) {
        document.getElementById('cot-presupuesto').value = Math.round(plan.precio);
        document.getElementById('cot-duracion').value = plan.duracion_dias;
    }
}

// MOTOR DEL COMPARADOR (Hasta 4 elementos según captura)
function conmutarComparador(id) {
    const idx = listaCompararIds.indexOf(id);
    if (idx !== -1) {
        listaCompararIds.splice(idx, 1);
    } else {
        if(listaCompararIds.length >= 4) {
            return showToast('El sistema permite comparar un límite máximo de 4 paquetes en simultáneo.');
        }
        listaCompararIds.push(id);
    }
    document.getElementById('comp-counter-text').innerText = `Paquetes seleccionados: ${listaCompararIds.length} / 4`;
    generarTablaComparativaMatriz();
    aplicarFiltros();
}

function generarTablaComparativaMatriz() {
    const target = document.getElementById('wrapper-tabla-comparativa');
    if (!target) return;
    
    if (listaCompararIds.length === 0) {
        target.innerHTML = '<p style="text-align:center; background:white; padding:40px; border-radius:12px; border:1px solid var(--border-color); color:#94a3b8;">Haz clic en "Comparar" en las tarjetas de abajo para activar la matriz comparativa.</p>';
        return;
    }

    const paquetesSeleccionados = dbPaquetes.filter(p => listaCompararIds.includes(p.id));

    let htmlCabecera = '<th>Parámetros</th>';
    let htmlDestino = '<td><strong>Destino</strong></td>';
    let htmlTitulo = '<td><strong>Plan Comercial</strong></td>';
    let htmlDuracion = '<td><strong>Estadía</strong></td>';
    let htmlPrecio = '<td><strong>Costo Unitario</strong></td>';

    paquetesSeleccionados.forEach(p => {
        htmlCabecera += `<th>${p.destino}</th>`;
        htmlDestino += `<td>${p.destino}</td>`;
        htmlTitulo += `<td>${p.titulo}</td>`;
        htmlDuracion += `<td>${p.duracion_dias} días</td>`;
        htmlPrecio += `<td style="color:#10b981; font-weight:800;">$${parseFloat(p.precio).toLocaleString('en-US')} USD</td>`;
    });

    target.innerHTML = `
        <table class="comp-table">
            <thead><tr>${htmlCabecera}</tr></thead>
            <tbody>
                <tr>${htmlDestino}</tr>
                <tr>${htmlTitulo}</tr>
                <tr>${htmlDuracion}</tr>
                <tr>${htmlPrecio}</tr>
            </tbody>
        </table>
    `;
}

// SECCIÓN ACORDEÓN PREGUNTAS FRECUENTES (FAQ)
function renderizarGridFAQ(lista) {
    const container = document.getElementById('wrapper-acordeon-faq');
    if (!container) return;
    container.innerHTML = '';

    if (lista.length === 0) {
        container.innerHTML = '<p style="padding:20px; color:#94a3b8; text-align:center;">No se encontraron preguntas registradas en esta categoría.</p>';
        return;
    }

    lista.forEach((f, i) => {
        container.innerHTML += `
            <div class="faq-node" id="faq-node-${f.id}">
                <div class="faq-trigger" onclick="conmutarAcordeonFaq(${f.id})">
                    <div>
                        <span class="faq-trigger-num">${i + 1}</span>
                        ${f.q}
                    </div>
                    <i class="fa-solid fa-chevron-down faq-icon-indicator"></i>
                </div>
                <div class="faq-content-panel">
                    ${f.a}
                </div>
            </div>
        `;
    });
}

function conmutarAcordeonFaq(id) {
    const nodo = document.getElementById(`faq-node-${id}`);
    if (!nodo) return;
    const estabaAbierto = nodo.classList.contains('open');
    
    document.querySelectorAll('.faq-node').forEach(n => n.classList.remove('open'));
    if(!estabaAbierto) {
        nodo.classList.add('open');
    }
}

function filtrarPreguntasFAQ(txt) {
    const query = txt.toLowerCase();
    const filtradas = listaFAQ.filter(f => f.q.toLowerCase().includes(query) || f.a.toLowerCase().includes(query));
    renderizarGridFAQ(filtradas);
}

function filtrarCategoriaFAQ(cat, btn) {
    document.querySelectorAll('.faq-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    if(cat === 'todas') {
        renderizarGridFAQ(listaFAQ);
    } else {
        const filtradas = listaFAQ.filter(f => f.cat === cat);
        renderizarGridFAQ(filtradas);
    }
}

// ENVÍO DE FORMULARIO DE COTIZACIÓN - REQUISITO DE DESCARGA DIRECTA DE PDF
function enviarFormularioCotizacion(event) {
    event.preventDefault();
    
    // 1. Captura de los campos del formulario según image_db6b66.png
    const nombre = document.getElementById('cot-nombre').value;
    const correo = document.getElementById('cot-correo').value;
    const telefono = document.getElementById('cot-telefono').value;
    const destino = document.getElementById('cot-destino-select').value;
    const viajeros = document.getElementById('cot-viajeros').value;
    const fecha = document.getElementById('cot-fecha').value;
    const duracion = document.getElementById('cot-duracion').value;
    const presupuesto = document.getElementById('cot-presupuesto').value;
    const comentarios = document.getElementById('cot-comentarios').value || "Ninguno";

    if (!destino) {
        return showToast('Por favor, selecciona un destino válido del catálogo.');
    }

    showToast('🚀 Generando su cotización en formato PDF...');

    try {
        // 2. Inicializar jsPDF usando el espacio de nombres de la librería v2
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4'
        });

        // 3. Estilos y Estructura Visual del PDF (Formato Ejecutivo)
        // Encabezado Corporativo
        doc.setFillColor(30, 41, 59); // Color Azul Oscuro / Slate corporativo
        doc.rect(0, 0, 210, 40, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(22);
        doc.text("AGENCIA DE VIAJES", 15, 18);
        
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(10);
        doc.text("Tu próxima aventura a un solo clic", 15, 25);
        doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString()}`, 145, 18);
        doc.text("Documento Oficial de Cotización", 145, 25);

        // Bloque informativo 1: Datos del Cliente
        doc.setTextColor(30, 41, 59);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(14);
        doc.text("Información del Solicitante", 15, 55);
        
        doc.setLineWidth(0.5);
        doc.setDrawColor(203, 213, 225);
        doc.line(15, 58, 195, 58); // Línea divisoria

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(11);
        doc.text(`Nombre Completo: ${nombre}`, 15, 66);
        doc.text(`Correo Electrónico: ${correo}`, 15, 73);
        doc.text(`Teléfono de Contacto: ${telefono}`, 15, 80);

        // Bloque informativo 2: Detalles Técnicos del Viaje
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(14);
        doc.text("Especificaciones del Paquete Turístico", 15, 95);
        doc.line(15, 98, 195, 98);

        doc.setFont("Helvetica", "normal");
        doc.text(`Destino Solicitado:`, 15, 106);
        doc.setFont("Helvetica", "bold");
        doc.text(`${destino}`, 60, 106);
        
        doc.setFont("Helvetica", "normal");
        doc.text(`Número de Viajeros: ${viajeros} personas`, 15, 113);
        doc.text(`Fecha Estimada de Salida: ${fecha}`, 15, 120);
        doc.text(`Duración del Plan: ${duracion} días`, 15, 127);
        
        // Resaltado de Presupuesto Estimado
        doc.setFillColor(241, 245, 249);
        doc.rect(15, 134, 180, 12, 'F');
        doc.setFont("Helvetica", "bold");
        doc.setTextColor(79, 70, 229); // Color Brand / Índigo
        doc.text(`Presupuesto Máximo Estimado: $${parseFloat(presupuesto).toLocaleString('en-US')} USD`, 20, 141);

        // Observaciones adicionales
        doc.setTextColor(30, 41, 59);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(12);
        doc.text("Notas y Preferencias Especiales:", 15, 160);
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(10);
        
        // Manejo de textos largos en los comentarios
        const lineasComentarios = doc.splitTextToSize(comentarios, 180);
        doc.text(lineasComentarios, 15, 167);

        // Pie de Página Institucional
        doc.setLineWidth(0.3);
        doc.setDrawColor(226, 232, 240);
        doc.line(15, 265, 195, 265);
        
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184);
        doc.text("Esta cotización es de carácter informativo y no garantiza reserva hotelera ni de tiquetes aéreos.", 15, 272);
        doc.text("Gracias por confiar en nuestra agencia. Validez de la oferta: 7 días hábiles.", 15, 277);

        // 4. Descarga forzada automática del archivo generado en el cliente
        const nombreArchivo = `Cotizacion_${destino.replace(/\s+/g, '_')}_${nombre.replace(/\s+/g, '_')}.pdf`;
        doc.save(nombreArchivo);

        showToast('✅ ¡PDF descargado exitosamente!');
        
        // Resetear formulario y regresar al catálogo de forma limpia
        document.getElementById('form-solicitud-cotizacion').reset();
        navegar('catalogo');

    } catch (error) {
        console.error(error);
        showToast('Error local al procesar e imprimir el documento PDF.');
    }
}

// CONTROL DE AUTENTICACIÓN INSTITUCIONAL
async function ejecutarLoginApp(e) {
    e.preventDefault();
    const email = document.getElementById('input-auth-email').value;
    const password = document.getElementById('input-auth-pass').value;

    try {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        
        if(!res.ok) return showToast(data.error || 'Credenciales inválidas');

        tokenApp = data.token;
        usuarioActivo = data.usuario;

        document.getElementById('btn-nav-login').classList.add('oculto');
        document.getElementById('wrapper-usuario').classList.remove('oculto');
        document.getElementById('user-display-name').innerText = usuarioActivo.nombre;
        
        showToast(`Bienvenido de vuelta, ${usuarioActivo.nombre}`);
        document.getElementById('form-autenticacion-login').reset();
        navegar('catalogo');
    } catch {
        showToast('El servidor API no responde.');
    }
}

function logout() {
    tokenApp = null; usuarioActivo = null;
    document.getElementById('btn-nav-login').classList.remove('oculto');
    document.getElementById('wrapper-usuario').classList.add('oculto');
    showToast('Sesión de usuario cerrada.');
    navegar('catalogo');
}

window.onload = () => sincronizarAPI();