# Sistema de Contabilidade Pessoal

Um sistema completo de gerenciamento financeiro pessoal desenvolvido em HTML, CSS e JavaScript puro, com interface moderna e funcionalidades avançadas para controle de receitas e despesas.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Arquitetura do Sistema](#arquitetura-do-sistema)
- [Lógica de Negócio](#lógica-de-negócio)
- [Interface do Usuário](#interface-do-usuário)
- [Armazenamento de Dados](#armazenamento-de-dados)
- [Instalação e Uso](#instalação-e-uso)
- [Configurações](#configurações)
- [Troubleshooting](#troubleshooting)

## 🎯 Visão Geral

O Sistema de Contabilidade Pessoal é uma aplicação web responsiva que permite aos usuários gerenciar suas finanças pessoais de forma eficiente e intuitiva. O sistema oferece controle completo sobre entradas, saídas fixas e variáveis, com suporte a recorrências mensais e categorização de transações.

### Características Principais

- **Interface Moderna**: Design responsivo com tema claro/escuro
- **Navegação Intuitiva**: Carrossel de meses e navegador de anos
- **Filtros Avançados**: Por categoria, status e busca textual
- **Recorrências**: Suporte a lançamentos mensais recorrentes
- **Edição Avançada**: Modal completo para edição de itens
- **Persistência Local**: Dados salvos no navegador
- **Validações Robustas**: Prevenção de erros e duplicatas

## 🚀 Funcionalidades

### 1. Gestão de Lançamentos

#### Tipos de Lançamentos
- **Entradas**: Receitas e ganhos
- **Saídas Fixas**: Despesas recorrentes (aluguel, contas)
- **Saídas Variáveis**: Despesas ocasionais (lazer, compras)

#### Campos dos Lançamentos
- **Descrição**: Nome/identificação do lançamento
- **Valor**: Quantia monetária (formato brasileiro)
- **Categoria**: Classificação da transação
- **Data**: Data do lançamento
- **Vencimento**: Data de vencimento (opcional)
- **Status**: Pago ou Pendente
- **Recorrência**: Mensal ou única

### 2. Navegação Temporal

#### Carrossel de Meses
- Navegação visual entre os 12 meses
- Indicador do mês atual
- Transições suaves

#### Seletor de Ano
- Modal para escolha de ano
- Navegação entre anos
- Persistência da seleção

### 3. Filtros e Busca

#### Filtros Disponíveis
- **Categoria**: Filtrar por tipo de despesa/receita
- **Status**: Pago ou Pendente
- **Busca Textual**: Pesquisa em descrições

#### Chips de Filtro
- Visualização dos filtros ativos
- Remoção individual de filtros
- Reset completo

### 4. Edição Avançada

#### Modal de Edição
- Interface completa para modificação
- Todos os campos editáveis
- Validações em tempo real
- Mudança de tipo de lançamento
- Alteração de recorrência

### 5. Gestão de Dados

#### Limpeza de Dados
- **Limpar Mês**: Remove todos os lançamentos do mês
- **Limpar Duplicatas**: Remove entradas duplicadas automaticamente
- **Confirmações**: Prevenção de exclusões acidentais

#### Recorrências
- Criação automática para meses futuros
- Remoção seletiva (mês atual ou todos os futuros)
- Preservação de propriedades originais

## 🛠️ Tecnologias Utilizadas

### Frontend
- **HTML5**: Estrutura semântica e acessível
- **CSS3**: Estilos modernos com variáveis CSS
- **JavaScript ES6+**: Lógica de negócio e interações

### Recursos
- **LocalStorage**: Persistência de dados local
- **CSS Grid/Flexbox**: Layout responsivo
- **CSS Variables**: Sistema de temas
- **Event Listeners**: Interações dinâmicas
- **DOM Manipulation**: Interface reativa

## 📁 Estrutura do Projeto

```
appcontabilidade/
├── index.html          # Estrutura principal da aplicação
├── styles.css          # Estilos e temas
├── script.js           # Lógica de negócio
└── README.md           # Documentação
```

### Arquivos Principais

#### `index.html`
- Estrutura HTML semântica
- Formulários de entrada
- Tabelas de dados
- Modais (mês/ano e edição)
- Elementos de navegação

#### `styles.css`
- Sistema de variáveis CSS
- Temas claro/escuro
- Layout responsivo
- Animações e transições
- Componentes reutilizáveis

#### `script.js`
- Lógica de negócio completa
- Gerenciamento de estado
- Manipulação de dados
- Event handlers
- Utilitários e helpers

## 🏗️ Arquitetura do Sistema

### Padrão de Design
O sistema segue um padrão modular com separação clara de responsabilidades:

1. **Camada de Apresentação**: HTML + CSS
2. **Camada de Lógica**: JavaScript puro
3. **Camada de Dados**: LocalStorage

### Organização do Código JavaScript

#### Configurações Globais
```javascript
const CONFIG = {
  DEFAULT_CATEGORY: 'Outros',
  DEFAULT_STATUS: 'pago',
  MONTHS: ['Janeiro', 'Fevereiro', ...],
  // ...
};
```

#### Cache de Elementos DOM
```javascript
const elements = new Map();
function getElement(id) {
  if (!elements.has(id)) {
    elements.set(id, document.getElementById(id));
  }
  return elements.get(id);
}
```

#### Estrutura de Dados
```javascript
let data = {
  'Janeiro': {
    'entradas': [...],
    'saidasFixas': [...],
    'saidasVariaveis': [...]
  },
  // ...
};
```

## 💡 Lógica de Negócio

### 1. Gerenciamento de Estado

#### Variáveis Globais
- `data`: Estrutura principal de dados
- `currentMonth`: Mês atual (0-11)
- `currentYear`: Ano atual
- `theme`: Tema atual (light/dark)

#### Persistência
- Dados salvos automaticamente no LocalStorage
- Recuperação automática ao carregar a página
- Backup de configurações do usuário

### 2. Operações CRUD

#### Create (Criar)
```javascript
function addEntry(formData) {
  // Validações
  // Criação do item
  // Adição à estrutura de dados
  // Persistência
  // Atualização da interface
}
```

#### Read (Ler)
```javascript
function renderTable() {
  // Filtragem de dados
  // Ordenação
  // Renderização das tabelas
  // Cálculo de totais
}
```

#### Update (Atualizar)
```javascript
function editarItem(mes, tipo, index) {
  // Abertura do modal
  // Preenchimento do formulário
  // Validações
  // Atualização dos dados
}
```

#### Delete (Remover)
```javascript
function removerItem(mes, tipo, index) {
  // Confirmação
  // Remoção de recorrências
  // Atualização da interface
}
```

### 3. Sistema de Filtros

#### Filtros Aplicados
1. **Categoria**: Filtro por tipo de transação
2. **Status**: Filtro por situação de pagamento
3. **Busca**: Filtro textual em descrições

#### Lógica de Filtragem
```javascript
function applyFilters(items) {
  return items.filter(item => {
    // Aplicar filtro de categoria
    // Aplicar filtro de status
    // Aplicar filtro de busca
    return passesAllFilters;
  });
}
```

### 4. Recorrências

#### Criação de Recorrências
- Detecção automática de itens recorrentes
- Criação para meses futuros
- Preservação de propriedades originais

#### Remoção de Recorrências
- Opção de remover apenas o mês atual
- Opção de remover todos os meses futuros
- Confirmação antes da remoção

### 5. Validações

#### Validações de Entrada
- Campos obrigatórios
- Formato de valores monetários
- Datas válidas
- Prevenção de duplicatas

#### Validações de Negócio
- Data de vencimento posterior à data do lançamento
- Valores positivos
- Categorias válidas

## 🎨 Interface do Usuário

### Design System

#### Cores
- **Tema Claro**: Fundo branco, texto escuro
- **Tema Escuro**: Fundo escuro, texto claro
- **Accent**: Verde (#99f589) para ações principais

#### Tipografia
- Fonte principal: Sistema
- Tamanhos responsivos
- Hierarquia clara

#### Componentes

##### Formulários
- Campos com labels claros
- Validação visual
- Feedback imediato

##### Tabelas
- Layout responsivo
- Ordenação por data
- Ações por linha

##### Modais
- Overlay com blur
- Animações suaves
- Foco automático

##### Botões
- Estados hover/active
- Cores semânticas
- Ícones quando apropriado

### Responsividade

#### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

#### Adaptações
- Layout em coluna única no mobile
- Navegação otimizada para touch
- Tabelas com scroll horizontal

## 💾 Armazenamento de Dados

### LocalStorage

#### Estrutura dos Dados
```javascript
{
  "financas": {
    "Janeiro": {
      "entradas": [...],
      "saidasFixas": [...],
      "saidasVariaveis": [...]
    },
    // ...
  },
  "currentMonth": 0,
  "currentYear": 2025,
  "theme": "light"
}
```

#### Operações
- **Salvar**: `localStorage.setItem('financas', JSON.stringify(data))`
- **Carregar**: `JSON.parse(localStorage.getItem('financas'))`
- **Limpar**: `localStorage.removeItem('financas')`

### Backup e Recuperação
- Dados salvos automaticamente
- Recuperação em caso de erro
- Validação de integridade

## 🚀 Instalação e Uso

### Requisitos
- Navegador moderno (Chrome, Firefox, Safari, Edge)
- JavaScript habilitado
- LocalStorage disponível

### Instalação
1. Clone ou baixe o projeto
2. Abra `index.html` no navegador
3. Comece a usar imediatamente

### Primeiro Uso
1. **Adicionar Lançamentos**: Use o formulário principal
2. **Navegar entre Meses**: Use o carrossel ou seletor de ano
3. **Filtrar Dados**: Use os filtros disponíveis
4. **Editar Itens**: Clique no botão de editar na tabela

### Fluxo de Trabalho Típico
1. Adicionar entradas do mês
2. Adicionar saídas fixas
3. Adicionar saídas variáveis conforme necessário
4. Usar filtros para análise
5. Editar itens conforme necessário

## ⚙️ Configurações

### Configurações do Sistema
```javascript
const CONFIG = {
  DEFAULT_CATEGORY: 'Outros',
  DEFAULT_STATUS: 'pago',
  MONTHS: ['Janeiro', 'Fevereiro', ...],
  TIPOS_CARROSSEL: ['entradas', 'saidasFixas', 'saidasVariaveis']
};
```

### Personalização
- **Categorias**: Adicione novas categorias no HTML
- **Temas**: Modifique as variáveis CSS
- **Comportamento**: Ajuste as configurações no JavaScript

## 🔧 Troubleshooting

### Problemas Comuns

#### Dados Não Salvam
- Verificar se LocalStorage está habilitado
- Verificar espaço disponível no navegador
- Verificar console para erros JavaScript

#### Interface Não Carrega
- Verificar se todos os arquivos estão presentes
- Verificar console para erros de carregamento
- Verificar se JavaScript está habilitado

#### Filtros Não Funcionam
- Verificar se os elementos DOM existem
- Verificar console para erros de JavaScript
- Verificar se os dados estão carregados

#### Modal Não Abre
- Verificar se o HTML do modal está presente
- Verificar se os event listeners estão registrados
- Verificar console para erros JavaScript

### Debug

#### Console Logs
O sistema inclui logs detalhados para debug:
- Criação de itens
- Edição de itens
- Filtros aplicados
- Erros de validação

#### Validação de Elementos
```javascript
function validateElement(id, required = true) {
  const element = document.getElementById(id);
  if (!element && required) {
    console.error(`Elemento obrigatório não encontrado: ${id}`);
    return false;
  }
  return true;
}
```

## 📈 Melhorias Futuras

### Funcionalidades Planejadas
- Exportação de dados (CSV, PDF)
- Gráficos e relatórios
- Backup na nuvem
- Múltiplas contas
- Metas financeiras
- Lembretes de vencimento

### Otimizações Técnicas
- Service Workers para cache
- IndexedDB para dados maiores
- PWA (Progressive Web App)
- Testes automatizados
- Documentação de API

## 📄 Licença

Este projeto é de código aberto e pode ser usado livremente para fins pessoais e educacionais.

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor:
1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

---

**Desenvolvido com ❤️ para facilitar o controle financeiro pessoal**

