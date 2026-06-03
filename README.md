# 🌭 Dogão & Doguinho — Página Web

Projeto web para exibição de cardápio e gestão de produtos de uma barraca de dogão.

## Estrutura

```
dogao/
├── app.py                  # Aplicação Flask principal
├── cardapio.json           # Cardápio (gerado automaticamente ao editar)
├── requirements.txt
├── static/
│   ├── css/style.css       # Estilos
│   └── js/main.js          # Scripts
└── templates/
    ├── base.html           # Layout base (header, footer, status)
    ├── index.html          # Página pública com cardápio
    ├── login.html          # Login do dono
    └── painel.html         # Painel administrativo
```

## Como rodar

```bash
# 1. Instalar dependências
pip install -r requirements.txt

# 2. Rodar o servidor
python app.py

# 3. Acessar no navegador
http://localhost:5000
```

## Credenciais padrão (mude em produção!)

| Campo   | Valor     |
|---------|-----------|
| Usuário | `dono`    |
| Senha   | `dogao123`|

> ⚠️ **Atenção:** Para produção, use variáveis de ambiente para as credenciais
> e substitua o armazenamento em JSON por um banco de dados (SQLite/PostgreSQL).

## Funcionalidades

- ✅ Cardápio público com abas (Tradicionais, Gourmet, Bebidas)
- ✅ Status automático de aberto/fechado por horário
- ✅ Mapa de localização no rodapé
- ✅ Painel administrativo protegido por login
- ✅ Adicionar, editar e remover itens do cardápio
- ✅ Design responsivo para celular

## Próximos passos sugeridos

- [ ] Migrar cardápio para banco de dados (SQLite com Flask-SQLAlchemy)
- [ ] Adicionar upload de fotos dos produtos
- [ ] Integrar pedidos via WhatsApp
- [ ] Deploy no PythonAnywhere ou Railway (gratuitos)
