const API = 'https://6a30b2ffa7f8866418d64dd2.mockapi.io/api/v1/Usuario';
const tbody = document.getElementById('tbody-materiais');
const statusForm = document.getElementById('status-form');
const btnCad = document.getElementById('btn-cadastrar');
const inputBusca = document.getElementById('input-busca');
const totalItens = document.getElementById('total-itens');

const ESTOQUE_CRITICO = 10; // abaixo disso, item recebe alerta visual

let materiaisAtuais = []; // guarda a última lista vinda da API, sem filtro

function setStatus(msg, type) {
  statusForm.textContent = msg;
  statusForm.className = 'status-bar status-' + type;
}

function formatDate(str) {
  if (!str) return '—';
  const d = new Date(str);
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

/**
 * 
 * @param {number} estoqueAtual     
 * @param {number} quantidadeRetirada 
 * @returns {boolean} 
 */
function validarRetirada(estoqueAtual, quantidadeRetirada) {
  if (quantidadeRetirada <= 0) return false;           // bloqueia zero e negativos
  if (quantidadeRetirada > estoqueAtual) return false; // bloqueia mais do que tem
  return true;
}

// Mensagem amigável pra erro de rede (sem internet) x erro da API
function getMensagemErro(e) {
  if (e instanceof TypeError) {
    return 'Sem conexão com a internet. Verifique sua rede e tente novamente.';
  }
  return e.message || 'Ocorreu um erro inesperado. Tente novamente.';
}

function renderTable(items) {
  // Dashboard: total de itens atualmente exibidos na tabela
  totalItens.textContent = items ? items.length : 0;

  if (!items || items.length === 0) {
    const termo = inputBusca.value.trim();
    const msg = termo
      ? `Nenhum material encontrado para "${termo}".`
      : 'Nenhum material cadastrado ainda.';
    tbody.innerHTML = `<tr><td colspan="5" class="empty">${msg}</td></tr>`;
    return;
  }

  tbody.innerHTML = items.map(item => {
    const qty = parseInt(item.quantidade) || 0;

    let badgeClass;
    if (qty === 0) badgeClass = 'qty-low';
    else if (qty < ESTOQUE_CRITICO) badgeClass = 'qty-warn';
    else badgeClass = 'qty-ok';

    // Classe obrigatória do contrato: estoque-critico para qty < 10
    const trClass = qty < ESTOQUE_CRITICO ? 'estoque-critico' : '';
    const alerta = qty < ESTOQUE_CRITICO ? '<span class="alerta-icone" title="Estoque baixo">⚠️</span>' : '';

    return `<tr class="${trClass}">
      <td>${item.nome || '—'}</td>
      <td><span class="qty-badge ${badgeClass}">${qty}</span> ${alerta}</td>
      <td style="color:#999;font-size:13px">${formatDate(item.createdAt)}</td>

      <td class="col-retirada">
        <div class="retirada-group">
          <input
            type="number"
            id="input-retirada"
            class="input-retirada"
            min="1"
            max="${qty}"
            placeholder="Qtd"
            aria-label="Quantidade a retirar de ${item.nome}"
          />
          <button
            class="btn-baixar"
            data-id="${item.id}"
            data-estoque="${qty}"
            title="Confirmar retirada"
          >↓ Baixar</button>
        </div>
      </td>

      <td>
        <button
          class="btn-excluir"
          data-id="${item.id}"
          title="Excluir material"
        >🗑</button>
      </td>
    </tr>`;
  }).join('');
}

// Aplica o filtro da busca (input-busca) sobre a lista carregada da API
function aplicarFiltro() {
  const termo = inputBusca.value.trim().toLowerCase();

  const filtrados = termo
    ? materiaisAtuais.filter(item => (item.nome || '').toLowerCase().includes(termo))
    : materiaisAtuais;

  renderTable(filtrados);
}

async function carregarMateriais() {
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error('Erro ' + res.status + ' ao carregar materiais.');

    const data = await res.json();
    materiaisAtuais = data;
    aplicarFiltro();
  } catch (e) {
    materiaisAtuais = [];
    totalItens.textContent = '0';
    tbody.innerHTML = `<tr><td colspan="5" class="empty" style="color:#c62828">${getMensagemErro(e)}</td></tr>`;
  }
}

async function cadastrar() {
  const nome = document.getElementById('input-nome').value.trim();
  const quantidade = document.getElementById('input-quantidade').value.trim();

  if (!nome) { setStatus('Informe o nome do material.', 'err'); return; }
  if (quantidade === '' || isNaN(quantidade)) { setStatus('Informe uma quantidade válida.', 'err'); return; }

  btnCad.disabled = true;
  setStatus('Salvando...', 'loading');

  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, quantidade: parseInt(quantidade) })
    });

    if (!res.ok) throw new Error('Erro ' + res.status + ' ao cadastrar material.');

    document.getElementById('input-nome').value = '';
    document.getElementById('input-quantidade').value = '';
    setStatus('Material cadastrado com sucesso!', 'ok');
    await carregarMateriais();
  } catch (e) {
    setStatus(getMensagemErro(e), 'err');
  } finally {
    btnCad.disabled = false;
  }
}

async function retirar(id, estoqueAtual, inputEl, btnEl) {
  const quantidadeRetirada = parseInt(inputEl.value);

  if (isNaN(quantidadeRetirada)) {
    inputEl.setCustomValidity('Informe um número.');
    inputEl.reportValidity();
    return;
  }

  if (!validarRetirada(estoqueAtual, quantidadeRetirada)) {
    inputEl.setCustomValidity(
      quantidadeRetirada <= 0
        ? 'A quantidade deve ser maior que zero.'
        : `Estoque insuficiente. Disponível: ${estoqueAtual}.`
    );
    inputEl.reportValidity();
    return;
  }

  inputEl.setCustomValidity('');
  btnEl.disabled = true;
  btnEl.textContent = '...';

  try {
    const novaQtd = estoqueAtual - quantidadeRetirada;
    const res = await fetch(API + '/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantidade: novaQtd })
    });

    if (!res.ok) throw new Error('Erro ' + res.status + ' ao atualizar estoque.');

    await carregarMateriais();
  } catch (e) {
    btnEl.disabled = false;
    btnEl.textContent = '↓ Baixar';
    alert(getMensagemErro(e));
  }
}

async function excluir(id, btnEl) {
  if (!confirm('Tem certeza que deseja excluir este material?')) return;

  btnEl.disabled = true;

  try {
    const res = await fetch(API + '/' + id, { method: 'DELETE' });
    if (!res.ok) throw new Error('Erro ' + res.status + ' ao excluir material.');
    await carregarMateriais();
  } catch (e) {
    btnEl.disabled = false;
    alert(getMensagemErro(e));
  }
}

tbody.addEventListener('click', e => {
  // Botão Baixar
  const btnBaixar = e.target.closest('.btn-baixar');
  if (btnBaixar) {
    const id = btnBaixar.dataset.id;
    const estoque = parseInt(btnBaixar.dataset.estoque);
    const inputRetirada = btnBaixar.closest('.retirada-group').querySelector('.input-retirada');
    retirar(id, estoque, inputRetirada, btnBaixar);
    return;
  }

  const btnExcluir = e.target.closest('.btn-excluir');
  if (btnExcluir) {
    excluir(btnExcluir.dataset.id, btnExcluir);
  }
});

btnCad.addEventListener('click', cadastrar);
document.getElementById('input-nome').addEventListener('keydown', e => {
  if (e.key === 'Enter') cadastrar();
});

inputBusca.addEventListener('input', aplicarFiltro);

carregarMateriais();