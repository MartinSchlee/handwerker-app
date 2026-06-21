import { Kostenvoranschlag, KalkulationsErgebnis } from './types';

// Hilfsfunktion zum kaufmännischen Runden auf 2 Nachkommastellen
function rundeAufZweiStellen(betrag: number): number {
  return Math.round((betrag + Number.EPSILON) * 100) / 100;
}

export function kalkuliereKV(kv: Kostenvoranschlag): KalkulationsErgebnis {
  // 1. Einzelne Positionen berechnen und für das Interface mappen
  const positionenBrutto = kv.positionen.map((pos, index) => {
    const netto = pos.menge * pos.einzelpreisNetto;
    const steuer = (netto * kv.steuerSatzProzent) / 100;
    return {
      id: index + 1,
      brutto: rundeAufZweiStellen(netto + steuer)
    };
  });

  // 2. Netto-Summe aller Positionen berechnen
  const nettoSumme = kv.positionen.reduce((summe, pos) => {
    return summe + (pos.menge * pos.einzelpreisNetto);
  }, 0);

  // 3. Steuer berechnen
  const steuerBetrag = (nettoSumme * kv.steuerSatzProzent) / 100;

  // 4. Runden, um JS-Fließkommafehler zu vermeiden
  const gerundeteNettoSumme = rundeAufZweiStellen(nettoSumme);
  const gerundeterSteuerBetrag = rundeAufZweiStellen(steuerBetrag);
  const bruttoSumme = rundeAufZweiStellen(gerundeteNettoSumme + gerundeterSteuerBetrag);

  return {
    positionenBrutto, // Bindeglied zum Interface in types.ts
    nettoSumme: gerundeteNettoSumme,
    steuerSumme: gerundeterSteuerBetrag,
    bruttoSumme: bruttoSumme
  };
}