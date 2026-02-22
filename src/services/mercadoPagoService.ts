import axios from 'axios';
import crypto from 'crypto';

// Consulta a la API de Mercado Pago para obtener los detalles de un pago por su ID,
// Verifica que el pago existe y devuelve los datos para que el controlador pueda procesar la lógica de negocio.

export const obtenerPagoPorId = async (paymentId: string) => {
  const url = `https://api.mercadopago.com/v1/payments/${paymentId}`;
  const headers = {
    Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`
  };

  const response = await axios.get(url, { headers });
  return response.data;
};

// Valida la firma del Webhook de Mercado Pago para asegurarse de que la notificación es legítima.
export const validarFirmaWebhook = (
  xSignature: string,
  xRequestId: string,
  dataIDFromQuery: string
): boolean => {
  try {
    const secret = process.env.MP_WEBHOOK_SECRET;
    if (!secret) return false;

    // Parseamos el header x-signature que viene en formato "ts=1234567890,v1=abcdef1234567890"
    const parts = xSignature.split(',');
    let tsRecibido = '';
    let hashRecibido = '';

    for (const part of parts) {
      const [key, value] = part.split('=');
      if (key.trim() === 'ts') tsRecibido = value;
      if (key.trim() === 'v1') hashRecibido = value;
    }

    if (!tsRecibido || !hashRecibido) return false;

    // Construcción del template según reglas de MP: 
    // "Si no está presente, removerlo" e "id siempre en minúsculas"
    let manifest = "";
    if (dataIDFromQuery) manifest += `id:${dataIDFromQuery.toLowerCase()};`;
    if (xRequestId)      manifest += `request-id:${xRequestId};`;
    if (tsRecibido)      manifest += `ts:${tsRecibido};`;

    // Generación de firma usando HMAC SHA256 con el secreto y el template construido
    const hashCalculado = crypto
      .createHmac('sha256', secret)
      .update(manifest)
      .digest('hex');

    return hashCalculado === hashRecibido;
  } catch (err) {
    console.error("Firma inválida - Error técnico:", err);
    return false;
  }
};