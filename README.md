# Sistema de Avatar por IA — Totem de Credenciamento

Sistema completo: o visitante escaneia o badge, escolhe um estilo, tira uma
foto, recebe um avatar gerado por IA e imprime na hora. Integrado ao seu
sistema de credenciamento existente.

```
avatar-totem-system/
├── backend/     → API Node/Express: geração de IA, impressão, integração
└── frontend/    → Tela do totem (React), para tablet/monitor touch
```

## 1. Como rodar localmente (teste, antes do evento)

### Backend
```bash
cd backend
npm install
cp .env.example .env
# edite o .env e preencha FAL_API_KEY (veja passo 2 abaixo)
npm run dev
```
Sobe em `http://localhost:3001`.

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
Sobe em `http://localhost:5173` — abra essa URL no navegador do totem em
tela cheia (F11).

## 2. Configurar a geração de IA (fal.ai)

1. Crie conta em https://fal.ai (tem créditos grátis para testar)
2. Gere uma API key em `fal.ai/dashboard/keys`
3. Cole em `backend/.env` → `FAL_API_KEY`
4. Confira o slug do modelo atual (InstantID ou PhotoMaker) em
   `fal.ai/models` e ajuste `FAL_MODEL_ENDPOINT` se necessário —
   endpoints de modelo podem mudar de nome com o tempo
5. Teste isoladamente antes do evento: rode o backend e chame

```bash
curl -X POST http://localhost:3001/api/generate \
  -F "photo=@/caminho/para/uma/foto.jpg" \
  -F "styleId=cyberpunk"
```

Se voltar um JSON com `imageUrl`, a geração está funcionando.

## 3. Configurar a impressora

- Instale o driver oficial da sua impressora fotográfica (DNP, Mitsubishi,
  etc.) no computador que vai rodar o totem, e configure-a como impressora
  padrão do sistema operacional
- No Linux/macOS, teste com `lp caminho/para/imagem.jpg` no terminal — se
  imprimir, o backend também vai imprimir (usa o mesmo comando)
- `backend/.env` → `PRINT_MODE=cups` (padrão) usa esse caminho.
  Use `PRINT_MODE=none` para testar o fluxo sem imprimir de verdade
- Se sua impressora só tiver SDK próprio do fabricante, troque a lógica em
  `backend/src/services/printerService.js` — é o único arquivo que muda

## 4. Integrar com seu sistema de credenciamento

O único arquivo que você precisa adaptar é
`backend/src/services/credenciamentoService.js`. Ele hoje assume uma API
REST genérica com:
- `GET /visitantes/codigo/:codigo` → retorna `{ id, nome, email }`
- `PATCH /visitantes/:id/avatar` → grava o avatar no perfil do visitante

Ajuste as URLs e o formato dos campos para bater com a API real do seu
sistema. Preencha `CREDENCIAMENTO_API_URL` e `CREDENCIAMENTO_API_KEY` no
`.env` do backend.

**Se seu sistema ainda não tem API própria**: o totem funciona sozinho
(modo standalone) e registra tudo localmente em
`backend/data/sessions.json`. No fim do evento, exporte tudo com:
```bash
curl http://localhost:3001/api/checkin/export/all
```

## 5. Checklist para o dia do evento

- [ ] Testar a geração de ponta a ponta com internet do local do evento
      (é o maior risco de latência — tenha 4G/5G de backup)
- [ ] Testar impressão física pelo menos 10x seguidas (fila de impressora)
- [ ] Deixar o totem em modo tela cheia / kiosk mode no navegador
- [ ] Confirmar o texto de consentimento de uso de imagem/IA na tela
      (adicione na `WelcomeScreen.jsx` — recomendado por LGPD)
- [ ] Ter um PC/laptop reserva com o projeto já configurado

## 6. Estrutura do fluxo do totem

`Boas-vindas → Código do badge → Escolher estilo → Câmera → Gerando (IA) → Resultado + Imprimir`

Cada tela é um componente isolado em `frontend/src/screens/` — fácil de
reordenar, remover a etapa de código do badge, ou adicionar uma etapa de
"enviar por e-mail/WhatsApp" depois.
