const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro", "Total"
];

// Configurações
const CONFIG = {
  MIN_YEAR: 2020,
  MAX_YEAR: 2030,
  DEFAULT_CATEGORY: 'Outros',
  RECURRENCE_MONTHS: 12
};

// Estado global
let currentMonth = (() => {
  const fromStorage = parseInt(localStorage.getItem('financas_currentMonth') ?? '0', 10);
  if (Number.isInteger(fromStorage) && fromStorage >= 0 && fromStorage < 13) return fromStorage;
  return 0;
})();

let currentYear = (() => {
  const fromStorage = parseInt(localStorage.getItem('financas_currentYear'));
  if (Number.isInteger(fromStorage) && fromStorage >= CONFIG.MIN_YEAR && fromStorage <= CONFIG.MAX_YEAR) return fromStorage;
  return new Date().getFullYear();
})();

// ✅ CORRIGIDO: Estrutura de dados separada por ano
let data = (() => {
  const stored = localStorage.getItem("financas");
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Se os dados antigos não têm estrutura de ano, migrar
      if (parsed && typeof parsed === 'object' && !parsed[currentYear]) {
        console.log('Migrando dados antigos para nova estrutura de ano...');
        return migrateOldData(parsed);
      }
      return parsed;
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      return {};
    }
  }
  return {};
})();

// ✅ NOVA FUNÇÃO: Migração de dados antigos para nova estrutura
function migrateOldData(oldData) {
  const newData = {};
  
  // Migrar dados existentes para o ano atual
  if (oldData && typeof oldData === 'object') {
    newData[currentYear] = {};
    
    // Migrar meses existentes
    months.slice(0, 12).forEach(month => {
      if (oldData[month]) {
        newData[currentYear][month] = { ...oldData[month] };
      }
    });
    
    // Salvar dados migrados
    localStorage.setItem("financas", JSON.stringify(newData));
    console.log('Dados migrados com sucesso para nova estrutura de ano');
  }
  
  return newData;
}

// ✅ NOVA FUNÇÃO: Obter dados do ano e mês atual
function getCurrentData() {
  if (!data[currentYear]) {
    data[currentYear] = {};
  }
  return data[currentYear];
}

// ✅ NOVA FUNÇÃO: Obter dados de um ano específico
function getYearData(year) {
  if (!data[year]) {
    data[year] = {};
  }
  return data[year];
}

// ✅ NOVA FUNÇÃO: Debug - Mostrar estrutura de dados atual
function debugDataStructure() {
  console.log('=== DEBUG: Estrutura de Dados ===');
  console.log('Ano atual:', currentYear);
  console.log('Mês atual:', months[currentMonth]);
  console.log('Estrutura completa:', data);
  
  // Mostrar dados do ano atual
  const currentYearData = getCurrentData();
  console.log('Dados do ano atual:', currentYearData);
  
  // Mostrar contagem por mês
  months.slice(0, 12).forEach(mes => {
    const entradas = currentYearData[mes]?.entradas?.length || 0;
    const saidasFixas = currentYearData[mes]?.saidasFixas?.length || 0;
    const saidasVariaveis = currentYearData[mes]?.saidasVariaveis?.length || 0;
    
    if (entradas > 0 || saidasFixas > 0 || saidasVariaveis > 0) {
      console.log(`${mes}: ${entradas} entradas, ${saidasFixas} saídas fixas, ${saidasVariaveis} saídas variáveis`);
    }
  });
  console.log('================================');
}

// ✅ NOVA FUNÇÃO: Adicionar ao console global para debug
window.debugFinancas = debugDataStructure;

// Carrossel
let carouselIndex = 0;
const tiposCarrossel = ['entradas', 'saidasFixas', 'saidasVariaveis'];
const titulosCarrossel = ['Entradas', 'Saídas Fixas', 'Saídas Variáveis'];

// Cache de elementos DOM
let elements = {};

// Função para obter elementos DOM com cache
function getElement(id) {
  if (!elements[id]) {
    elements[id] = document.getElementById(id);
  }
  return elements[id];
}

// Função para validar se um elemento existe
function validateElement(id, context = '') {
  const element = getElement(id);
  if (!element) {
    console.error(`Elemento ${id} não encontrado${context ? ` em ${context}` : ''}`);
    return false;
  }
  return true;
}

// Initialize form with current date
document.addEventListener('DOMContentLoaded', function() {
  try {
    // Inicializar elementos DOM
    initializeDOMElements();
    
    // Inicializar data atual
    const dataLancInput = getElement('dataLanc');
    if (dataLancInput && !dataLancInput.value) {
      dataLancInput.value = new Date().toISOString().slice(0,10);
    }
    
    // Inicializar funcionalidades
    initFloatingNav();
    initMonthNavigation();
    initFilters();
    initEventListeners();
    
    // Renderizar interface
    updateCategoryFilterOptions();
    renderTable();
    toggleLimparBtn();
    
    // ✅ NOVO: Mostrar informações de debug na inicialização
    console.log('✅ Sistema inicializado com sucesso!');
    console.log(`📅 Ano atual: ${currentYear}`);
    console.log(`📅 Mês atual: ${months[currentMonth]}`);
    console.log('🔧 Para debug, use: debugFinancas() no console');
    
  } catch (error) {
    console.error('Erro na inicialização:', error);
  }
});

// Inicializar elementos DOM
function initializeDOMElements() {
  const requiredElements = [
    'carouselWrapper', 'carouselIndicators', 'totaisResumo'
  ];
  
  const optionalElements = [
    'filterToggle', 'filterPopover', 'monthYearSelector'
  ];
  
  // Verificar elementos obrigatórios
  requiredElements.forEach(id => {
    if (!validateElement(id, 'inicialização')) {
      throw new Error(`Elemento obrigatório não encontrado: ${id}`);
    }
  });
  
  // Verificar elementos opcionais (apenas log de warning)
  optionalElements.forEach(id => {
    if (!getElement(id)) {
      console.warn(`Elemento opcional não encontrado: ${id}`);
    }
  });
}

// Inicializar event listeners
function initEventListeners() {
  // Carrossel
  const carouselPrev = getElement('carouselPrev');
  const carouselNext = getElement('carouselNext');
  
  if (carouselPrev) carouselPrev.onclick = () => {
    carouselIndex = (carouselIndex + tiposCarrossel.length - 1) % tiposCarrossel.length;
    renderCarousel();
  };
  
  if (carouselNext) carouselNext.onclick = () => {
    carouselIndex = (carouselIndex + 1) % tiposCarrossel.length;
    renderCarousel();
  };
  
  // Filtros
  const filtroCategoria = getElement('filtroCategoria');
  const filtroStatus = getElement('filtroStatus');
  const buscaTexto = getElement('buscaTexto');
  
  if (filtroCategoria) filtroCategoria.addEventListener('change', () => { 
    renderTable(); 
    toggleLimparBtn(); 
  });
  
  if (filtroStatus) filtroStatus.addEventListener('change', () => { 
    renderTable(); 
    toggleLimparBtn(); 
  });
  
  if (buscaTexto) buscaTexto.addEventListener('input', () => { 
    renderTable(); 
  });
  
  // Recorrência
  const recorrencia = getElement('recorrencia');
  if (recorrencia) recorrencia.addEventListener('change', function() {
    if (this.value === 'mensal') {
      const dataLancInput = getElement('dataLanc');
      if (dataLancInput && !dataLancInput.value) {
        dataLancInput.value = new Date().toISOString().slice(0,10);
      }
      const recQtd = getElement('recorrenciaQtd');
      if (recQtd && (!recQtd.value || Number(recQtd.value) < 1)) {
        recQtd.value = '12';
      }
    }
  });
  
  // Formulário
  const entryForm = getElement('entryForm');
  if (entryForm) entryForm.onsubmit = handleFormSubmission;
  
  // Botão limpar
  const btnLimparMes = getElement('btnLimparMes');
  if (btnLimparMes) btnLimparMes.addEventListener('click', handleClearMonth);
  
  // Botão limpar duplicatas
  const btnLimparDuplicatas = getElement('btnLimparDuplicatas');
  if (btnLimparDuplicatas) btnLimparDuplicatas.addEventListener('click', limparDuplicatas);
  
  // Modais
  const editModal = getElement('editItemModal');
  const editForm = getElement('editItemForm');
  const editClose = editModal ? editModal.querySelector('.edit-close') : null;
  const editCancel = getElement('editCancel');

  const removeModal = getElement('removeItemModal');
  const removeClose = removeModal ? removeModal.querySelector('.edit-close') : null;
  const removeCancel = getElement('removeCancel');

  if (editForm) editForm.addEventListener('submit', handleEditFormSubmission);
  if (editClose) editClose.addEventListener('click', hideEditModal);
  if (editCancel) editCancel.addEventListener('click', hideEditModal);

  if (removeClose) removeClose.addEventListener('click', hideRemoveModal);
  if (removeCancel) removeCancel.addEventListener('click', hideRemoveModal);

  // Fechar modal ao clicar no overlay
  if (editModal) {
    const editOverlay = editModal.querySelector('.edit-overlay');
    if (editOverlay) editOverlay.addEventListener('click', hideEditModal);
  }
  if (removeModal) {
    const removeOverlay = removeModal.querySelector('.edit-overlay');
    if (removeOverlay) removeOverlay.addEventListener('click', hideRemoveModal);
  }

  // Fechar modais com tecla ESC
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      const editModal = getElement('editItemModal');
      if (editModal && editModal.getAttribute('aria-hidden') === 'false') {
        hideEditModal();
        return;
      }
      const removeModal = getElement('removeItemModal');
      if (removeModal && removeModal.getAttribute('aria-hidden') === 'false') {
        hideRemoveModal();
      }
    }
  });
  
  // Theme toggle
  const themeToggle = getElement('themeToggle');
  if (themeToggle) initThemeToggle(themeToggle);
  
  // Log de elementos não encontrados para debug
  const missingElements = [];
  if (!carouselPrev) missingElements.push('carouselPrev');
  if (!carouselNext) missingElements.push('carouselNext');
  if (!filtroCategoria) missingElements.push('filtroCategoria');
  if (!filtroStatus) missingElements.push('filtroStatus');
  if (!buscaTexto) missingElements.push('buscaTexto');
  if (!recorrencia) missingElements.push('recorrencia');
  if (!entryForm) missingElements.push('entryForm');
  if (!btnLimparMes) missingElements.push('btnLimparMes');
  if (!btnLimparDuplicatas) missingElements.push('btnLimparDuplicatas');
  if (!themeToggle) missingElements.push('themeToggle');

  // Elementos do modal de edição
  if (!getElement('editItemModal')) missingElements.push('editItemModal');
  if (!getElement('editItemForm')) missingElements.push('editItemForm');

  // Elementos do modal de remoção
  if (!getElement('removeItemModal')) missingElements.push('removeItemModal');
  if (!getElement('removeConfirm')) missingElements.push('removeConfirm');
  if (!getElement('removeCancel')) missingElements.push('removeCancel');
  
  if (missingElements.length > 0) {
    console.warn('Elementos não encontrados durante inicialização:', missingElements);
  }
}

// Dynamic Island Navigation Functionality
function initFloatingNav() {
  const dynamicNav = document.querySelector('.dynamic-island-nav');
  if (!dynamicNav) return;
  
  window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollThreshold = 50;
    
    if (scrollTop > scrollThreshold) {
      dynamicNav.classList.add('scrolled');
    } else {
      dynamicNav.classList.remove('scrolled');
    }
  });
}

// Month Navigation Functionality
function initMonthNavigation() {
  const prevBtn = document.querySelector('.prev-month');
  const nextBtn = document.querySelector('.next-month');
  const monthYearSelector = getElement('monthYearSelector');
  
  // Se os elementos de navegação não existirem, não inicializar
  if (!prevBtn || !nextBtn) {
    console.warn('Elementos de navegação por mês não encontrados, pulando inicialização');
    return;
  }
  
  // Previous month
  prevBtn.addEventListener('click', function() {
    if (currentMonth > 0) {
      currentMonth--;
      updateMonthDisplay();
      renderTable();
      renderCarousel();
      updateFilterChips();
    }
  });
  
  // Next month
  nextBtn.addEventListener('click', function() {
    if (currentMonth < 11) {
      currentMonth++;
      updateMonthDisplay();
      renderTable();
      renderCarousel();
      updateFilterChips();
    }
  });
  
  // Month/Year selector (opcional)
  if (monthYearSelector) {
    monthYearSelector.addEventListener('click', function() {
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', !isExpanded);
      
      if (!isExpanded) {
        showMonthYearPicker();
      } else {
        hideMonthYearPicker();
      }
    });
  }
  
  // Initialize display
  updateMonthDisplay();
}

// Theme Management
function initThemeToggle(themeToggle) {
  const savedTheme = localStorage.getItem('financas_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  const themeIcon = themeToggle.querySelector('.theme-icon');
  if (themeIcon) {
    themeIcon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
  }
  
  themeToggle.onclick = () => {
    const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', cur);
    localStorage.setItem('financas_theme', cur);
    
    if (themeIcon) {
      themeIcon.textContent = cur === 'dark' ? '☀️' : '🌙';
    }
  };
}

// ✅ CORRIGIDO: Funções utilitárias
function saveData() {
  // ✅ CORRIGIDO: Salvar dados com estrutura de ano
  localStorage.setItem('financas', JSON.stringify(data));
  console.log('Dados salvos com estrutura de ano:', data);
}

function formatBRL(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ✅ CORRIGIDO: Toggle Limpar Button com estrutura de ano
function toggleLimparBtn() {
  const btn = getElement('btnLimparMes');
  const btnDuplicatas = getElement('btnLimparDuplicatas');
  
  if (!btn) return;
  
  if (months[currentMonth] === 'Total') {
    btn.style.display = 'none';
  } else {
    // ✅ CORRIGIDO: Verificar se há dados no mês atual do ano atual
    const currentYearData = getCurrentData();
    const hasData = currentYearData[months[currentMonth]] && 
                   (currentYearData[months[currentMonth]].entradas?.length > 0 ||
                    currentYearData[months[currentMonth]].saidasFixas?.length > 0 ||
                    currentYearData[months[currentMonth]].saidasVariaveis?.length > 0);
    
    btn.style.display = hasData ? 'inline-block' : 'none';
    btn.textContent = `🗑️ Limpar Mês ${months[currentMonth]} de ${currentYear}`;
  }
  
  // ✅ NOVO: Atualizar botão de duplicatas
  if (btnDuplicatas) {
    btnDuplicatas.textContent = `🧹 Limpar Duplicatas de ${currentYear}`;
  }
}

// ✅ CORRIGIDO: Make updateMonthDisplay globally accessible
window.updateMonthDisplay = function() {
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  const monthName = getElement('monthName');
  const yearDisplay = getElement('yearDisplay');
  
  if (monthName && yearDisplay) {
    monthName.textContent = monthNames[currentMonth];
    yearDisplay.textContent = currentYear;
    
    // ✅ NOVO: Atualizar título da página para mostrar ano atual
    const pageTitle = document.querySelector('h1');
    if (pageTitle) {
      pageTitle.textContent = `Sistema de Contabilidade - ${currentYear}`;
    }
  }
};

// Toast Notifications
function toast(msg) {
  let cont = document.querySelector('.toasts');
  if (!cont) { 
    cont = document.createElement('div'); 
    cont.className = 'toasts'; 
    document.body.appendChild(cont); 
  }
  const el = document.createElement('div');
  el.className = 'toast'; 
  el.textContent = msg;
  cont.appendChild(el);
  setTimeout(() => { el.remove(); }, 2500);
}

// ✅ CORRIGIDO: Clear Month Button com estrutura de ano
function handleClearMonth() {
  const key = months[currentMonth];
  if (key === 'Total') return alert("Aba 'Total' não pode ser limpa.");

  if (confirm(`Deseja limpar todos os dados do mês de ${key} do ano ${currentYear}?`)) {
    // ✅ CORRIGIDO: Usar dados do ano atual
    const currentYearData = getCurrentData();
    delete currentYearData[key];
    saveData();
    renderTable();
    toggleLimparBtn();
    toast(`Mês ${key} de ${currentYear} limpo`);
  }
}

// ✅ CORRIGIDO: Category Management com estrutura de ano
function getAllCategories() {
  const set = new Set();
  // ✅ CORRIGIDO: Usar dados do ano atual
  const currentYearData = getCurrentData();
  
  months.slice(0, 12).forEach(mes => {
    ['entradas', 'saidasFixas', 'saidasVariaveis'].forEach(tipo => {
      (currentYearData[mes]?.[tipo] || []).forEach(item => set.add((item.categoria || CONFIG.DEFAULT_CATEGORY)));
    });
  });
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

function updateCategoryFilterOptions() {
  try {
    const select = getElement('filtroCategoria');
    if (!select) {
      console.error('Elemento filtroCategoria não encontrado');
      return;
    }
    
    const current = select.value || '__todas__';
    while (select.options.length > 1) select.remove(1);
    
    getAllCategories().forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      select.appendChild(opt);
    });
    
    // Preserve selection if still present
    const values = Array.from(select.options).map(o => o.value);
    select.value = values.includes(current) ? current : '__todas__';
  } catch (error) {
    console.error('Erro em updateCategoryFilterOptions:', error);
  }
}

// Variável para controlar submissões múltiplas
let isSubmitting = false;

// Form Submission
function handleFormSubmission(e) {
  e.preventDefault();
  
  // Prevenir submissões múltiplas
  if (isSubmitting) {
    console.warn('Formulário já está sendo processado, ignorando submissão');
    return;
  }
  
  isSubmitting = true;
  
  const formData = {
    tipo: getElement('tipo')?.value || 'entradas',
    desc: getElement('desc')?.value?.trim() || '',
    valor: parseFloat(getElement('valor')?.value || '0'),
    categoria: (getElement('categoria')?.value || CONFIG.DEFAULT_CATEGORY).trim() || CONFIG.DEFAULT_CATEGORY,
    dataLanc: getElement('dataLanc')?.value || new Date().toISOString().slice(0,10),
    vencimento: getElement('vencimento')?.value || '',
    status: getElement('status')?.value || 'pago',
    recorrencia: getElement('recorrencia')?.value || 'nenhuma',
    recorrenciaQtd: Math.max(1, parseInt(getElement('recorrenciaQtd')?.value || '12', 10))
  };
  
  const key = months[currentMonth];
  
  if (key === 'Total') {
    isSubmitting = false;
    return alert('Não é possível adicionar itens na aba Total.');
  }
  if (!formData.desc) {
    isSubmitting = false;
    return alert('Descrição é obrigatória.');
  }
  if (Number.isNaN(formData.valor) || formData.valor < 0) {
    isSubmitting = false;
    return alert('Informe um valor válido (>= 0).');
  }
  
  try {
    console.log('Iniciando criação de lançamento:', formData);
    addEntry(formData);
    
    // Reset form
    e.target.reset();
    
    // Limpa campos específicos após adicionar
    const dataLancInput = getElement('dataLanc');
    const vencimentoInput = getElement('vencimento');
    if (dataLancInput) dataLancInput.value = new Date().toISOString().slice(0,10);
    if (vencimentoInput) vencimentoInput.value = '';
    
    renderTable();
    toggleLimparBtn();
    
    let mensagem = '';
    if (formData.recorrencia === 'mensal') {
      mensagem = `Lançamento recorrente criado por ${formData.recorrenciaQtd} mês(es)`;
    } else {
      mensagem = 'Lançamento adicionado';
    }
    toast(mensagem);
    
  } catch (error) {
    console.error('Erro ao adicionar lançamento:', error);
    alert('Erro ao adicionar lançamento. Tente novamente.');
  } finally {
    // Sempre liberar o flag de submissão
    isSubmitting = false;
  }
}

// ✅ CORRIGIDO: Função para adicionar entrada com estrutura de ano
function addEntry(formData) {
  // Validação adicional dos dados
  if (!formData.desc || !formData.valor || formData.valor <= 0) {
    throw new Error('Dados inválidos para criação de lançamento');
  }
  
  // ✅ CORRIGIDO: Usar estrutura de ano
  const currentYearData = getCurrentData();
  if (!currentYearData[months[currentMonth]]) currentYearData[months[currentMonth]] = {};
  if (!currentYearData[months[currentMonth]][formData.tipo]) currentYearData[months[currentMonth]][formData.tipo] = [];
  
  // ✅ CORRIGIDO: Função para adicionar um lançamento em um mês específico
  const addOne = (mesIdx, customDate, customVencimento = '', targetYear = currentYear) => {
    // Validação dos parâmetros
    if (mesIdx < 0 || mesIdx >= 12) {
      console.error(`Índice de mês inválido: ${mesIdx}`);
      return;
    }
    
    if (!customDate) {
      console.error('Data inválida para criação de lançamento');
      return;
    }
    
    // ✅ CORRIGIDO: Usar dados do ano específico
    const yearData = getYearData(targetYear);
    const k = months[mesIdx];
    if (!yearData[k]) yearData[k] = {};
    if (!yearData[k][formData.tipo]) yearData[k][formData.tipo] = [];
    
    // ✅ CORRIGIDO: Verificar se o item já existe para evitar duplicatas
    // Para itens recorrentes, verifica se já existe um item com a mesma descrição, valor e categoria
    // Para itens não recorrentes, verifica se já existe um item com a mesma descrição, valor, categoria e data
    const existingItem = yearData[k][formData.tipo].find(item => {
      if (formData.recorrencia === 'mensal') {
        // Para itens recorrentes, verifica apenas descrição, valor e categoria
        // Mas também verifica se não é o mesmo item (mesma data)
        return item.desc === formData.desc && 
               item.valor === formData.valor && 
               item.categoria === formData.categoria &&
               item.recorrente === true &&
               item.data !== customDate; // Não é o mesmo item se a data for diferente
      } else {
        // Para itens não recorrentes, verifica também a data
        return item.desc === formData.desc && 
               item.valor === formData.valor && 
               item.categoria === formData.categoria &&
               item.data === customDate &&
               item.recorrente === false;
      }
    });
    
    if (existingItem) {
      console.warn(`Item já existe no mês ${k} do ano ${targetYear}, pulando duplicata:`, {
        desc: formData.desc,
        valor: formData.valor,
        categoria: formData.categoria,
        recorrente: formData.recorrencia === 'mensal',
        dataExistente: existingItem.data,
        dataNova: customDate,
        ano: targetYear
      });
      return; // Não adiciona se já existir
    }
    
    console.log(`Adicionando item no mês ${k} do ano ${targetYear}:`, {
      desc: formData.desc,
      valor: formData.valor,
      categoria: formData.categoria,
      data: customDate,
      vencimento: customVencimento,
      recorrente: formData.recorrencia === 'mensal'
    });
    
    // Para itens recorrentes, ajusta o status baseado na data
    let itemStatus = formData.status;
    if (formData.recorrencia === 'mensal' && mesIdx > currentMonth) {
      // Meses futuros começam como pendentes
      itemStatus = 'pendente';
    }
    
    // ✅ CORRIGIDO: Adicionar ao ano específico
    yearData[k][formData.tipo].push({ 
      desc: formData.desc, 
      valor: formData.valor, 
      categoria: formData.categoria, 
      status: itemStatus, 
      data: customDate, 
      vencimento: customVencimento,
      recorrente: formData.recorrencia === 'mensal',
      recorrenciaQtd: formData.recorrencia === 'mensal' ? formData.recorrenciaQtd : undefined
    });
  };
  
  // Data base para cálculos
  const baseDate = new Date(formData.dataLanc);
  const currentYearDate = new Date().getFullYear();
  
  // Validação da data base
  if (isNaN(baseDate.getTime())) {
    throw new Error('Data de lançamento inválida');
  }
  
  console.log(`Criando lançamento para mês atual (${months[currentMonth]})`);
  // Adiciona no mês atual
  addOne(currentMonth, formData.dataLanc, formData.vencimento);
  
  // Se for recorrente mensal, adiciona conforme a quantidade escolhida
  if (formData.recorrencia === 'mensal') {
    console.log('Criando itens recorrentes mensais...');
    const totalMeses = Math.max(1, Number(formData.recorrenciaQtd || 12));
    
    let addCount = 1; // já adicionamos o mês atual
    let year = currentYear;
    let monthIndex = currentMonth + 1;
    
    while (addCount < totalMeses) {
      if (monthIndex >= 12) {
        monthIndex = 0;
        year += 1;
      }
      
      const nextDate = new Date(year, monthIndex, Math.min(baseDate.getDate(), 28));
      const nextISO = nextDate.toISOString().slice(0, 10);
      
      // Calcula vencimento para o mês (se houver)
      let nextVenc = '';
      if (formData.vencimento) {
        const vencDate = new Date(formData.vencimento);
        const vencDateNext = new Date(year, monthIndex, Math.min(vencDate.getDate(), 28));
        nextVenc = vencDateNext.toISOString().slice(0, 10);
      }
      
      console.log(`Adicionando item recorrente para ${months[monthIndex]}/${year} com data ${nextISO}`);
      addOne(monthIndex, nextISO, nextVenc, year);
      
      addCount += 1;
      monthIndex += 1;
    }
  }
  
  saveData();
  console.log('Lançamento criado com sucesso e dados salvos');
}

// Carousel Rendering
function renderCarousel() {
  try {
    const carouselWrapper = getElement('carouselWrapper');
    const carouselIndicators = getElement('carouselIndicators');
    
    if (!carouselWrapper || !carouselIndicators) {
      console.error('Elementos do carrossel não encontrados');
      return;
    }
    
    carouselWrapper.innerHTML = '';
    carouselIndicators.innerHTML = '';
    
    tiposCarrossel.forEach((tipo, idx) => {
      const slide = document.createElement('div');
      slide.className = 'carousel-slide' + (idx === carouselIndex ? ' active' : '');
      slide.appendChild(renderSingleTable(tipo));
      carouselWrapper.appendChild(slide);
      
      // Indicadores
      const dot = document.createElement('div');
      dot.className = 'carousel-dot' + (idx === carouselIndex ? ' active' : '');
      dot.onclick = () => { 
        carouselIndex = idx; 
        renderCarousel(); 
      };
      carouselIndicators.appendChild(dot);
    });
  } catch (error) {
    console.error('Erro em renderCarousel:', error);
  }
}

// ✅ CORRIGIDO: Single Table Rendering com estrutura de ano
function renderSingleTable(tipo) {
  const key = months[currentMonth];
  let total = 0;
  
  const wrapper = document.createElement('div');
  wrapper.className = 'table-wrapper';
  
  const h3 = document.createElement('h3');
  h3.textContent = titulosCarrossel[tiposCarrossel.indexOf(tipo)];
  wrapper.appendChild(h3);
  
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const showActions = key !== 'Total';
  
  thead.innerHTML = `<tr>
    <th data-col="desc">${h3.textContent}</th>
    <th data-col="categoria">Categoria</th>
    <th data-col="data">Data</th>
    <th data-col="vencimento">Vencimento</th>
    <th data-col="status">Status</th>
    <th data-col="valor">Valor</th>
    ${showActions ? '<th>Ações</th>' : ''}
  </tr>`;
  
  table.appendChild(thead);
  const tbody = document.createElement('tbody');
  
  const filtroCat = getElement('filtroCategoria')?.value || '__todas__';
  const filtroStatus = getElement('filtroStatus')?.value || '__todos__';
  const busca = getElement('buscaTexto')?.value?.trim().toLowerCase() || '';
  
  // ✅ CORRIGIDO: Usar dados do ano atual
  const currentYearData = getCurrentData();
  
  const itemsBase = key === 'Total'
    ? [{ 
        desc: 'Total dos meses', 
        categoria: '', 
        valor: months.slice(0, 12).reduce((soma, mes) => 
          soma + ((currentYearData[mes]?.[tipo] || []).reduce((acc, cur) => acc + cur.valor, 0)), 0), 
        status: 'pago', 
        data: '', 
        vencimento: '' 
      }]
    : (currentYearData[key]?.[tipo] || []);
  
  const items = itemsBase.filter(item => {
    const cat = (item.categoria || CONFIG.DEFAULT_CATEGORY);
    const statusOk = filtroStatus === '__todos__' || key === 'Total' || (item.status || 'pago') === filtroStatus;
    const buscaOk = !busca || key === 'Total' || (item.desc || '').toLowerCase().includes(busca);
    const catOk = filtroCat === '__todas__' || key === 'Total' || cat === filtroCat;
    return catOk && statusOk && buscaOk;
  });
  
  // Ordenação simples por data desc por padrão
  items.sort((a,b) => String(b.data||'').localeCompare(String(a.data||'')));
  
  // ✅ CORRIGIDO: Criar mapeamento entre índice da interface e índice real dos dados
  const originalIndices = items.map((item, displayIndex) => {
    if (key === 'Total') return displayIndex;
    // Encontrar o índice real no array original do ano atual
    const realIndex = currentYearData[key][tipo].findIndex(originalItem => 
      originalItem.desc === item.desc && 
      originalItem.valor === item.valor && 
      originalItem.categoria === item.categoria &&
      originalItem.data === item.data &&
      originalItem.vencimento === item.vencimento &&
      originalItem.status === item.status
    );
    return realIndex;
  });
  
  items.forEach((item, displayIndex) => {
    total += item.valor;
    const tr = document.createElement('tr');
    
    const tdDesc = document.createElement('td');
    // Adiciona indicador de recorrência se for recorrente
    if (item.recorrente) {
      tdDesc.innerHTML = `${item.desc} <span class="recorrente-badge" title="Item recorrente mensal">🔄</span>`;
    } else {
      tdDesc.textContent = item.desc;
    }
    
    const tdCat = document.createElement('td');
    tdCat.textContent = item.categoria || (key === 'Total' ? '-' : CONFIG.DEFAULT_CATEGORY);
    
    const tdData = document.createElement('td');
    tdData.textContent = item.data || '-';
    
    const tdVenc = document.createElement('td');
    tdVenc.textContent = item.vencimento || '-';
    
    const tdStatus = document.createElement('td');
    const st = (item.status || 'pago');
    tdStatus.innerHTML = `<span class="status-badge ${st === 'pago' ? 'status-paid' : 'status-pending'}">${st}</span>`;
    
    const tdValor = document.createElement('td');
    tdValor.textContent = formatBRL(item.valor);
    
    if (st === 'pendente' && item.vencimento) {
      const today = new Date().toISOString().slice(0,10);
      if (item.vencimento < today) tr.classList.add('overdue');
    }
    
    tr.appendChild(tdDesc);
    tr.appendChild(tdCat);
    tr.appendChild(tdData);
    tr.appendChild(tdVenc);
    tr.appendChild(tdStatus);
    tr.appendChild(tdValor);
    
    if (showActions) {
      const tdAcoes = document.createElement('td');
      tdAcoes.className = 'actions';
      
      const btnEditar = document.createElement('button');
      btnEditar.innerHTML = '✏️';
      btnEditar.title = 'Editar';
      btnEditar.onclick = () => editarItem(key, tipo, originalIndices[displayIndex]);
      
      const btnRemover = document.createElement('button');
      btnRemover.innerHTML = '🗑️';
      btnRemover.title = 'Remover';
      btnRemover.onclick = () => showRemoveModal(() => removerItem(key, tipo, originalIndices[displayIndex]));
      
      tdAcoes.appendChild(btnEditar);
      tdAcoes.appendChild(btnRemover);
      tr.appendChild(tdAcoes);
    }
    
    tbody.appendChild(tr);
  });
  
  // Linha total
  const totalRow = document.createElement('tr');
  totalRow.className = 'total-row';
  
  const tdTotalLabel = document.createElement('td');
  tdTotalLabel.textContent = 'Total';
  
  const tdTotalCat = document.createElement('td');
  tdTotalCat.textContent = '';
  
  const tdTotalData = document.createElement('td'); 
  tdTotalData.textContent = '';
  
  const tdTotalVenc = document.createElement('td'); 
  tdTotalVenc.textContent = '';
  
  const tdTotalStatus = document.createElement('td'); 
  tdTotalStatus.textContent = '';
  
  const tdTotalValue = document.createElement('td');
  tdTotalValue.textContent = formatBRL(total);
  
  totalRow.appendChild(tdTotalLabel);
  totalRow.appendChild(tdTotalCat);
  totalRow.appendChild(tdTotalData);
  totalRow.appendChild(tdTotalVenc);
  totalRow.appendChild(tdTotalStatus);
  totalRow.appendChild(tdTotalValue);
  
  if (showActions) {
    totalRow.appendChild(document.createElement('td'));
  }
  
  tbody.appendChild(totalRow);
  table.appendChild(tbody);
  wrapper.appendChild(table);
  
  return wrapper;
}

// ✅ CORRIGIDO: Main Table Rendering com estrutura de ano
function renderTable() {
  try {
    renderCarousel();
    
    // Totais
    const key = months[currentMonth];
    let totalSaidasFixas = 0;
    let totalSaidasVariaveis = 0;
    let totalEntradas = 0;
    
    // ✅ CORRIGIDO: Usar dados do ano atual
    const currentYearData = getCurrentData();
    
    ['entradas', 'saidasFixas', 'saidasVariaveis'].forEach(tipo => {
      const items = key === 'Total'
        ? [{ valor: months.slice(0, 12).reduce((soma, mes) => 
            soma + ((currentYearData[mes]?.[tipo] || []).reduce((acc, cur) => acc + cur.valor, 0)), 0) }]
        : (currentYearData[key]?.[tipo] || []);
      
      const total = items.reduce((acc, cur) => acc + cur.valor, 0);
      
      if (tipo === 'entradas') totalEntradas = total;
      if (tipo === 'saidasFixas') totalSaidasFixas = total;
      if (tipo === 'saidasVariaveis') totalSaidasVariaveis = total;
    });
    
    const totalSaidas = totalSaidasFixas + totalSaidasVariaveis;
    const saldoMensal = totalEntradas - totalSaidas;
    
    const totaisResumo = getElement('totaisResumo');
    if (totaisResumo) {
      totaisResumo.textContent = `Total Geral de Saídas: ${formatBRL(totalSaidas)} | Saldo Mensal: ${formatBRL(saldoMensal)}`;
    }
    
    updateCategoryFilterOptions();
  } catch (error) {
    console.error('Erro em renderTable:', error);
  }
}

// Variáveis globais para edição
let editingItem = null;
let editingMes = null;
let editingTipo = null;
let editingIndex = null;

// ✅ CORRIGIDO: Edit Item com estrutura de ano
function editarItem(mes, tipo, index) {
  if (mes === 'Total') return;

  // ✅ CORRIGIDO: Usar dados do ano atual
  const currentYearData = getCurrentData();
  const item = currentYearData[mes][tipo][index];
  if (!item) return;
  
  // Armazenar informações do item sendo editado
  editingItem = { ...item };
  editingMes = mes;
  editingTipo = tipo;
  editingIndex = index;
  
  // Preencher o formulário de edição
  populateEditForm(item);
  
  // Mostrar o modal
  showEditModal();
}

// ✅ CORRIGIDO: Função para limpar duplicatas com estrutura de ano
function limparDuplicatas() {
  if (!confirm(`Deseja realmente limpar todas as duplicatas do ano ${currentYear}? Esta ação não pode ser desfeita.`)) {
    return;
  }
  
  let totalRemovidos = 0;
  const detalhes = [];
  
  // ✅ CORRIGIDO: Usar dados do ano atual
  const currentYearData = getCurrentData();
  
  months.slice(0, 12).forEach(mes => {
    ['entradas', 'saidasFixas', 'saidasVariaveis'].forEach(tipo => {
      if (currentYearData[mes] && currentYearData[mes][tipo]) {
        const items = currentYearData[mes][tipo];
        const seen = new Set();
        const uniqueItems = [];
        
        items.forEach(item => {
          // Para itens recorrentes, usa apenas descrição, valor e categoria
          // Para itens não recorrentes, inclui também a data
          const key = item.recorrente 
            ? `${item.desc}|${item.valor}|${item.categoria}|true`
            : `${item.desc}|${item.valor}|${item.categoria}|${item.data}|false`;
            
          if (seen.has(key)) {
            totalRemovidos++;
            detalhes.push(`${mes} ${currentYear} - ${tipo}: ${item.desc} (${formatBRL(item.valor)})`);
            console.log(`Removendo duplicata no mês ${mes} do ano ${currentYear}, tipo ${tipo}:`, item);
          } else {
            seen.add(key);
            uniqueItems.push(item);
          }
        });
        
        currentYearData[mes][tipo] = uniqueItems;
      }
    });
  });
  
  if (totalRemovidos > 0) {
    saveData();
    renderTable();
    
    // Mostrar detalhes das duplicatas removidas
    const detalhesText = detalhes.slice(0, 5).join('\n');
    const maisText = detalhes.length > 5 ? `\n... e mais ${detalhes.length - 5} itens` : '';
    
    alert(`Removidas ${totalRemovidos} duplicatas!\n\nDetalhes:\n${detalhesText}${maisText}`);
    toast(`Removidas ${totalRemovidos} duplicatas`);
    console.log(`Total de duplicatas removidas: ${totalRemovidos}`);
    console.log('Detalhes das duplicatas:', detalhes);
  } else {
    toast('Nenhuma duplicata encontrada');
    alert('Nenhuma duplicata foi encontrada no sistema.');
  }
}

// ✅ CORRIGIDO: Remove Item com estrutura de ano
function removerItem(mes, tipo, index) {
  if (mes === 'Total') return;

  // ✅ CORRIGIDO: Usar dados do ano atual
  const currentYearData = getCurrentData();
  const item = currentYearData[mes][tipo][index];
  if (!item) return;

  if (item.recorrente) {
    const confirmMessage = 'Este item é recorrente. Deseja remover apenas este mês ou todos os meses futuros?';
    const choice = confirm(confirmMessage + '\n\nClique OK para remover apenas este mês, ou Cancel para remover todos os meses futuros.');

    if (choice) {
      // Remove apenas este mês do ano atual
      currentYearData[mes][tipo].splice(index, 1);
      toast('Item removido apenas deste mês');
    } else {
      // Remove todos os meses futuros
      const currentYearDate = new Date().getFullYear();
      let removedCount = 0;
      
      // ✅ CORRIGIDO: Remove do mês atual
      currentYearData[mes][tipo].splice(index, 1);
      removedCount++;
      
      // ✅ CORRIGIDO: Remove dos meses futuros do ano atual
      for (let i = currentMonth + 1; i < 12; i++) {
        const k = months[i];
        if (currentYearData[k] && currentYearData[k][tipo]) {
          const futureIndex = currentYearData[k][tipo].findIndex(futureItem => 
            futureItem.desc === item.desc && 
            futureItem.valor === item.valor && 
            futureItem.categoria === item.categoria &&
            futureItem.recorrente === true
          );
          if (futureIndex !== -1) {
            currentYearData[k][tipo].splice(futureIndex, 1);
            removedCount++;
          }
        }
      }
      
      // ✅ CORRIGIDO: Remove do próximo ano se necessário
      if (currentMonth < 11) {
        const nextYearData = getYearData(currentYear + 1);
        for (let i = 0; i < 12; i++) {
          const k = months[i];
          if (nextYearData[k] && nextYearData[k][tipo]) {
            const futureIndex = nextYearData[k][tipo].findIndex(futureItem => 
              futureItem.desc === item.desc && 
              futureItem.valor === item.valor && 
              futureItem.categoria === item.categoria &&
              futureItem.recorrente === true
            );
            if (futureIndex !== -1) {
              nextYearData[k][tipo].splice(futureIndex, 1);
              removedCount++;
            }
          }
        }
      }
      
      toast(`Item recorrente removido de ${removedCount} meses`);
    }
  } else {
    // ✅ CORRIGIDO: Item não recorrente, remove normalmente
    currentYearData[mes][tipo].splice(index, 1);
    toast('Item removido');
  }
  
  saveData();
  renderTable();
  toggleLimparBtn();
}

// Filter Management
function initFilters() {
  const filterToggle = getElement('filterToggle');
  const filterPopover = getElement('filterPopover');
  const popoverClose = document.querySelector('.popover-close');
  
  // Se os filtros não existirem, não inicializar
  if (!filterToggle || !filterPopover) {
    console.warn('Elementos de filtro não encontrados, pulando inicialização');
    return;
  }
  
  // Toggle filter popover
  filterToggle.addEventListener('click', function() {
    const isExpanded = this.getAttribute('aria-expanded') === 'true';
    this.setAttribute('aria-expanded', !isExpanded);
    filterPopover.setAttribute('aria-hidden', isExpanded);
  });
  
  // Close popover
  if (popoverClose) {
    popoverClose.addEventListener('click', function() {
      filterToggle.setAttribute('aria-expanded', 'false');
      filterPopover.setAttribute('aria-hidden', 'true');
    });
  }
  
  // Close popover when clicking outside
  document.addEventListener('click', function(e) {
    if (!filterToggle.contains(e.target) && !filterPopover.contains(e.target)) {
      filterToggle.setAttribute('aria-expanded', 'false');
      filterPopover.setAttribute('aria-hidden', 'true');
    }
  });
  
  // Update filter chips when filters change
  const filtroCategoria = getElement('filtroCategoria');
  const filtroStatus = getElement('filtroStatus');
  
  if (filtroCategoria) filtroCategoria.addEventListener('change', updateFilterChips);
  if (filtroStatus) filtroStatus.addEventListener('change', updateFilterChips);
  
  // Initialize chips
  updateFilterChips();
}

function updateFilterChips() {
  const categoryChip = document.querySelector('.category-chip .chip-label');
  const statusChip = document.querySelector('.status-chip .chip-label');
  const categorySelect = getElement('filtroCategoria');
  const statusSelect = getElement('filtroStatus');
  
  if (categoryChip && categorySelect) {
    const selectedOption = categorySelect.options[categorySelect.selectedIndex];
    categoryChip.textContent = selectedOption.textContent;
  }
  
  if (statusChip && statusSelect) {
    const selectedOption = statusSelect.options[statusSelect.selectedIndex];
    statusChip.textContent = selectedOption.textContent;
  }
  
  // Adicionar funcionalidade aos botões de remoção dos chips
  const chipRemoves = document.querySelectorAll('.chip-remove');
  chipRemoves.forEach(removeBtn => {
    // Remove event listeners existentes para evitar duplicação
    removeBtn.replaceWith(removeBtn.cloneNode(true));
  });
  
  // Adicionar event listeners aos novos botões
  const newChipRemoves = document.querySelectorAll('.chip-remove');
  newChipRemoves.forEach(removeBtn => {
    removeBtn.addEventListener('click', function() {
      const chip = this.closest('.chip');
      if (chip.classList.contains('category-chip')) {
        // Reset categoria para "Todas"
        if (categorySelect) {
          categorySelect.value = '__todas__';
          renderTable();
          updateFilterChips();
        }
      } else if (chip.classList.contains('status-chip')) {
        // Reset status para "Todos"
        if (statusSelect) {
          statusSelect.value = '__todos__';
          renderTable();
          updateFilterChips();
        }
      }
    });
  });
}

function showMonthYearPicker() {
  const picker = getElement('monthYearPicker');
  const currentYearSpan = getElement('pickerCurrentYear');
  const monthOptions = document.querySelectorAll('.month-option');
  
  if (!picker || !currentYearSpan) return;
  
  // Set current year from global variable
  currentYearSpan.textContent = currentYear;
  
  // Highlight current month
  monthOptions.forEach((option, index) => {
    option.classList.remove('selected');
    if (index === currentMonth) {
      option.classList.add('selected');
    }
  });
  
  // Show picker
  picker.setAttribute('aria-hidden', 'false');
  
  // Add event listeners
  initMonthYearPickerEvents();
}

function hideMonthYearPicker() {
  const picker = getElement('monthYearPicker');
  if (!picker) return;
  
  picker.setAttribute('aria-hidden', 'true');
  
  // Reset month year selector state
  const monthYearSelector = getElement('monthYearSelector');
  if (monthYearSelector) {
    monthYearSelector.setAttribute('aria-expanded', 'false');
  }
}

function initMonthYearPickerEvents() {
  const picker = getElement('monthYearPicker');
  const prevYearBtn = getElement('prevYear');
  const nextYearBtn = getElement('nextYear');
  const monthOptions = document.querySelectorAll('.month-option');
  const pickerClose = document.querySelector('.picker-close');
  const pickerCancel = getElement('pickerCancel');
  const pickerConfirm = getElement('pickerConfirm');
  const currentYearSpan = getElement('pickerCurrentYear');
  
  if (!picker || !prevYearBtn || !nextYearBtn || !pickerConfirm) return;
  
  let selectedMonth = currentMonth;
  let selectedYear = currentYear;
  
  // Year navigation
  prevYearBtn.onclick = () => {
    selectedYear = Math.max(selectedYear - 1, CONFIG.MIN_YEAR);
    if (currentYearSpan) currentYearSpan.textContent = selectedYear;
  };
  
  nextYearBtn.onclick = () => {
    selectedYear = Math.min(selectedYear + 1, CONFIG.MAX_YEAR);
    if (currentYearSpan) currentYearSpan.textContent = selectedYear;
  };
  
  // Month selection
  monthOptions.forEach((option, index) => {
    option.onclick = () => {
      monthOptions.forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');
      selectedMonth = index;
    };
  });
  
  // Close picker
  if (pickerClose) pickerClose.onclick = hideMonthYearPicker;
  if (pickerCancel) pickerCancel.onclick = hideMonthYearPicker;
  
  // Confirm selection
  pickerConfirm.onclick = () => {
    let needsUpdate = false;
    
    // Update current month if different
    if (selectedMonth !== currentMonth) {
      currentMonth = selectedMonth;
      localStorage.setItem('financas_currentMonth', String(currentMonth));
      needsUpdate = true;
    }
    
    // ✅ CORRIGIDO: Update current year if different
    if (selectedYear !== currentYear) {
      console.log(`Mudando de ano ${currentYear} para ${selectedYear}`);
      currentYear = selectedYear;
      localStorage.setItem('financas_currentYear', String(currentYear));
      needsUpdate = true;
      
      // ✅ NOVO: Garantir que o ano tenha estrutura de dados
      if (!data[currentYear]) {
        data[currentYear] = {};
        console.log(`Criada nova estrutura de dados para o ano ${currentYear}`);
        
        // ✅ NOVO: Mostrar mensagem informativa sobre mudança de ano
        const yearData = getYearData(selectedYear);
        const hasData = months.slice(0, 12).some(mes => 
          yearData[mes] && 
          (yearData[mes].entradas?.length > 0 ||
           yearData[mes].saidasFixas?.length > 0 ||
           yearData[mes].saidasVariaveis?.length > 0)
        );
        
        if (!hasData) {
          toast(`Ano ${selectedYear} - Nenhum dado encontrado. Comece a adicionar seus lançamentos!`);
        } else {
          toast(`Carregando dados do ano ${selectedYear}`);
        }
      }
    }
    
    // Update display and render if needed
    if (needsUpdate) {
      updateMonthDisplay();
      renderTable();
      renderCarousel();
      updateFilterChips();
      toggleLimparBtn(); // ✅ NOVO: Atualizar botões
    }
    
    hideMonthYearPicker();
  };
  
  // Close on overlay click
  const overlay = picker.querySelector('.picker-overlay');
  if (overlay) overlay.onclick = hideMonthYearPicker;
}

// Funções do Modal de Edição
function showEditModal() {
  const modal = getElement('editItemModal');
  if (!modal) {
    console.error('Modal de edição não encontrado');
    return;
  }
  
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden'; // Previne scroll da página
  
  console.log('Modal de edição aberto');
  
  // Focar no primeiro campo
  const firstInput = modal.querySelector('input, select');
  if (firstInput) {
    setTimeout(() => firstInput.focus(), 100);
  }
}

function hideEditModal() {
  const modal = getElement('editItemModal');
  if (!modal) return;
  
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = ''; // Restaura scroll da página
  
  // Limpar formulário
  const editForm = getElement('editItemForm');
  if (editForm) editForm.reset();
  
  // Limpar dados de edição
  editingItem = null;
  editingMes = null;
  editingTipo = null;
  editingIndex = null;
  
  console.log('Modal de edição fechado e dados limpos');
}

// Funções do Modal de Remoção
function showRemoveModal(onConfirm) {
  const modal = getElement('removeItemModal');
  const confirmBtn = getElement('removeConfirm');
  const cancelBtn = getElement('removeCancel');
  if (!modal || !confirmBtn || !cancelBtn) {
    console.error('Modal de remoção não encontrado');
    return;
  }

  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  confirmBtn.onclick = () => {
    onConfirm();
    hideRemoveModal();
  };
  cancelBtn.onclick = hideRemoveModal;
}

function hideRemoveModal() {
  const modal = getElement('removeItemModal');
  if (!modal) return;

  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function populateEditForm(item) {
  // Preencher campos do formulário
  const editDesc = getElement('editDesc');
  const editValor = getElement('editValor');
  const editCategoria = getElement('editCategoria');
  const editStatus = getElement('editStatus');
  const editData = getElement('editData');
  const editVencimento = getElement('editVencimento');
  const editRecorrencia = getElement('editRecorrencia');
  const editRecorrenciaQtd = getElement('editRecorrenciaQtd');
  const editTipo = getElement('editTipo');
  
  if (editDesc) editDesc.value = item.desc || '';
  if (editValor) editValor.value = item.valor || 0;
  if (editCategoria) editCategoria.value = item.categoria || CONFIG.DEFAULT_CATEGORY;
  if (editStatus) editStatus.value = item.status || 'pago';
  if (editData) editData.value = item.data || new Date().toISOString().slice(0, 10);
  if (editVencimento) editVencimento.value = item.vencimento || '';
  if (editRecorrencia) editRecorrencia.value = item.recorrente ? 'mensal' : 'nenhuma';
  if (editRecorrenciaQtd) editRecorrenciaQtd.value = item.recorrente ? (item.recorrenciaQtd || 12) : '';
  if (editTipo) editTipo.value = editingTipo || 'entradas';
  
  console.log('Formulário de edição preenchido:', {
    item,
    editingTipo,
    editingMes,
    editingIndex
  });
}

function handleEditFormSubmission(e) {
  e.preventDefault();
  
  if (!editingItem || editingMes === null || editingTipo === null || editingIndex === null) {
    console.error('Dados de edição inválidos');
    return;
  }
  
  // Coletar dados do formulário
  const formData = {
    desc: getElement('editDesc')?.value?.trim() || '',
    valor: parseFloat(getElement('editValor')?.value || '0'),
    categoria: (getElement('editCategoria')?.value || CONFIG.DEFAULT_CATEGORY).trim() || CONFIG.DEFAULT_CATEGORY,
    status: getElement('editStatus')?.value || 'pago',
    data: getElement('editData')?.value || '',
    vencimento: getElement('editVencimento')?.value || '',
    recorrencia: getElement('editRecorrencia')?.value || 'nenhuma',
    tipo: getElement('editTipo')?.value || editingTipo,
    recorrenciaQtd: Math.max(1, parseInt(getElement('editRecorrenciaQtd')?.value || '12', 10))
  };
  
  // Validações
  if (!formData.desc) {
    alert('Descrição é obrigatória.');
    getElement('editDesc')?.focus();
    return;
  }
  
  if (Number.isNaN(formData.valor) || formData.valor < 0) {
    alert('Informe um valor válido (>= 0).');
    getElement('editValor')?.focus();
    return;
  }
  
  if (!formData.data) {
    alert('Data é obrigatória.');
    getElement('editData')?.focus();
    return;
  }
  
  // Validação adicional para vencimento
  if (formData.vencimento && formData.vencimento < formData.data) {
    alert('A data de vencimento não pode ser anterior à data do lançamento.');
    getElement('editVencimento')?.focus();
    return;
  }
  
  try {
    console.log('Atualizando item:', {
      original: { mes: editingMes, tipo: editingTipo, index: editingIndex },
      novo: formData
    });
    
    // ✅ CORRIGIDO: Verificar se o tipo mudou
    if (formData.tipo !== editingTipo) {
      console.log('Tipo mudou de', editingTipo, 'para', formData.tipo);
      
      // ✅ CORRIGIDO: Usar dados do ano atual
      const currentYearData = getCurrentData();
      
      // Se o tipo mudou, remover do tipo antigo e adicionar ao novo
      currentYearData[editingMes][editingTipo].splice(editingIndex, 1);
      
      // Se não existir o novo tipo, criar
      if (!currentYearData[editingMes][formData.tipo]) {
        currentYearData[editingMes][formData.tipo] = [];
      }
      
      // Adicionar ao novo tipo
      currentYearData[editingMes][formData.tipo].push({
        desc: formData.desc,
        valor: formData.valor,
        categoria: formData.categoria,
        status: formData.status,
        data: formData.data,
        vencimento: formData.vencimento,
        recorrente: formData.recorrencia === 'mensal',
        recorrenciaQtd: formData.recorrencia === 'mensal' ? formData.recorrenciaQtd : undefined
      });
      
      console.log('Item movido para novo tipo');
    } else {
      console.log('Atualizando item no mesmo tipo');
      
      // ✅ CORRIGIDO: Usar dados do ano atual
      const currentYearData = getCurrentData();
      
      // Verificar se a recorrência mudou
      const recorrênciaMudou = editingItem.recorrente !== (formData.recorrencia === 'mensal');
      
      if (recorrênciaMudou) {
        console.log('Recorrência mudou, removendo item antigo e criando novo');
        
        // Se a recorrência mudou, remover o item antigo
        currentYearData[editingMes][editingTipo].splice(editingIndex, 1);
        
        // Adicionar o novo item
        currentYearData[editingMes][editingTipo].push({
          desc: formData.desc,
          valor: formData.valor,
          categoria: formData.categoria,
          status: formData.status,
          data: formData.data,
          vencimento: formData.vencimento,
          recorrente: formData.recorrencia === 'mensal',
          recorrenciaQtd: formData.recorrencia === 'mensal' ? formData.recorrenciaQtd : undefined
        });
      } else {
        // Atualizar item existente
        currentYearData[editingMes][editingTipo][editingIndex] = {
          desc: formData.desc,
          valor: formData.valor,
          categoria: formData.categoria,
          status: formData.status,
          data: formData.data,
          vencimento: formData.vencimento,
          recorrente: formData.recorrencia === 'mensal',
          recorrenciaQtd: formData.recorrencia === 'mensal' ? formData.recorrenciaQtd : undefined
        };
      }
    }
    
    saveData();
    renderTable();
    toggleLimparBtn();
    
    hideEditModal();
    toast('Lançamento atualizado com sucesso!');
    
  } catch (error) {
    console.error('Erro ao atualizar lançamento:', error);
    alert('Erro ao atualizar lançamento. Tente novamente.');
  }
}


