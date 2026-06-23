# 📦 Controle de Almoxarifado

🌐 **Projeto no ar:** [cole aqui o link do GitHub Pages/Vercel depois do deploy]

Sistema web de controle de estoque desenvolvido como projeto avaliativo da disciplina **Mentalidade Criativa e Empreendedora** — 3º semestre ADS.

---

## 🚀 Funcionalidades

- ✅ **Cadastrar** materiais com nome e quantidade (POST)
- ✅ **Listar** todos os materiais cadastrados (GET)
- ✅ **Retirar** quantidade do estoque com validação (PUT)
- ✅ **Excluir** materiais do sistema (DELETE)
- ✅ **Buscar** materiais pelo nome em tempo real
- ✅ **Dashboard** com o total de itens exibidos na tabela
- ✅ **Alerta visual** para materiais com estoque crítico (menos de 10 unidades)
- ✅ **Tratamento de erros** de rede e da API em todas as requisições

---

## 🔍 Busca de Materiais

O campo `id="input-busca"` filtra a tabela em tempo real (evento `input`), comparando o termo digitado com o nome de cada material, sem diferenciar maiúsculas/minúsculas.

---

## 📊 Dashboard de Total de Itens

O elemento `id="total-itens"` mostra a quantidade de materiais exibidos na tabela no momento — atualiza automaticamente ao cadastrar, retirar, excluir ou filtrar pela busca.

---

## ⚠️ Alerta de Estoque Crítico

Toda linha da tabela cujo material tenha **menos de 10 unidades** em estoque recebe a classe `class="estoque-critico"`, adicionada via JavaScript na função `renderTable`. Essa linha ganha destaque visual (fundo amarelo claro, borda lateral laranja e ícone ⚠️) para chamar atenção de quem está consultando o estoque.

---

## 🛡️ Tratamento de Erros

Todas as funções que fazem `fetch` (`carregarMateriais`, `cadastrar`, `retirar`, `excluir`) possuem blocos `try/catch`, evitando que a aplicação "quebre" silenciosamente. A função `getMensagemErro` diferencia:

- **Erro de conexão** (sem internet, `TypeError`) → mensagem de "sem conexão"
- **Erro da API** (status diferente de OK) → mensagem com o código de erro

---

## 🛡️ Validação de Retirada

A função `validarRetirada(estoqueAtual, quantidadeRetirada)` garante que:

- Não é possível retirar quantidade **zero ou negativa**
- Não é possível retirar **mais do que o estoque disponível**

```js
validarRetirada(10, 5)  // true  ✅
validarRetirada(5, 10)  // false ❌ (maior que o estoque)
validarRetirada(5, -1)  // false ❌ (negativo)
validarRetirada(5, 0)   // false ❌ (zero)
```

---

## 🗂️ Estrutura do Projeto

```
/
├── index.html   → Estrutura da interface
├── main.css     → Estilização
├── script.js    → Lógica e integração com MockAPI
├── package.json → Metadados do projeto
└── README.md    → Documentação
```

---

## 🔌 API

Integração com [MockAPI](https://mockapi.io/).

| Ação      | Método | Endpoint              |
|-----------|--------|-----------------------|
| Listar    | GET    | `/api/v1/Usuario`     |
| Cadastrar | POST   | `/api/v1/Usuario`     |
| Retirar   | PUT    | `/api/v1/Usuario/:id` |
| Excluir   | DELETE | `/api/v1/Usuario/:id` |

---

## 📋 Histórico de Commits

| Commit | Descrição |
|--------|-----------|
| `feat: estrutura inicial` | HTML, CSS e listagem de materiais |
| `feat: cadastro de materiais` | Formulário e integração POST |
| `feat: add retirada (PUT) e exclusão (DELETE) de materiais` | Módulo de baixa de estoque e exclusão com validação |
| `feat: add busca, dashboard de total e alerta de estoque crítico` | Filtro em tempo real, contador de itens e classe `estoque-critico` |
| `fix: tratamento de erros de rede` | Diferencia erro de conexão de erro da API em todas as requisições |
| `chore: deploy do projeto` | Publicação no GitHub Pages/Vercel |
