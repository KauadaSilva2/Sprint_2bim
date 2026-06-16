# 📦 Controle de Almoxarifado

Sistema web de controle de estoque desenvolvido como projeto avaliativo da disciplina **Mentalidade Criativa e Empreendedora** — 3º semestre ADS.

---

## 🚀 Funcionalidades

- ✅ **Cadastrar** materiais com nome e quantidade (POST)
- ✅ **Listar** todos os materiais cadastrados (GET)
- ✅ **Retirar** quantidade do estoque com validação (PUT)
- ✅ **Excluir** materiais do sistema (DELETE)

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

---

## ▶️ Como rodar

Basta abrir o `index.html` no navegador, ou usar o Live Server do VS Code.