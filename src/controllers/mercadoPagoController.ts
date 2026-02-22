import { Request, Response } from 'express';
import { Preference } from 'mercadopago';
import client from '../config/mercadoPagoClient';
import axios from 'axios';
import { obtenerPagoPorId, validarFirmaWebhook } from '../services/mercadoPagoService';

/**
 * Inicia el proceso de pago creando una preferencia en Mercado Pago.
 * Recibe los datos del producto, genera el checkout y devuelve la URL 
 * para que el usuario pueda pagar.
 */

export const CrearPreferencia = async (req: Request, res: Response) => {
  const { title, unit_price, id } = req.body;

  if (!title || !unit_price) {
    return res.status(400).json({ error: 'title y unit_price son obligatorios!' });
  }

  const preference = new Preference(client);

  try {
    const data = await preference.create({
      body: {
        items: [
          {
            id: id || undefined, 
            title,
            quantity: 1,
            unit_price,
          }
        ],
        notification_url: "https://expensively-eaved-rufina.ngrok-free.dev/api/webhook",
      }
    });

    res.status(200).json({
      preferenceId: data.id,
      preferenceUrl: data.init_point,
    });

  } catch (error) {
    console.error("Error al crear la preferencia:", error);
    res.status(500).send("Error al crear la preferencia de pago");
  }
};


/**
 * Recibe la notificación de Mercado Pago cuando cambia el estado de un pago.
 * Valida el ID recibido contra la API oficial de MP y actualiza la base de datos.
 * Este endpoint es llamado por Mercado Pago, debe de ser configurado en el panel de MP como URL de Webhook.
 */
export const WebhookMercadoPago = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-signature'] as string;
    const requestId = req.headers['x-request-id'] as string;
    const dataIdUrl = req.query['data.id'] as string;
    const paymentId = req.body.data?.id;

    console.log(`Notificación Webhook: ${req.body.type || req.body.topic || 'unknown'}`);
  
    
    if (!paymentId || !dataIdUrl) {
      return res.status(200).send('OK');
    }

    // Validación de seguridad obligatoria
    const esValido = validarFirmaWebhook(signature, requestId, dataIdUrl);
    
    if (!esValido) {
      console.warn(`🚨 Firma inválida para el pago: ${paymentId}`);
      
      // En producción bloqueamos que continue, en desarrollo solo enviamos un aviso
      if (process.env.NODE_ENV === 'production') {
        return res.status(401).send('Invalid signature');
      }
    }

    // Validación - Consultamos a la API de mercado pago sobre el pago recibido.
    const pago = await obtenerPagoPorId(paymentId);

    if (pago.status === 'approved') {
      console.log('✅ Pago aprobado:', paymentId);
    }

    res.status(200).send('OK');

  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return res.status(404).send('Payment not found');
    }
    
    console.error('❌ Webhook Error:', error);
    res.status(500).send('Internal Server Error');
  }
};