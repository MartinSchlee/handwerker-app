import { PrismaClient } from '@prisma/client';
import { kalkuliereKV } from './calculator';
import { generiereKVPdf } from './pdfGenerator';
import { Kostenvoranschlag as KVPdfTyp } from './types';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starte Datenbank-Testlauf...\n');

  // 1. Einen neuen Handwerker-Kunden in der PostgreSQL DB anlegen
  const neuerKunde = await prisma.kunde.upsert({
    where: { email: 'mario.schmidt@elektro-schmidt.de' },
    update: {},
    create: {
      firma: 'Elektro Schmidt GmbH',
      ansprechpartner: 'Mario Schmidt',
      email: 'mario.schmidt@elektro-schmidt.de',
    },
  });

  console.log(`👤 Kunde in DB gelistet: ${neuerKunde.firma} (ID: ${neuerKunde.id})`);

  // 2. Einen neuen Kostenvoranschlag für diesen Kunden in der DB speichern
  const kvNummerMuster = `KV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  
  const gespeicherterKV = await prisma.kostenvoranschlag.create({
    data: {
      kvNummer: kvNummerMuster,
      status: 'ENTWURF',
      steuerSatzProzent: 19.0,
      kundeId: neuerKunde.id,
      positionen: {
        create: [
          {
            typ: 'ARBEITSZEIT',
            bezeichnung: 'Sicherungskasten verdrahten (Meisterstunden)',
            menge: 5,
            einheit: 'Std',
            einzelpreisNetto: 72.00,
          },
          {
            typ: 'MATERIAL',
            bezeichnung: 'FI-Schutzschalter 40A Typ A',
            menge: 2,
            einheit: 'Stk',
            einzelpreisNetto: 45.90,
          },
        ],
      },
    },
    include: {
      kunde: true,
      positionen: true,
    },
  });

  console.log(`📄 KV erfolgreich in DB gespeichert! Nummer: ${gespeicherterKV.kvNummer}`);

  // 3. Daten für den PDF-Drucker vorbereiten
  const pdfDaten: KVPdfTyp = {
    id: gespeicherterKV.kvNummer,
    status: gespeicherterKV.status as any,
    steuerSatzProzent: gespeicherterKV.steuerSatzProzent,
    kunde: {
      id: gespeicherterKV.kunde.id,
      firma: gespeicherterKV.kunde.firma || undefined,
      ansprechpartner: gespeicherterKV.kunde.ansprechpartner,
      email: gespeicherterKV.kunde.email,
    },
    positionen: gespeicherterKV.positionen.map((pos, index) => ({
      id: index + 1,
      typ: pos.typ as any,
      bezeichnung: pos.bezeichnung,
      menge: pos.menge,
      einheit: pos.einheit,
      einzelpreisNetto: pos.einzelpreisNetto,
    })),
  };

  // 4. Kalkulation & PDF-Generierung triggern
  const ergebnis = kalkuliereKV(pdfDaten);
  const ausgabePfad = `./${gespeicherterKV.kvNummer}.pdf`;
  
  generiereKVPdf(pdfDaten, ergebnis, ausgabePfad);
}

main()
  .catch((e) => {
    console.error('❌ Fehler beim DB-Testlauf:', e);
  })