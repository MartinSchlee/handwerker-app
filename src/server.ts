import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { kalkuliereKV } from './calculator';
import { generiereKVPdf } from './pdfGenerator';
import path from 'path';

const app = express();
const prisma = new PrismaClient();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// API-Route: Kostenvoranschlag empfangen, berechnen, speichern und PDF erstellen
app.post('/api/kv', async (req, res) => {
  try {
    const { firma, ansprechpartner, email, steuerSatzProzent, positionen } = req.body;

    // 1. Kunde in der Datenbank anlegen oder finden
    const kunde = await prisma.kunde.upsert({
      where: { email },
      update: { firma, ansprechpartner },
      create: { firma, ansprechpartner, email },
    });

    // 2. Eine eindeutige KV-Nummer generieren
    const kvNummer = `KV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 3. Kostenvoranschlag in der DB speichern
    const neuerKV = await prisma.kostenvoranschlag.create({
      data: {
        kvNummer,
        steuerSatzProzent: parseFloat(steuerSatzProzent) || 19.0,
        kundeId: kunde.id,
        positionen: {
          create: positionen.map((pos: any) => ({
            typ: pos.typ,
            bezeichnung: pos.bezeichnung,
            menge: parseFloat(pos.menge),
            einheit: pos.einheit,
            einzelpreisNetto: parseFloat(pos.einzelpreisNetto),
          })),
        },
      },
      include: {
        kunde: true,
        positionen: true,
      },
    });

    // 4. Kalkulation für das PDF ausführen (Typ auf 'any' gesetzt, um TS-Konflikte zu lösen)
    const kvFuerKalkulation: any = {
      ...neuerKV,
      id: neuerKV.kvNummer,
      kunde: { 
        ...neuerKV.kunde, 
        firma: neuerKV.kunde.firma ?? undefined 
      }
    };
    
    const berechnungsErgebnis = kalkuliereKV(kvFuerKalkulation);

    // 5. PDF generieren
    const dateiName = `${kvNummer}.pdf`;
    const dateiPfad = path.join(__dirname, '..', dateiName);
    generiereKVPdf(kvFuerKalkulation, berechnungsErgebnis, dateiPfad);

    // Erfolg zurückmelden
    res.json({
      success: true,
      message: 'Kostenvoranschlag gespeichert und PDF erstellt!',
      kvNummer,
      dateiName
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend-Server läuft auf http://localhost:${PORT}`);
});