const API = 'https://6a30b2ffa7f8866418d64dd2.mockapi.io/api/v1/Usuario';
const tbody = document.getElementById('tbody-materiais');
const statusForm = document.getElementById('status-form');
const btnCad = document.getElementById('btn-cadastrar');

function setStatus(msg, type) {
  statusForm.textContent = msg;
  statusForm.className = 'status-bar status-' + type;
}

function formatDate(str) {
  if (!str) return '—';
  const d = new Date(str);
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// ─── NOVA FUNÇÃO OBRIGATÓRIA ───────────────────────────────────────────────
/**
 * Valida se uma retirada de estoque é permitida.
 * @param {number} estoqueAtual     - Quantidade disponível no momento.
 * @param {number} quantidadeRetirada - Quantidade que se deseja retirar.
 * @returns {boolean} true se válida, false se inválida.
 */
function validarRetirada(estoqueAtual, quantidadeRetirada) {
  if (quantidadeRetirada <= 0) return false;           // bloqueia zero e negativos
  if (quantidadeRetirada > estoqueAtual) return false; // bloqueia mais do que tem
  return true;
}

// ─── RENDERIZAÇÃO DA TABELA ────────────────────────────────────────────────
function renderTable(items) {
  if (!items || items.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty">Nenhum material cadastrado ainda.</td></tr>';
    return;
  }

  tbody.innerHTML = items.map(item => {
    const qty = parseInt(item.quantidade) || 0;
    const badgeClass = qty > 0 ? 'qty-ok' : 'qty-low';

    return `<tr>
      <td>${item.nome || '—'}</td>
      <td><span class="qty-badge ${badgeClass}">${qty}</span></td>
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

// ─── CARREGAR MATERIAIS ────────────────────────────────────────────────────
async function carregarMateriais() {
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error('Erro ' + res.status);
    const data = await res.json();
    renderTable(data);
  } catch (e) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty" style="color:#c62828">Erro ao carregar materiais. Verifique a URL do MockAPI.</td></tr>';
  }
}

// ─── CADASTRAR ─────────────────────────────────────────────────────────────
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

    if (!res.ok) throw new Error('Erro ' + res.status);

    document.getElementById('input-nome').value = '';
    document.getElementById('input-quantidade').value = '';
    setStatus('Material cadastrado com sucesso!', 'ok');
    await carregarMateriais();
  } catch (e) {
    setStatus('Erro ao cadastrar. Verifique o MockAPI.', 'err');
  } finally {
    btnCad.disabled = false;
  }
}

// ─── RETIRAR (PUT) ─────────────────────────────────────────────────────────
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

    if (!res.ok) throw new Error('Erro ' + res.status);

    await carregarMateriais();
  } catch (e) {
    btnEl.disabled = false;
    btnEl.textContent = '↓ Baixar';
    alert('Erro ao atualizar. Verifique o MockAPI.');
  }
}

// ─── EXCLUIR (DELETE) ──────────────────────────────────────────────────────
async function excluir(id, btnEl) {
  if (!confirm('Tem certeza que deseja excluir este material?')) return;

  btnEl.disabled = true;

  try {
    const res = await fetch(API + '/' + id, { method: 'DELETE' });
    if (!res.ok) throw new Error('Erro ' + res.status);
    await carregarMateriais();
  } catch (e) {
    btnEl.disabled = false;
    alert('Erro ao excluir. Verifique o MockAPI.');
  }
}

// ─── DELEGAÇÃO DE EVENTOS NA TABELA ───────────────────────────────────────
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

  // Botão Excluir
  const btnExcluir = e.target.closest('.btn-excluir');
  if (btnExcluir) {
    excluir(btnExcluir.dataset.id, btnExcluir);
  }
});

// ─── EVENTOS DO FORMULÁRIO DE CADASTRO ────────────────────────────────────
btnCad.addEventListener('click', cadastrar);
document.getElementById('input-nome').addEventListener('keydown', e => {
  if (e.key === 'Enter') cadastrar();
});

carregarMateriais();