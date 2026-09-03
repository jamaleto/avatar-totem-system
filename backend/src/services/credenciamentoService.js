import fetch from "node-fetch";
import { config } from "../config.js";

/**
 * Camada de integração com o SEU sistema de credenciamento.
 *
 * Este arquivo é o único ponto que você precisa adaptar para plugar
 * no sistema real — os nomes de rota/campos abaixo são um EXEMPLO
 * genérico (REST + API key). Ajuste as URLs e o mapeamento de campos
 * para bater com a API real do seu sistema.
 *
 * Se seu sistema não tiver API própria ainda, dá pra rodar em modo
 * standalone: o totem funciona sozinho e você exporta os dados depois
 * (ver rota GET /api/checkin/export no routes/checkin.js).
 */

function isConfigured() {
  return Boolean(config.credenciamento.baseUrl);
}

/**
 * Busca o visitante já credenciado a partir do código lido no totem
 * (normalmente um QR code ou código de badge impresso no credenciamento).
 */
export async function buscarVisitantePorCodigo(codigo) {
  if (!isConfigured()) {
    // Modo standalone: retorna um visitante "anônimo" para não travar o fluxo
    return { id: null, nome: null, email: null, codigo };
  }

  const res = await fetch(
    `${config.credenciamento.baseUrl}/visitantes/codigo/${encodeURIComponent(
      codigo
    )}`,
    {
      headers: { Authorization: `Bearer ${config.credenciamento.apiKey}` },
    }
  );

  if (!res.ok) {
    throw new Error(`Visitante não encontrado para o código ${codigo}`);
  }

  return res.json(); // esperado: { id, nome, email, ... }
}

/**
 * Associa o avatar gerado ao registro do visitante no sistema de
 * credenciamento (ex: salvar a URL/caminho da imagem no perfil dele).
 */
export async function associarAvatarAoVisitante({
  visitanteId,
  avatarFilename,
  estilo,
}) {
  if (!isConfigured() || !visitanteId) {
    // Modo standalone ou visitante anônimo: não há onde gravar, só loga.
    return { synced: false };
  }

  const res = await fetch(
    `${config.credenciamento.baseUrl}/visitantes/${visitanteId}/avatar`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${config.credenciamento.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ avatarFilename, estilo }),
    }
  );

  if (!res.ok) {
    throw new Error("Falha ao gravar avatar no sistema de credenciamento");
  }

  return { synced: true };
}
