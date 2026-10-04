/* ==========================================================================
   1. ESTRUTURA DE DADOS E SCHEMA DO FORMULÁRIO
   ========================================================================== */
const SCHEMA = [
  ['1. Identificação', [
    ['controle', 'Nº do pedido / Controle'],
    ['emissao', 'Data de emissão', 'date']
  ]],
  ['2. Cliente — Titular (Outorgante)', [
    ['cliente', 'Cliente (razão social / nome)', 'text', 'full'],
    ['doc', 'CNPJ / CPF'],
    ['telefone', 'Telefone / Contato']
  ]],
  ['3. Validade (Máximo 6 meses)', [
    ['validade', 'Período de validade', 'select', '', [
      ['30', '30 dias'], ['60', '60 dias'], ['90', '90 dias'], 
      ['120', '120 dias'], ['150', '150 dias'], ['180', '180 dias']
    ]],
    ['inicio', 'Início da vigência', 'date'],
    ['fim', 'Válido até (Calculado)', 'date', 'readonly'] // Adicionado tipo readonly
  ]],
  ['4. Portadores Autorizados (Ao menos 1 obrigatório)', [
    ['mot1_nome', '1º Motorista - Nome', 'text', 'full'],
    ['mot1_cpf', 'CPF'], ['mot1_cnh', 'CNH'],
    ['mot2_nome', '2º Motorista - Nome (Opcional)', 'text', 'full'],
    ['mot2_cpf', 'CPF'], ['mot2_cnh', 'CNH'],
    ['mot3_nome', '3º Motorista - Nome (Opcional)', 'text', 'full'],
    ['mot3_cpf', 'CPF'], ['mot3_cnh', 'CNH'],
    ['mot4_nome', '4º Motorista - Nome (Opcional)', 'text', 'full'],
    ['mot4_cpf', 'CPF'], ['mot4_cnh', 'CNH']
  ]],
  ['5. Veículos Autorizados (Ao menos 1 obrigatório)', [
    ['vei1_placa', '1º Veículo - Placa'], ['vei1_modelo', 'Modelo / Cor'],
    ['vei2_placa', '2º Veículo - Placa (Opcional)'], ['vei2_modelo', 'Modelo / Cor'],
    ['vei3_placa', '3º Veículo - Placa (Opcional)'], ['vei3_modelo', 'Modelo / Cor']
  ]]
];

const REQ = [
  'controle', 'emissao', 'cliente', 'doc', 'telefone', 'inicio',
  'mot1_nome', 'mot1_cpf', 'vei1_placa', 'vei1_modelo'
];

/* ==========================================================================
   2. FUNÇÕES UTILITÁRIAS E HELPER DOM
   ========================================================================== */
const $ = (id) => document.getElementById(id);
const getValue = (id) => ($(id).value || '').trim();
const onlyDigits = (str) => str.replace(/\D/g, '');

const maskCPF = (str) => str.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
const maskCNPJ = (str) => str.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, '$1.$2.$3/$4-$5');

const formatDate = (str) => {
  if (!str) return '';
  const parts = str.split('T');
  const dateRev = parts[0].split('-').reverse().join('/');
  return parts.length > 1 ? `${dateRev} ${parts[1]}` : dateRev;
};

const getToday = () => {
  const tzOffset = new Date().getTimezoneOffset() * 60000;
  return new Date(Date.now() - tzOffset).toISOString().slice(0, 10);
};

// Calcula a validade de vigência adicionando os dias
function calcEndDate() {
  const start = $('inicio')?.value;
  const days = parseInt($('validade')?.value, 10);
  if (start && days) {
    const d = new Date(start + 'T12:00:00'); // Evitar falha de fuso horário
    d.setDate(d.getDate() + days);
    $('fim').value = d.toISOString().slice(0, 10);
  }
}

function getBase64ImageFromUrl(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width; canvas.height = img.height;
      canvas.getContext('2d').drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = url;
  });
}

/* ==========================================================================
   3. VALIDAÇÕES SENSÍVEIS E RENDERIZAÇÃO
   ========================================================================== */
function validateCPF(str) {
  const s = onlyDigits(str);
  if (s.length !== 11 || /^(\d)\1+$/.test(s)) return false;
  for (let t = 9; t < 11; t++) {
    let r = 0;
    for (let i = 0; i < t; i++) r += s[i] * (t + 1 - i);
    if ((r * 10 % 11) % 10 != s[t]) return false;
  }
  return true;
}

function validateCNPJ(str) {
  const s = onlyDigits(str);
  if (s.length !== 14 || /^(\d)\1+$/.test(s)) return false;
  for (let t = 12; t < 14; t++) {
    let r = 0, p = t - 7;
    for (let i = 0; i < t; i++) {
      r += s[i] * p--;
      if (p < 2) p = 9;
    }
    if ((r * 10 % 11) % 10 != s[t]) return false;
  }
  return true;
}

function validateForm() {
  let ok = true;
  let firstInvalid = null;

  document.querySelectorAll('.msg').forEach((m) => (m.textContent = ''));
  document.querySelectorAll('input, select').forEach((i) => i.classList.remove('bad'));

  const setBad = (id, text) => {
    ok = false;
    $(id).classList.add('bad');$(`m_${id}`).textContent = text;
    firstInvalid = firstInvalid || $(id);
  };

  REQ.forEach((id) => { if (!getValue(id)) setBad(id, 'Campo obrigatório'); });

  const docDigits = onlyDigits(getValue('doc'));
  if (docDigits) {
    const isValid = docDigits.length === 11 ? validateCPF(docDigits) : docDigits.length === 14 ? validateCNPJ(docDigits) : false;
    if (!isValid) setBad('doc', 'CPF/CNPJ inválido');
  }

  // Valida todos os CPFs de motoristas que estiverem preenchidos
  for(let i=1; i<=4; i++) {
    const cpfVal = getValue(`mot${i}_cpf`);
    if (cpfVal && !validateCPF(cpfVal)) setBad(`mot${i}_cpf`, 'CPF inválido');
  }

  if (firstInvalid) firstInvalid.scrollIntoView({ block: 'center', behavior: 'smooth' });
  return ok;
}

function renderForm() {
  $('f').innerHTML = SCHEMA.map(([title, fields]) => `
    <fieldset>
      <legend>${title}</legend>
      <div class="g">
        ${fields.map(([id, label, type, fullClass, options]) => `
          <div class="${fullClass || ''}">
            <label for="${id}">${label}${REQ.includes(id) ? ' *' : ''}</label>${type === 'select' 
              ? `<select id="${id}">${options.map(o => `<option value="${o[0]}">${o[1]}</option>`).join('')}</select>`
              : `<input id="${id}" type="${type === 'readonly' ? 'text' : (type || 'text')}" ${type === 'readonly' ? 'readonly tabindex="-1"' : ''} autocomplete="off">`
            }
            <div class="msg" id="m_${id}"></div>
          </div>
        `).join('')}
      </div>
    </fieldset>
  `).join('');
}

function attachInputEvents() {
  $('doc').addEventListener('input', (e) => {
    const d = onlyDigits(e.target.value).slice(0, 14);
    e.target.value = d.length <= 11 ? maskCPF(d) : maskCNPJ(d);
  });

  // Aplica máscaras e Uppercase nos motoristas e veículos
  for(let i=1; i<=4; i++) {
    $(`mot${i}_cpf`)?.addEventListener('input', (e) => {
      e.target.value = maskCPF(onlyDigits(e.target.value).slice(0, 11));
    });
    $(`mot${i}_nome`)?.addEventListener('blur', (e) => e.target.value = e.target.value.toUpperCase());
  }

  for(let i=1; i<=3; i++) {
    $(`vei${i}_placa`)?.addEventListener('input', (e) => {
      e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 8);
    });
    $(`vei${i}_modelo`)?.addEventListener('blur', (e) => e.target.value = e.target.value.toUpperCase());
  }

  $('cliente').addEventListener('blur', (e) => e.target.value = e.target.value.toUpperCase());
  
  // Gatilho para auto-calcular a data
  $('inicio').addEventListener('input', calcEndDate);$('validade').addEventListener('change', calcEndDate);
}

function resetForm() {
  document.querySelectorAll('input, select').forEach((i) => {
    if(i.tagName === 'SELECT') i.selectedIndex = 0;
    else i.value = '';
  });
  $('emissao').value = getToday();$('inicio').value = getToday();
  calcEndDate();
  $('st').textContent = '';
  document.querySelectorAll('.bad').forEach((i) => i.classList.remove('bad'));
  document.querySelectorAll('.msg').forEach((m) => (m.textContent = ''));
}

/* ==========================================================================
   4. CONSTRUÇÃO DO PDF (jsPDF)
   ========================================================================== */
function buildPDF(scaleFactor, logoBase64) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  
  const W = 210, M = 14, CW = W - 2 * M;
  const COLOR_NAVY = [23, 38, 77];
  const COLOR_ORANGE = [240, 122, 10];
  const COLOR_GRAY = [90, 98, 112];
  let y = 0;

  const checkOverflow = (height) => {
    if (y + height > 272) {
      doc.addPage();
      y = 28;
    }
  };

  const renderBar = (text) => {
    checkOverflow(9.5 * scaleFactor);
    doc.setFillColor(...COLOR_NAVY);
    doc.rect(M, y, CW, 5.8 * scaleFactor, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.8 * scaleFactor);
    doc.setTextColor(255, 255, 255);
    doc.text(text, M + 2.5, y + 4.1 * scaleFactor);
    y += 5.8 * scaleFactor;
  };

  const renderParagraph = (text, size = 8.8, gap = 1.8, style = 'normal', color = [40, 40, 40]) => {
    size *= scaleFactor; gap *= scaleFactor;
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, CW);
    checkOverflow(lines.length * size * 0.38 + gap);
    doc.text(lines, M, y + 3 * scaleFactor);
    y += lines.length * size * 0.38 + gap;
  };

  const renderGrid = (items, height = 10.2) => {
    height *= scaleFactor; checkOverflow(height);
    const totalWeight = items.reduce((acc, item) => acc + (item[2] || 1), 0);
    let x = M;

    items.forEach(([label, value, weight = 1]) => {
      const colWidth = (CW * weight) / totalWeight;
      doc.setDrawColor(190, 198, 215); doc.setFillColor(245, 247, 251);
      doc.rect(x, y, colWidth, height, 'FD');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(6.5 * scaleFactor);
      doc.setTextColor(...COLOR_NAVY); doc.text(label, x + 2, y + 3.2 * scaleFactor);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5 * scaleFactor);
      
      let formattedText = doc.splitTextToSize(value || '', colWidth - 4);
      if (formattedText.length > 1) { doc.setFontSize(7.8 * scaleFactor); formattedText = formattedText.slice(0, 2); }
      doc.setTextColor(25, 25, 25); doc.text(formattedText, x + 2, y + (formattedText.length > 1 ? 6.2 : 7.8) * scaleFactor);
      x += colWidth;
    });
    y += height;
  };

  // Renderiza linhas simulando uma tabela (usado para Veículos e Motoristas)
  const renderTableRow = (items, isHeader = false) => {
    const height = (isHeader ? 6 : 8.5) * scaleFactor;
    checkOverflow(height);
    const totalWeight = items.reduce((acc, item) => acc + (item[1] || 1), 0);
    let x = M;

    items.forEach(([text, weight = 1]) => {
      const colWidth = (CW * weight) / totalWeight;
      doc.setDrawColor(190, 198, 215);
      doc.setFillColor(isHeader ? 230 : 255, isHeader ? 235 : 255, isHeader ? 245 : 255);
      doc.rect(x, y, colWidth, height, 'FD');
      
      doc.setFont('helvetica', isHeader ? 'bold' : 'normal');
      doc.setFontSize((isHeader ? 7 : 8.5) * scaleFactor);
      doc.setTextColor(isHeader ? COLOR_NAVY[0] : 25, isHeader ? COLOR_NAVY[1] : 25, isHeader ? COLOR_NAVY[2] : 25);
      
      doc.text(text || '', x + 2, y + (isHeader ? 4 : 5.5) * scaleFactor);
      x += colWidth;
    });
    y += height;
  };

  // --- CABEÇALHO ---
  doc.setFillColor(...COLOR_NAVY); doc.rect(0, 0, W, 23, 'F');
  doc.setFillColor(...COLOR_ORANGE); doc.rect(0, 23, W, 1.2, 'F');

  if (logoBase64) {
    try { doc.addImage(logoBase64, 'PNG', M, 2.8, 40, 17, undefined, 'FAST'); } catch (e) {}
  }

  doc.setFont('helvetica', 'bold'); doc.setFontSize(10.5); doc.setTextColor(255, 255, 255);
  doc.text('DOCUMENTO DE CADASTRO COMERCIAL', W - M, 10, { align: 'right' });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8.2);
  doc.text('Preenchimento digital · Validação por assinatura GOV.BR', W - M, 15.5, { align: 'right' });
  
  y = 33;

  // --- CORPO DO DOCUMENTO ---
  doc.setFont('helvetica', 'bold'); doc.setFontSize(12.5 * scaleFactor); doc.setTextColor(...COLOR_NAVY);
  doc.text('AUTORIZAÇÃO PERMANENTE DE PORTADORES', W / 2, y, { align: 'center' });
  doc.setFontSize(8.5 * scaleFactor); doc.setTextColor(...COLOR_ORANGE);
  doc.text('RETIRADA NO CD ALÇA VIÁRIA · ASSINATURA EXCLUSIVA GOV.BR', W / 2, y + 4.5 * scaleFactor, { align: 'center' });
  y += 7.5 * scaleFactor;

  renderGrid([['Nº DO PEDIDO / CONTROLE', getValue('controle')], ['DATA DE EMISSÃO', formatDate(getValue('emissao'))]]);
  y += 1.8 * scaleFactor;

  renderBar('1. DA DISTRIBUIDORA (EMITENTE / DEPOSITÁRIA)');
  y += 0.8 * scaleFactor;
  renderParagraph('DISTRIBUIDORA SÃO PAULO — O ATACADO DA CONSTRUÇÃO, inscrita no CNPJ/MF sob o nº 13.424.484/0001-48, com Centro de Distribuição na Alça Viária, Marituba/PA (“CD Alça Viária”), responsável pela guarda e liberação da mercadoria.');

  renderBar('2. DO CLIENTE — TITULAR (OUTORGANTE)');
  renderGrid([
    ['CLIENTE (RAZÃO SOCIAL / NOME)', getValue('cliente'), 2.6],
    ['CNPJ / CPF', getValue('doc'), 1.5],
    ['TELEFONE / CONTATO', getValue('telefone'), 1.5]
  ]);
  y += 1.8 * scaleFactor;

  renderBar('3. DA VALIDADE (SELECIONADA PELO CLIENTE · MÁXIMO 6 MESES)');
  y += 0.8 * scaleFactor;
  renderParagraph('O cliente seleciona o período de validade desta autorização, limitado ao máximo de 6 (seis) meses. Encerrado o prazo, a autorização perde a validade automaticamente.');
  renderGrid([
    ['PERÍODO SELECIONADO', getValue('validade') + ' dias', 1],
    ['INÍCIO DA VIGÊNCIA', formatDate(getValue('inicio')), 1],
    ['VÁLIDO ATÉ', formatDate(getValue('fim')), 1]
  ]);
  y += 1.8 * scaleFactor;

  renderBar('4. DOS PORTADORES AUTORIZADOS (MOTORISTAS)');
  renderTableRow([['NOME DO MOTORISTA', 2.5], ['CPF', 1], ['CNH', 1]], true);
  // Imprime 4 linhas de motoristas como no documento original
  for(let i=1; i<=4; i++) {
      renderTableRow([[getValue(`mot${i}_nome`), 2.5], [getValue(`mot${i}_cpf`), 1], [getValue(`mot${i}_cnh`), 1]]);
  }
  y += 1.8 * scaleFactor;

  renderBar('5. DOS VEÍCULOS AUTORIZADOS');
  renderTableRow([['PLACA', 1], ['MODELO / COR', 2.5]], true);
  for(let i=1; i<=3; i++) {
      renderTableRow([[getValue(`vei${i}_placa`), 1], [getValue(`vei${i}_modelo`), 2.5]]);
  }
  y += 0.8 * scaleFactor;
  renderParagraph('Qualquer motorista listado pode conduzir qualquer veículo listado — a autorização vincula-se às pessoas e placas indicadas, não a combinações fixas.', 7.8, 1.5, 'italic', COLOR_GRAY);
  y += 1.8 * scaleFactor;

  renderBar('6. OBJETO, RESPONSABILIDADES E REVOGAÇÃO');
  y += 0.8 * scaleFactor;
  renderParagraph('a) O cliente AUTORIZA os motoristas e veículos acima a retirar, no CD Alça Viária, as mercadorias referentes às suas notas fiscais, durante a vigência selecionada.', 8.5, 1.0);
  renderParagraph('b) A cada retirada, a Expedição confere a CNH do motorista contra esta lista e registra a NF; não havendo correspondência, a retirada não é liberada.', 8.5, 1.0);
  renderParagraph('c) Efetuada a retirada, a guarda e o transporte passam ao portador/cliente, que responde por avarias e extravio até o destino.', 8.5, 1.0);
  renderParagraph('d) Esta autorização pode ser revogada a qualquer momento pelo cliente (por escrito ou WhatsApp à Distribuidora São Paulo) e produz efeitos somente após a assinatura eletrônica gov.br do cliente.', 8.5, 1.0);
  renderParagraph('Fundamentos: NF-e/DANFE (Ajuste SINIEF nº 07/2005; RICMS/PA); mandato (arts. 653+ do Código Civil); assinatura eletrônica avançada gov.br (Lei nº 14.063/2020).', 7.8, 1.5, 'italic', COLOR_GRAY);

  renderBar('ASSINATURA ELETRÔNICA DO CLIENTE — GOV.BR (OBRIGATÓRIA)');
  
  // Caixote para assinar no gov.br
  const govBoxHeight = 18 * scaleFactor;
  checkOverflow(govBoxHeight + 2);
  doc.setDrawColor(...COLOR_GRAY);
  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.rect(M, y + 0.5 * scaleFactor, CW, govBoxHeight);
  doc.setLineDashPattern([], 0);

  doc.setFont('helvetica', 'italic'); doc.setFontSize(8.2 * scaleFactor); doc.setTextColor(...COLOR_GRAY);
  doc.text('Espaço reservado para a assinatura eletrônica gov.br do CLIENTE (titular)', W / 2, y + (govBoxHeight / 2) + 0.5, { align: 'center' });
  y += govBoxHeight + 2.5 * scaleFactor;

  renderParagraph('Válida somente com assinatura eletrônica gov.br do cliente titular · Lei nº 14.063/2020 · autenticidade em validar.iti.gov.br · consta apenas na via digital.', 7.4, 1.5, 'normal', COLOR_GRAY);

  // Assinaturas Manuais
  y += 12 * scaleFactor;
  checkOverflow(12);
  const colWidth = (CW - 10) / 2;
  doc.setDrawColor(...COLOR_NAVY); doc.setLineWidth(0.3);
  
  doc.line(M, y, M + colWidth, y);
  doc.line(M + colWidth + 10, y, W - M, y);
  
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8.8 * scaleFactor); doc.setTextColor(...COLOR_NAVY);
  doc.text('DISTRIBUIDORA SÃO PAULO — EXPEDIÇÃO', M + colWidth / 2, y + 3.5 * scaleFactor, { align: 'center' });
  doc.text('RESPONSÁVEL PELO CLIENTE (VIA IMPRESSA)', M + colWidth + 10 + colWidth / 2, y + 3.5 * scaleFactor, { align: 'center' });
  
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5 * scaleFactor); doc.setTextColor(...COLOR_GRAY);
  doc.text('Recebimento e arquivo da autorização (via impressa)', M + colWidth / 2, y + 7.0 * scaleFactor, { align: 'center' });
  doc.text('Assinatura por extenso · nome legível (sem rubrica)', M + colWidth + 10 + colWidth / 2, y + 7.0 * scaleFactor, { align: 'center' });

  // Rodapé Fixo
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i); doc.setDrawColor(...COLOR_ORANGE); doc.setLineWidth(0.4); doc.line(M, 283, W - M, 283);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.0); doc.setTextColor(...COLOR_GRAY);
    doc.text('Distribuidora São Paulo · CNPJ 13.424.484/0001-48 · CD Alça Viária — Marituba/PA', M, 287);
    doc.text(`Autorização Permanente confirmada pelo cliente (gov.br).   ${i}/${totalPages}`, W - M, 287, { align: 'right' });
  }

  return doc;
}

function buildAutoFitPDF(logoBase64) {
  for (let k = 1.15; k >= 0.60; k -= 0.01) {
    const pdfDoc = buildPDF(k, logoBase64);
    if (pdfDoc.getNumberOfPages() === 1) return pdfDoc;
  }
  return buildPDF(0.60, logoBase64);
}

/* ==========================================================================
   5. INICIALIZAÇÃO
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  renderForm();
  attachInputEvents();
  resetForm();

  $('clr').onclick = resetForm;

  $('go').onclick = async () => {
    const statusEl = $('st');
    statusEl.style.color = '';

    if (!validateForm()) {
      statusEl.style.color = 'var(--err)';
      statusEl.textContent = 'Corrija os campos destacados.';
      return;
    }

    try {
      statusEl.textContent = 'Gerando PDF...';

      let logoBase64 = null;
      try { logoBase64 = await getBase64ImageFromUrl('assets/logo.png'); } catch (e) {}

      const pdfDoc = buildAutoFitPDF(logoBase64);
      const cleanCtrl = getValue('controle').replace(/[^\w-]+/g, '_') || 'Avulso';
      const filename = `Autorizacao_Permanente_Controle_${cleanCtrl}.pdf`;

      let downloadsAPI = null;
      try { if (typeof claude !== 'undefined' && claude.use) downloadsAPI = await claude.use('downloads'); } catch (e) {}

      if (downloadsAPI) {
        await downloadsAPI.save({ filename: filename, data: pdfDoc.output('blob') });
      } else {
        pdfDoc.save(filename);
      }
      statusEl.style.color = 'var(--ok)';
      statusEl.textContent = 'PDF gerado. Agora é só enviar ao cliente para assinatura no gov.br.';
    } catch (err) {
      statusEl.style.color = 'var(--err)';
      statusEl.textContent = `Não foi possível gerar o PDF: ${err.message || err}`;
    }
  };
});