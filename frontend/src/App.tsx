import { useState } from 'react';

interface Position {
  typ: 'MATERIAL' | 'ARBEITSZEIT';
  bezeichnung: string;
  menge: number;
  einheit: string;
  einzelpreisNetto: number;
}

export default function App() {
  const [firma, setFirma] = useState('');
  const [ansprechpartner, setAnsprechpartner] = useState('');
  const [email, setEmail] = useState('');
  const [steuerSatzProzent, setSteuerSatzProzent] = useState(19);
  const [positionen, setPositionen] = useState<Position[]>([
    { typ: 'MATERIAL', bezeichnung: '', menge: 1, einheit: 'Stk', einzelpreisNetto: 0 }
  ]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const positionHinzufuegen = () => {
    setPositionen([...positionen, { typ: 'MATERIAL', bezeichnung: '', menge: 1, einheit: 'Stk', einzelpreisNetto: 0 }]);
  };

  const positionEntfernen = (index: number) => {
    setPositionen(positionen.filter((_, i) => i !== index));
  };

  const posAendern = (index: number, feld: keyof Position, wert: any) => {
    const neuePos = [...positionen];
    neuePos[index] = { ...neuePos[index], [feld]: wert };
    setPositionen(neuePos);
  };

  const senden = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage('');

    try {
      const response = await fetch('http://localhost:3001/api/kv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firma, ansprechpartner, email, steuerSatzProzent, positionen })
      });

      const data = await response.json();
      if (data.success) {
        setStatusMessage(`✅ Erfolg! PDF erstellt: ${data.dateiName}`);
      } else {
        setStatusMessage(`❌ Fehler: ${data.error}`);
      }
    } catch (error) {
      setStatusMessage('❌ Server nicht erreichbar. Hast du das Backend gestartet?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">
        <h1 className="text-3xl font-bold mb-6 text-amber-500 border-b border-gray-700 pb-4">🔨 Handwerker App – KV erstellen</h1>
        
        <form onSubmit={senden} className="space-y-6">
          {/* KUNDENDATEN */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-400">Firma (Optional)</label>
              <input type="text" className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white" value={firma} onChange={e => setFirma(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-400">Ansprechpartner *</label>
              <input type="text" required className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white" value={ansprechpartner} onChange={e => setAnsprechpartner(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-400">E-Mail *</label>
              <input type="email" required className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
          </div>

          <div className="w-32">
            <label className="block text-sm font-medium mb-1 text-gray-400">Steuersatz %</label>
            <input type="number" className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white" value={steuerSatzProzent} onChange={e => setSteuerSatzProzent(parseInt(e.target.value) || 0)} />
          </div>

          {/* POSITIONEN */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-300">Positionen</h2>
            {positionen.map((pos, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-2 bg-gray-700 p-3 rounded border border-gray-600 items-end">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Typ</label>
                  <select className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1.5 text-white" value={pos.typ} onChange={e => posAendern(index, 'typ', e.target.value)}>
                    <option value="MATERIAL">Material</option>
                    <option value="ARBEITSZEIT">Arbeitszeit</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-gray-400 mb-1">Bezeichnung</label>
                  <input type="text" required className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white" value={pos.bezeichnung} onChange={e => posAendern(index, 'bezeichnung', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Menge / Einheit</label>
                  <div className="flex gap-1">
                    <input type="number" step="any" required className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white" value={pos.menge} onChange={e => posAendern(index, 'menge', parseFloat(e.target.value) || 0)} />
                    <input type="text" required className="w-20 bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white" value={pos.einheit} onChange={e => posAendern(index, 'einheit', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Einzelpreis (€ Netto)</label>
                  <input type="number" step="any" required className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white" value={pos.einzelpreisNetto} onChange={e => posAendern(index, 'einzelpreisNetto', parseFloat(e.target.value) || 0)} />
                </div>
                <div>
                  {positionen.length > 1 && (
                    <button type="button" onClick={() => positionEntfernen(index)} className="w-full bg-red-600 hover:bg-red-700 text-white rounded py-1.5 px-2 text-sm transition">Löschen</button>
                  )}
                </div>
              </div>
            ))}
            <button type="button" onClick={positionHinzufuegen} className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded text-sm transition">+ Position hinzufügen</button>
          </div>

          {/* ABSENDEN */}
          <div className="pt-4 border-t border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button type="submit" disabled={loading} className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold px-6 py-3 rounded-lg transition disabled:opacity-50">
              {loading ? 'Generiere...' : '🚀 Kostenvoranschlag & PDF generieren'}
            </button>
            {statusMessage && <p className="text-sm font-medium">{statusMessage}</p>}
          </div>
        </form>
      </div>
    </div>
  );
}