// ============================================================
// DOGÃO & DOGUINHO — Cardápio + carrinho + WhatsApp
// ============================================================

const CART = [];
const CONDIMENTOS = [
  'Caldo', 'Tempero', 'Maionese artesanal', 'Ketchup', 'Mostarda',
  'Barbecue', 'Cheddar', 'Catupiry', 'Queijo ralado', 'Batata palha'
];

const money = value => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// ── Abas ─────────────────────────────────────────────────────
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const targetId = tab.dataset.tab;
    const container = tab.closest('.cardapio-section, .painel-section');
    if (!container) return;
    container.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    container.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    const panel = container.querySelector(`#tab-${targetId}`);
    if (panel) panel.classList.add('active');
  });
});

// ── Status flutuante ─────────────────────────────────────────
const widget = document.getElementById('statusWidget');
const toggle = document.getElementById('statusToggle');
if (widget && toggle) {
  toggle.addEventListener('click', e => {
    e.stopPropagation();
    widget.classList.toggle('open');
  });
  document.addEventListener('click', e => {
    if (!widget.contains(e.target)) widget.classList.remove('open');
  });
}

// ── Modais ───────────────────────────────────────────────────
const productModal = document.getElementById('productModal');
const checkoutModal = document.getElementById('checkoutModal');
const productForm = document.getElementById('productForm');
let currentProduct = null;

function openModal(modal) {
  if (!modal) return;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  if (!document.querySelector('.modal-overlay.open')) document.body.classList.remove('modal-open');
}

document.getElementById('modalClose')?.addEventListener('click', () => closeModal(productModal));
document.getElementById('checkoutClose')?.addEventListener('click', () => closeModal(checkoutModal));
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal(overlay);
  });
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeModal(productModal);
    closeModal(checkoutModal);
  }
});

function renderCondimentos() {
  const list = document.getElementById('condimentosList');
  if (!list) return;
  list.innerHTML = CONDIMENTOS.map((name, i) => `
    <label class="check-card">
      <input type="checkbox" name="condimento" value="${name}" data-condimento-index="${i}">
      <span>${name}</span>
    </label>
  `).join('');
}

function updateCondimentosMode() {
  const mode = document.querySelector('input[name="condimentosMode"]:checked')?.value || 'completo';
  const list = document.getElementById('condimentosList');
  if (!list) return;
  const checks = [...list.querySelectorAll('input[type="checkbox"]')];
  const specific = mode === 'especificos';
  list.classList.toggle('is-disabled', !specific);
  checks.forEach(check => {
    check.disabled = !specific;
    check.checked = !specific;
  });
}

document.querySelectorAll('input[name="condimentosMode"]').forEach(input => {
  input.addEventListener('change', updateCondimentosMode);
});

function productAdditionalTotal() {
  return [...document.querySelectorAll('input[name="adicional"]:checked')]
    .reduce((sum, input) => sum + Number(input.dataset.price || 0), 0);
}

function updateModalPrice() {
  if (!currentProduct) return;
  document.getElementById('modalPrice').textContent = money(currentProduct.preco + productAdditionalTotal());
}

function openProduct(product) {
  currentProduct = product;
  document.getElementById('productId').value = product.id;
  document.getElementById('modalTitle').textContent = product.nome;
  document.getElementById('modalDescription').textContent = product.descricao || '';
  document.getElementById('itemObservacao').value = '';

  const group = document.getElementById('additionalGroup');
  const comboGroup = document.getElementById('comboDrinkGroup');
  const condimentosGroup = document.querySelector('#condimentosList')?.closest('.option-group');

  const isMontavel = Boolean(product.montavel);
  const isCombo = Boolean(product.combo);

  // Adicionais: somente nos produtos Gourmet. O preço vem da categoria do item.
  if (isMontavel && Number(product.adicionalPreco || 0) > 0) {
    group.innerHTML = `
      <h3>Adicionais</h3>
      <p class="option-help">Cada adicional acrescenta ${money(Number(product.adicionalPreco))}.</p>
      <div class="check-grid">
        <label class="check-card">
          <input type="checkbox" name="adicional" value="Adicional" data-price="${Number(product.adicionalPreco)}">
          <span>Adicionar + Queijo<strong>+ ${money(Number(product.adicionalPreco))}</strong></span>
        </label>
      </div>
    `;
    group.hidden = false;
    group.querySelectorAll('input[name="adicional"]').forEach(input => input.addEventListener('change', updateModalPrice));
  } else {
    group.innerHTML = '';
    group.hidden = true;
  }

  // Combo tradicional: permite escolher o refrigerante 200ml incluído.
  if (comboGroup) {
    comboGroup.hidden = !isCombo;
    if (isCombo) {
      const select = document.getElementById('comboDrink');
      select.innerHTML = '<option value="Refrigerante Goob 200ml">Refrigerante Goob 200ml</option>';
    }
  }

  // Bebidas não recebem montagem, molhos ou condimentos.
  if (condimentosGroup) condimentosGroup.hidden = !isMontavel;

  document.querySelector('input[name="condimentosMode"][value="completo"]').checked = true;
  updateCondimentosMode();
  updateModalPrice();
  openModal(productModal);
}

renderCondimentos();
updateCondimentosMode();

document.querySelectorAll('.btn-pedir').forEach(button => {
  button.addEventListener('click', () => {
    try {
      const product = JSON.parse(button.dataset.product);
      openProduct(product);
    } catch (error) {
      console.error('Produto inválido:', error);
    }
  });
});

productForm?.addEventListener('submit', e => {
  e.preventDefault();
  if (!currentProduct) return;

  const mode = currentProduct.montavel
    ? (document.querySelector('input[name="condimentosMode"]:checked')?.value || 'completo')
    : 'nenhum';
  let condimentos = [];
  if (currentProduct.montavel) {
    if (mode === 'completo') {
      condimentos = [...CONDIMENTOS];
    } else {
      condimentos = [...document.querySelectorAll('#condimentosList input:checked')].map(input => input.value);
      if (!condimentos.length) {
        alert('Escolha pelo menos um molho ou condimento, ou selecione “Completo”.');
        return;
      }
    }
  }

  const adicionais = [...document.querySelectorAll('input[name="adicional"]:checked')].map(input => ({
    nome: input.value,
    preco: Number(input.dataset.price || 0)
  }));
  const additionalTotal = adicionais.reduce((sum, item) => sum + item.preco, 0);

  CART.push({
    id: Date.now() + Math.random(),
    productId: currentProduct.id,
    nome: currentProduct.nome,
    precoBase: Number(currentProduct.preco),
    adicionais,
    condimentosMode: mode,
    condimentos,
    observacao: document.getElementById('itemObservacao').value.trim(),
    comboDrink: document.getElementById('comboDrinkGroup')?.hidden ? '' : (document.getElementById('comboDrink')?.value || ''),
    quantidade: 1,
    unitario: Number(currentProduct.preco) + additionalTotal
  });

  closeModal(productModal);
  renderCart();
  document.getElementById('pedido')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// ── Carrinho ─────────────────────────────────────────────────
function cartTotal() {
  return CART.reduce((sum, item) => sum + item.unitario * item.quantidade, 0);
}

function renderCart() {
  const list = document.getElementById('cart-items');
  const empty = document.getElementById('cart-empty');
  const total = document.getElementById('cart-total');
  const finish = document.getElementById('btn-finalizar');
  if (!list) return;

  if (!CART.length) {
    list.innerHTML = '';
    empty.hidden = false;
    total.textContent = money(0);
    finish.disabled = true;
    return;
  }

  empty.hidden = true;
  finish.disabled = false;
  list.innerHTML = CART.map((item, index) => `
    <article class="cart-item">
      <div class="cart-item-main">
        <strong>${item.quantidade}x ${item.nome}</strong>
        <span>${money(item.unitario * item.quantidade)}</span>
        <small>${item.adicionais.length ? `Adicionais: ${item.adicionais.map(a => a.nome).join(', ')}` : 'Sem adicionais'}</small>
        <small>${item.condimentosMode === 'completo' ? 'Condimentos: Completo' : `Condimentos: ${item.condimentos.join(', ')}`}</small>
        ${item.comboDrink ? `<small>Refri: ${item.comboDrink}</small>` : ''}
        ${item.observacao ? `<small>Obs.: ${item.observacao}</small>` : ''}
      </div>
      <div class="cart-actions">
        <button type="button" data-cart-action="minus" data-index="${index}">−</button>
        <button type="button" data-cart-action="plus" data-index="${index}">+</button>
        <button type="button" class="remove-cart" data-cart-action="remove" data-index="${index}">Remover</button>
      </div>
    </article>
  `).join('');

  total.textContent = money(cartTotal());
}

document.getElementById('cart-items')?.addEventListener('click', e => {
  const button = e.target.closest('[data-cart-action]');
  if (!button) return;
  const index = Number(button.dataset.index);
  const action = button.dataset.cartAction;
  if (!CART[index]) return;
  if (action === 'plus') CART[index].quantidade += 1;
  if (action === 'minus') CART[index].quantidade -= 1;
  if (action === 'remove' || CART[index].quantidade <= 0) CART.splice(index, 1);
  renderCart();
});

// ── Checkout / WhatsApp ──────────────────────────────────────
document.getElementById('btn-finalizar')?.addEventListener('click', () => {
  if (!CART.length) return;
  const summary = document.getElementById('checkoutSummary');
  summary.innerHTML = `
    ${CART.map(item => `
      <div class="checkout-line">
        <span><strong>${item.quantidade}x ${item.nome}</strong><small>${item.adicionais.length ? `+ ${item.adicionais.map(a => a.nome).join(', ')}` : ''}${item.condimentosMode === 'completo' ? ' · Completo' : ` · ${item.condimentos.join(', ')}`}</small></span>
        <strong>${money(item.unitario * item.quantidade)}</strong>
      </div>
    `).join('')}
    <div class="checkout-total"><span>Total</span><strong>${money(cartTotal())}</strong></div>
  `;
  openModal(checkoutModal);
});

function buildWhatsAppMessage() {
  const name = document.getElementById('customerName').value.trim();
  const phone = document.getElementById('customerPhone').value.trim();
  const locationSelect = document.getElementById('orderLocation');
  const location = locationSelect.options[locationSelect.selectedIndex]?.text || '';
  const generalObservation = document.getElementById('orderObservation').value.trim();
  const config = window.DOGAO_CONFIG || {};

  const lines = [
    '🌭 *NOVO PEDIDO — DOGÃO & DOGUINHO*',
    '',
    `👤 Cliente: ${name}`,
    phone ? `📞 Telefone: ${phone}` : null,
    `📍 Local: ${location}`,
    '',
    '*Itens:*',
  ];

  CART.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.quantidade}x ${item.nome} — ${money(item.unitario * item.quantidade)}`);
    if (item.adicionais.length) lines.push(`   • Adicionais: ${item.adicionais.map(a => `${a.nome} (+${money(a.preco)})`).join(', ')}`);
    lines.push(`   • Molhos/condimentos: ${item.condimentosMode === 'completo' ? 'COMPLETO' : item.condimentos.join(', ')}`);
    if (item.comboDrink) lines.push(`   • Refrigerante: ${item.comboDrink}`);
    if (item.observacao) lines.push(`   • Observação: ${item.observacao}`);
  });

  lines.push('', `💰 *TOTAL: ${money(cartTotal())}*`, `💠 *PIX: ${config.pixKey || ''}`);
  if (config.pixHolder) lines.push(`👤 Favorecido: ${config.pixHolder}`);
  lines.push('', '⚠️ *IMPORTANTE:* o pedido só deve ser preparado após o envio do comprovante de pagamento nesta conversa.', '📎 Vou enviar o comprovante do PIX por aqui.');
  if (generalObservation) lines.push(`📝 Observação geral: ${generalObservation}`);
  return lines.filter(line => line !== null).join('\n');
}

document.getElementById('checkoutForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const config = window.DOGAO_CONFIG || {};
  const message = buildWhatsAppMessage();
  const url = `https://wa.me/${config.whatsappOwner}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
});

// ── Flash ────────────────────────────────────────────────────
document.querySelectorAll('.flash').forEach(el => {
  setTimeout(() => {
    el.style.transition = 'opacity 0.5s';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 500);
  }, 4000);
});

renderCart();
