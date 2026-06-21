import PDFDocument from 'pdfkit';
import fs from 'fs';
import { Kostenvoranschlag, KalkulationsErgebnis } from './types';

export function generiereKVPdf(kv: Kostenvoranschlag, ergebnis: KalkulationsErgebnis, dateiPfad: string): void {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  // Stream in eine Datei leiten
  doc.pipe(fs.createWriteStream(dateiPfad));

  // --- HEADER / FIRMENDATEN ---
  doc.font('Helvetica-Bold').fontSize(20).text('IHR HANDWERKSBETRIEB GmbH', { align: 'right' });
  doc.font('Helvetica').fontSize(10).text('Musterstraße 1, 12345 Stadt | Tel: 0123-4567', { align: 'right' });
  doc.moveDown(2);

  // --- EMPFÄNGER (KUNDE) ---
  doc.fontSize(10).fillColor('#555555').text('Empfänger:');
  doc.fontSize(12).fillColor('#000000');
  if (kv.kunde.firma) doc.text(kv.kunde.firma);
  doc.text(`z.H. ${kv.kunde.ansprechpartner}`);
  doc.moveDown(2);

  // --- DOKUMENTENTITEL ---
  doc.font('Helvetica-Bold').fontSize(16).text(`Kostenvoranschlag Nr. ${kv.id}`);
  doc.font('Helvetica').fontSize(10).text(`Datum: ${new Date().toLocaleDateString('de-DE')}`);
  doc.moveDown(1.5);

  // --- TABELLEN-HEADER ---
  const tableTop = 280;
  doc.font('Helvetica-Bold').fontSize(10);
  doc.text('Pos', 50, tableTop);
  doc.text('Beschreibung', 90, tableTop);
  doc.text('Menge', 350, tableTop, { width: 50, align: 'right' });
  doc.text('E-Preis', 410, tableTop, { width: 60, align: 'right' });
  doc.text('Gesamt', 480, tableTop, { width: 60, align: 'right' });

  // Trennlinie zeichnen
  doc.moveTo(50, tableTop + 15).lineTo(540, tableTop + 15).stroke();

  // --- POSITIONEN REPRODUZIEREN ---
  let currentY = tableTop + 25;
  doc.font('Helvetica').fontSize(10);

  kv.positionen.forEach((pos, index) => {
    const gesamtPreis = pos.menge * pos.einzelpreisNetto;

    doc.text((index + 1).toString(), 50, currentY);
    doc.text(pos.bezeichnung, 90, currentY, { width: 250 });
    doc.text(`${pos.menge} ${pos.einheit}`, 350, currentY, { width: 50, align: 'right' });
    doc.text(`${pos.einzelpreisNetto.toFixed(2)} €`, 410, currentY, { width: 60, align: 'right' });
    doc.text(`${gesamtPreis.toFixed(2)} €`, 480, currentY, { width: 60, align: 'right' });

    currentY += 25;
  });

  // Trennlinie vor Summe
  doc.moveTo(350, currentY).lineTo(540, currentY).stroke();
  currentY += 10;

  // --- SUMMENBLOCK ---
  doc.text('Netto Summe:', 350, currentY, { width: 110, align: 'right' });
  doc.text(`${ergebnis.nettoSumme.toFixed(2)} €`, 480, currentY, { width: 60, align: 'right' });

  currentY += 15;
  doc.text(`zzgl. MwSt (${kv.steuerSatzProzent}%):`, 350, currentY, { width: 110, align: 'right' });
  doc.text(`${ergebnis.steuerSumme.toFixed(2)} €`, 480, currentY, { width: 60, align: 'right' });

  currentY += 20;
  doc.font('Helvetica-Bold').fontSize(12);
  doc.text('Gesamtsumme (Brutto):', 300, currentY, { width: 160, align: 'right' });
  doc.text(`${ergebnis.bruttoSumme.toFixed(2)} €`, 480, currentY, { width: 60, align: 'right' });

  doc.end();
}