<p align="center">
  <img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB" />
</p>

# Mercado Pago SDK (Node.js + TypeScript)

Este repositorio contiene una implementación para gestionar pagos con Mercado Pago SDK (Checkout Pro).

## Seguridad

Se utiliza un esquema de validación doble para asegurar que las notificaciones recibidas son legítimas:

1. **Validación de Firma**: Se procesa el header `x-signature` mediante HMAC-SHA256, reconstruyendo el manifiesto (`id`, `request-id` y `ts`) según la documentación oficial.
2. **Verificación via API**: Se realiza una consulta directa a `/v1/payments/` para confirmar el estado del pago antes de ejecutar cualquier lógica de negocio.
3. **Entornos**: La validación de firma es estricta en `production`, pero permite el flujo en `development` para facilitar las pruebas en entornos locales.


Variables necesarias en el archivo `.env`:

```env
PORT=5000
NODE_ENV=development

# Credenciales de Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN=tu_token_aqui
MP_WEBHOOK_SECRET=tu_secreto_aqui
```
Nota: El MP_WEBHOOK_SECRET se encuentra en el panel de Webhooks de Mercado Pago, asociado a la URL de notificación configurada.


## Instalación
```
npm install
```
# Ejecutar en desarrollo
```
npm run dev
```

# Endpoints
`POST /api/crear_preferencia`: Crea la preferencia y devuelve la URL de checkout.

`POST /api/webhook`: Recibe, valida y procesa notificaciones de MP.


# Estructura
`src/controllers/`: Manejo de peticiones y respuestas.

`src/services/`: Lógica de criptografía (HMAC) y llamadas a la API de Mercado Pago.

`src/routes/`: Definición de endpoints.

##
Puedes usar este backend para integrarlo con cualquier frontend conectándolo mediante la SDK de Mercado Pago. 