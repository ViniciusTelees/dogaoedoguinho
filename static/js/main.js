// ── Lógica das abas ───────────────────────────────────────────
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const targetId = tab.dataset.tab;
    const container = tab.closest('.cardapio-section, .painel-section');
    container.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    container.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    const panel = container.querySelector(`#tab-${targetId}`);
    if (panel) panel.classList.add('active');
  });
});

// ── Widget flutuante de status ────────────────────────────────
const widget = document.getElementById('statusWidget');
const toggle = document.getElementById('statusToggle');

if (widget && toggle) {
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    widget.classList.toggle('open');
  });

  // Fecha ao clicar fora
  document.addEventListener('click', (e) => {
    if (!widget.contains(e.target)) {
      widget.classList.remove('open');
    }
  });
}

// ── Flash: some após 4 segundos ───────────────────────────────
document.querySelectorAll('.flash').forEach(el => {
  setTimeout(() => {
    el.style.transition = 'opacity 0.5s';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 500);
  }, 4000);
});
