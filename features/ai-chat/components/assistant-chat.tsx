'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { AssistantMessage, ChatAssistantOutput, Locale } from '@/types/marketplace-ai';
import { formatPrice } from '@/lib/utils';

type Props = {
  locale: Locale;
  country: string;
  city: string;
};

export function AssistantChat({ locale, country, city }: Props) {
  const [history, setHistory] = useState<AssistantMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastReply, setLastReply] = useState<ChatAssistantOutput | null>(null);

  const onSend = async () => {
    if (!input.trim()) return;
    const userMessage: AssistantMessage = { role: 'user', content: input.trim() };
    const nextHistory = [...history, userMessage];

    setHistory(nextHistory);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          locale,
          country,
          city,
          history: nextHistory
        })
      });
      if (!res.ok) throw new Error('chat_error');

      const payload = (await res.json()) as ChatAssistantOutput;
      setLastReply(payload);
      setHistory((current) => [...current, { role: 'assistant', content: payload.answer }]);
    } catch {
      const fallback = locale === 'fr' ? 'Assistant indisponible pour le moment.' : 'Assistant temporarily unavailable.';
      setError(fallback);
      setHistory((current) => [...current, { role: 'assistant', content: fallback }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section py-10">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-bold">{locale === 'fr' ? 'Assistant client Min-shop' : 'Min-shop customer assistant'}</h1>
          <p className="mt-1 text-sm text-slate-600">
            {locale === 'fr'
              ? 'Pose une question produit, livraison, paiement ou comparaison.'
              : 'Ask about products, delivery, payments, or comparisons.'}
          </p>

          <div className="mt-4 h-[380px] overflow-y-auto rounded-xl border bg-slate-50 p-3">
            {history.length === 0 ? (
              <p className="text-sm text-slate-500">
                {locale === 'fr'
                  ? 'Exemple: Je cherche un produit a moins de 80 000 FCFA pour un etudiant.'
                  : 'Example: I need a product under 80,000 FCFA for a student.'}
              </p>
            ) : (
              <div className="space-y-2">
                {history.map((message, index) => (
                  <div key={`${message.role}-${index}`} className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${message.role === 'user' ? 'ml-auto bg-dark text-white' : 'bg-white text-slate-800 border'}`}>
                    {message.content}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-3 flex gap-2">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  void onSend();
                }
              }}
              placeholder={locale === 'fr' ? 'Ecris ta question...' : 'Write your question...'}
              className="flex-1 rounded-xl border px-3 py-2"
            />
            <button onClick={() => void onSend()} disabled={loading} className="rounded-xl bg-brand-600 px-4 py-2 font-semibold text-white disabled:opacity-60">
              {loading ? (locale === 'fr' ? 'Envoi...' : 'Sending...') : locale === 'fr' ? 'Envoyer' : 'Send'}
            </button>
          </div>
          {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        </div>

        <aside className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">{locale === 'fr' ? 'Suggestions IA' : 'AI suggestions'}</h2>
          <div className="mt-3 space-y-3">
            {(lastReply?.suggestions ?? []).map((product) => (
              <Link key={product.id} href={`/product/${product.slug}`} className="block rounded-xl border p-3 hover:bg-slate-50">
                <p className="text-sm font-semibold">{product.name}</p>
                <p className="text-xs text-slate-500">{product.city}, {product.country}</p>
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className="font-semibold text-brand-700">{formatPrice(product.price, country)}</span>
                  <span className="text-amber-600">{product.averageRating.toFixed(1)}/5</span>
                </div>
              </Link>
            ))}
            {(lastReply?.suggestions ?? []).length === 0 ? (
              <p className="text-sm text-slate-500">{locale === 'fr' ? 'Aucune suggestion pour le moment.' : 'No suggestions yet.'}</p>
            ) : null}
          </div>
        </aside>
      </div>
    </section>
  );
}
