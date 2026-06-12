from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from functools import wraps
import json
import os

app = Flask(__name__)
@app.context_processor
def inject_global_data():
    return {
        'lojas': LOJAS,
        'status': carregar_status()
    }
app.secret_key = os.environ.get('SECRET_KEY', 'change-me-in-railway')

# ─── Credenciais ───────────────────────────────────────────────────────────────
OWNER_USER = os.environ.get('OWNER_USER', 'dono')
OWNER_PASS = os.environ.get('OWNER_PASS', 'dogao123')

ADMIN_USER = os.environ.get('ADMIN_USER', 'admin')
ADMIN_PASS = os.environ.get('ADMIN_PASS', 'admin2024')

# ─── Arquivos de dados ────────────────────────────────────────────────────────
CARDAPIO_FILE = 'cardapio.json'
STATUS_FILE   = 'status_loja.json'

# ─── Lojas ────────────────────────────────────────────────────────────────────
LOJAS = {
    'lanchonete': {
        'nome':     'Lanchonete',
        'endereco': 'R. Mal. Deodoro, 308 — Pau da Lima, Salvador/BA',
        'maps_url': 'https://www.google.com/maps/place/R.+Mal.+Deodoro,+308+-+Pau+da+Lima,+Salvador+-+BA,+41235-030/@-12.9190383,-38.4455804,17z',
        'maps_embed': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.0!2d-38.4455804!3d-12.9190383!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x71610608a7e86e7%3A0xdfd8d4d02df638f9!2sR.+Mal.+Deodoro%2C+308!5e0!3m2!1spt-BR!2sbr!4v1',
    },
    'barraca': {
        'nome':     'Barraca',
        'endereco': 'R. Dr. Arthur Gonzales, 222 — Pau da Lima, Salvador/BA',
        'maps_url': 'https://www.google.com/maps/place/Rua+Dr.+Arthur+Gonzales,+222+-+Pau+da+Lima,+Salvador+-+BA,+41235-005/@-12.9229749,-38.4457519,17z',
        'maps_embed': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.0!2d-38.4457519!3d-12.9229749!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7161063d5b58629%3A0x3025dbaf628bcf14!2sRua+Dr.+Arthur+Gonzales%2C+222!5e0!3m2!1spt-BR!2sbr!4v1',
    },
}

CARDAPIO_DEFAULT = {
    "tradicionais": [
        {"id": 1, "nome": "Dogão Simples",   "descricao": "Pão, salsicha, mostarda e ketchup", "preco": 8.00},
        {"id": 2, "nome": "Dogão Completo",  "descricao": "Pão, salsicha, mostarda, ketchup, milho, ervilha e batata palha", "preco": 12.00},
        {"id": 3, "nome": "Dogão Bacon",     "descricao": "Pão, salsicha, bacon, cheddar e batata palha", "preco": 15.00},
        {"id": 4, "nome": "Doguinho",        "descricao": "Mini pão, mini salsicha, mostarda e ketchup", "preco": 5.00},
    ],
    "gourmet": [
        {"id": 5, "nome": "Dog Gourmet Clássico", "descricao": "Pão brioche, salsicha defumada, maionese artesanal e picles", "preco": 22.00},
        {"id": 6, "nome": "Dog Trufado",          "descricao": "Pão brioche, salsicha, creme de trufas, rúcula e parmesão", "preco": 28.00},
        {"id": 7, "nome": "Dog BBQ",              "descricao": "Pão brioche, salsicha, molho BBQ artesanal, cebola caramelizada e bacon crocante", "preco": 25.00},
        {"id": 8, "nome": "Dog Especial da Casa", "descricao": "Pão brioche, salsicha dupla, cream cheese, jalapeño e chips crocantes", "preco": 30.00},
    ],
    "bebidas": [
        {"id": 9,  "nome": "Refrigerante Lata", "descricao": "350ml gelado", "preco": 6.00},
        {"id": 10, "nome": "Água Mineral",      "descricao": "500ml", "preco": 3.00},
        {"id": 11, "nome": "Suco Natural",      "descricao": "Laranja, limão ou maracujá", "preco": 8.00},
    ]
}


# ─── Helpers ──────────────────────────────────────────────────────────────────

def carregar_cardapio():
    if os.path.exists(CARDAPIO_FILE):
        with open(CARDAPIO_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return CARDAPIO_DEFAULT


def salvar_cardapio(cardapio):
    with open(CARDAPIO_FILE, 'w', encoding='utf-8') as f:
        json.dump(cardapio, f, ensure_ascii=False, indent=2)


def carregar_status():
    if os.path.exists(STATUS_FILE):
        with open(STATUS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {'lanchonete': False, 'barraca': False}


def salvar_status(status):
    with open(STATUS_FILE, 'w', encoding='utf-8') as f:
        json.dump(status, f)


def owner_required(f):
    """Protege rotas do dono (painel de status)."""
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get('logged_in'):
            flash('Acesso restrito. Faça login como dono primeiro.', 'error')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated


def admin_required(f):
    """Protege rotas do admin (edição de cardápio)."""
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get('admin_logged_in'):
            flash('Acesso restrito. Faça login como administrador primeiro.', 'error')
            return redirect(url_for('admin_login'))
        return f(*args, **kwargs)
    return decorated


# ─── Rotas públicas ────────────────────────────────────────────────────────────

@app.route('/')
def index():
    cardapio = carregar_cardapio()
    status   = carregar_status()
    return render_template('index.html', cardapio=cardapio, status=status, lojas=LOJAS)


@app.route('/status')
def status_json():
    return jsonify(carregar_status())


# ─── Autenticação — Dono ──────────────────────────────────────────────────────

@app.route('/login', methods=['GET', 'POST'])
def login():
    if session.get('logged_in'):
        return redirect(url_for('painel'))
    if request.method == 'POST':
        if request.form.get('usuario') == OWNER_USER and request.form.get('senha') == OWNER_PASS:
            session['logged_in'] = True
            flash('Bem-vindo, chefe! 🌭', 'success')
            return redirect(url_for('painel'))
        flash('Usuário ou senha incorretos.', 'error')
    return render_template('login.html', lojas=LOJAS, status=carregar_status())


@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    flash('Você saiu da Área do Dono.', 'info')
    return redirect(url_for('index'))


# ─── Autenticação — Admin ─────────────────────────────────────────────────────

@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    if session.get('admin_logged_in'):
        return redirect(url_for('admin'))
    if request.method == 'POST':
        if request.form.get('usuario') == ADMIN_USER and request.form.get('senha') == ADMIN_PASS:
            session['admin_logged_in'] = True
            flash('Bem-vindo, administrador! ⚙️', 'success')
            return redirect(url_for('admin'))
        flash('Usuário ou senha incorretos.', 'error')
    return render_template('admin_login.html', lojas=LOJAS, status=carregar_status())


@app.route('/admin/logout')
def admin_logout():
    session.pop('admin_logged_in', None)
    flash('Você saiu do Painel Admin.', 'info')
    return redirect(url_for('index'))


# ─── Painel do dono ────────────────────────────────────────────────────────────

@app.route('/painel')
@owner_required
def painel():
    return render_template('painel.html',
                           status=carregar_status(),
                           lojas=LOJAS)


@app.route('/painel/status/<loja>', methods=['POST'])
@owner_required
def alterar_status(loja):
    if loja not in LOJAS:
        flash('Loja inválida.', 'error')
        return redirect(url_for('painel'))
    status = carregar_status()
    acao   = request.form.get('acao')
    nome   = LOJAS[loja]['nome']
    if acao == 'abrir':
        status[loja] = True
        flash(f'✅ {nome} marcada como ABERTA!', 'success')
    elif acao == 'fechar':
        status[loja] = False
        flash(f'🔴 {nome} marcada como FECHADA.', 'success')
    salvar_status(status)
    return redirect(url_for('painel'))


# ─── Painel Admin ─────────────────────────────────────────────────────────────

@app.route('/admin')
@admin_required
def admin():
    return render_template('admin.html',
                           cardapio=carregar_cardapio(),
                           status=carregar_status(),
                           lojas=LOJAS)


@app.route('/painel/editar/<categoria>/<int:item_id>', methods=['POST'])
@admin_required
def editar_item(categoria, item_id):
    cardapio = carregar_cardapio()
    if categoria in cardapio:
        for item in cardapio[categoria]:
            if item['id'] == item_id:
                item['nome']      = request.form.get('nome', item['nome'])
                item['descricao'] = request.form.get('descricao', item['descricao'])
                item['preco']     = float(request.form.get('preco', item['preco']))
                break
    salvar_cardapio(cardapio)
    flash('Item atualizado com sucesso!', 'success')
    return redirect(url_for('admin'))


@app.route('/painel/adicionar/<categoria>', methods=['POST'])
@admin_required
def adicionar_item(categoria):
    cardapio = carregar_cardapio()
    if categoria in cardapio:
        todos_ids = [i['id'] for cat in cardapio.values() for i in cat]
        novo_id   = max(todos_ids) + 1 if todos_ids else 1
        cardapio[categoria].append({
            'id':        novo_id,
            'nome':      request.form.get('nome', 'Novo Item'),
            'descricao': request.form.get('descricao', ''),
            'preco':     float(request.form.get('preco', 0.0))
        })
        salvar_cardapio(cardapio)
        flash('Item adicionado com sucesso!', 'success')
    return redirect(url_for('admin'))


@app.route('/painel/remover/<categoria>/<int:item_id>', methods=['POST'])
@admin_required
def remover_item(categoria, item_id):
    cardapio = carregar_cardapio()
    if categoria in cardapio:
        cardapio[categoria] = [i for i in cardapio[categoria] if i['id'] != item_id]
        salvar_cardapio(cardapio)
        flash('Item removido.', 'success')
    return redirect(url_for('admin'))


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
