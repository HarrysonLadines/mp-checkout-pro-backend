import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mercadoPagoRoutes from "../src/routes/mercadoPagoRoutes.ts";

dotenv.config({ quiet: true });

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", mercadoPagoRoutes);

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

export default app;
