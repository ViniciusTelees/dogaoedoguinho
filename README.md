# 🌭 Dogão & Doguinho — Cardápio + Pedidos via WhatsApp

Projeto Flask para o cardápio do Dogão & Doguinho, com montagem dos dogs, carrinho e envio do pedido para o WhatsApp do responsável.

## O que foi atualizado

- Cardápio reorganizado conforme a tabela enviada pelo cliente.
- Preços principais:
  - Doguinho — R$ 5,00
  - Doguinho Duplo — R$ 6,00
  - Dogão — R$ 10,00
  - Dogão Duplo — R$ 12,00
  - Dogão Duplo + Refri 200ml — R$ 13,00
- Adicionais por item, com valor padrão de R$ 3,00.
- Montagem do pedido antes de finalizar.
- Molhos/condimentos com duas opções:
  - Completo: todos os itens.
  - Específicos: cliente escolhe os itens desejados.
- Condimentos disponíveis: caldo, tempero, maionese artesanal, ketchup, mostarda, barbecue, cheddar, catupiry, queijo ralado e batata palha.
- Carrinho com quantidade, remoção e total.
- Tela de conferência antes do envio.
- Chave PIX exibida no checkout e incluída na mensagem.
- Pedido abre o WhatsApp do responsável com mensagem pronta.
- A mensagem informa que o preparo só deve acontecer após o envio do comprovante.
- Configurações de WhatsApp e PIX por variáveis de ambiente.
- Mantido painel administrativo para editar/adicionar/remover produtos.

## Importante sobre o WhatsApp

Por segurança e pelas limitações do link público do WhatsApp, o navegador **não consegue enviar uma mensagem automaticamente sem uma ação do usuário**. O sistema abre o WhatsApp com a mensagem já preenchida; o cliente precisa tocar/clicar em **Enviar** e depois anexar o comprovante do PIX.

Para envio 100% automático seria necessário integrar a **WhatsApp Business Platform/Cloud API** com credenciais próprias.

## Como rodar localmente

```bash
pip install -r requirements.txt
python app.py
```

Acesse `http://localhost:5000`.

## Configuração

Copie `.env.example` para `.env` se estiver usando um carregador de variáveis de ambiente, ou configure as variáveis diretamente no serviço de hospedagem:

- `WHATSAPP_OWNER`
- `PIX_KEY`
- `PIX_HOLDER`
- `SECRET_KEY`
- `OWNER_USER`
- `OWNER_PASS`
- `ADMIN_USER`
- `ADMIN_PASS`

Os valores padrão da chave PIX e do WhatsApp foram configurados com base nas informações presentes no material enviado para este projeto. Confira esses dados antes de publicar.
