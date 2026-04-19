'use client';

import Image from 'next/image';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { marketplaceCategories } from '@/lib/mock-marketplace';
import { fileToImageAsset } from '@/lib/image-quality';
import type { UploadedImageAsset } from '@/lib/image-quality';
import type {
  AiLabConfig,
  AssistantMessage,
  ChatAssistantOutput,
  ListingIntelligenceResponse,
  Locale
} from '@/types/marketplace-ai';

type AdminShopyiaLabProps = {
  locale: Locale;
  country: string;
  city: string;
  title: string;
  subtitle: string;
};

const defaultConfig: AiLabConfig = {
  baseModel: 'mistral_7b',
  orchestration: 'langchain',
  outputFormat: 'structured_json',
  separateSources: true,
  lastUpdatedAt: new Date(0).toISOString()
};

export function AdminShopyiaLab({ locale, country, city, title, subtitle }: AdminShopyiaLabProps) {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [labConfig, setLabConfig] = useState<AiLabConfig>(defaultConfig);
  const [configLoading, setConfigLoading] = useState(false);
  const [configStatus, setConfigStatus] = useState('');

  const [listingName, setListingName] = useState('');
  const [listingCategory, setListingCategory] = useState('maison');
  const [listingDescription, setListingDescription] = useState('');
  const [listingQuery, setListingQuery] = useState('');
  const [uploadedImages, setUploadedImages] = useState<UploadedImageAsset[]>([]);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  const [analysisResult, setAnalysisResult] = useState<ListingIntelligenceResponse | null>(null);

  const fetchConfig = useCallback(async () => {
    try {
      setConfigLoading(true);
      const response = await fetch('/api/admin/ai-lab-config', { cache: 'no-store' });
      if (!response.ok) throw new Error('config_fetch_failed');
      const payload = (await response.json()) as AiLabConfig;
      setLabConfig(payload);
      setConfigStatus('');
    } catch {
      setConfigStatus(locale === 'fr' ? 'Configuration IA indisponible.' : 'AI configuration unavailable.');
    } finally {
      setConfigLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    void fetchConfig();
  }, [fetchConfig]);

  const saveConfig = async () => {
    try {
      setConfigLoading(true);
      setConfigStatus('');
      const response = await fetch('/api/admin/ai-lab-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseModel: labConfig.baseModel,
          orchestration: labConfig.orchestration,
          outputFormat: labConfig.outputFormat,
          separateSources: labConfig.separateSources
        })
      });
      if (!response.ok) throw new Error('config_save_failed');
      const payload = (await response.json()) as AiLabConfig;
      setLabConfig(payload);
      setConfigStatus(locale === 'fr' ? 'Configuration IA enregistrée.' : 'AI configuration saved.');
    } catch {
      setConfigStatus(locale === 'fr' ? 'Échec de sauvegarde de la configuration IA.' : 'Failed to save AI config.');
    } finally {
      setConfigLoading(false);
    }
  };

  const send = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const nextMessages = [...messages, { role: 'user' as const, content: trimmed }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          locale,
          country,
          city,
          history: nextMessages,
          isGuest: false
        })
      });

      if (!response.ok) {
        throw new Error('chat_failed');
      }

      const payload = (await response.json()) as ChatAssistantOutput;
      setMessages((current) => [...current, { role: 'assistant', content: payload.answer }]);
    } catch {
      const fallback = locale === 'fr' ? 'Erreur serveur pendant le test Shopyia.' : 'Server error during Shopyia test.';
      setError(fallback);
      setMessages((current) => [...current, { role: 'assistant', content: fallback }]);
    } finally {
      setLoading(false);
    }
  };

  const onFilesChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      const images = await Promise.all(Array.from(files).map((file) => fileToImageAsset(file)));
      setUploadedImages(images);
      setAnalysisError('');
    } catch {
      setAnalysisError(locale === 'fr' ? "Impossible d'importer une image." : 'Could not import image.');
    }
  };

  const runImageAnalysis = async () => {
    if (uploadedImages.length === 0 || analysisLoading) {
      if (uploadedImages.length === 0) {
        setAnalysisError(locale === 'fr' ? 'Ajoute au moins une image.' : 'Add at least one image.');
      }
      return;
    }

    setAnalysisLoading(true);
    setAnalysisError('');
    setAnalysisResult(null);

    const defaultQuery =
      locale === 'fr'
        ? 'Donne le nom probable du produit et verifie la coherence.'
        : 'Give the probable product name and verify coherence.';

    const effectiveName = listingName.trim() || (locale === 'fr' ? 'Annonce image admin' : 'Admin image listing');

    try {
      const response = await fetch('/api/ai/listing-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale,
          country,
          city,
          userQuery: listingQuery.trim() || defaultQuery,
          listing: {
            name: effectiveName,
            categorySlug: listingCategory,
            description: listingDescription.trim(),
            images: uploadedImages.map((image) => image.meta)
          },
          maxResults: 5
        })
      });

      if (!response.ok) throw new Error('image_analysis_failed');
      const payload = (await response.json()) as ListingIntelligenceResponse;
      setAnalysisResult(payload);
    } catch {
      setAnalysisError(
        locale === 'fr'
          ? 'Analyse image indisponible pour le moment. Reessaie.'
          : 'Image analysis is currently unavailable. Please retry.'
      );
    } finally {
      setAnalysisLoading(false);
    }
  };

  return (
    <div className="rounded-xl border bg-white p-5">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{subtitle}</p>

      <div className="mt-4 rounded-xl border bg-slate-50 p-4">
        <h4 className="text-base font-semibold">{locale === 'fr' ? 'Paramètres IA (admin)' : 'AI settings (admin)'}</h4>
        <p className="mt-1 text-xs text-slate-600">
          {locale === 'fr'
            ? 'Ces réglages pilotent le socle Shopyia et restent accessibles dans ce labo admin.'
            : 'These settings drive the Shopyia baseline and remain accessible in this admin lab.'}
        </p>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block text-xs text-slate-500">{locale === 'fr' ? 'Modèle de base' : 'Base model'}</span>
            <select
              value={labConfig.baseModel}
              onChange={(event) => setLabConfig((current) => ({ ...current, baseModel: event.target.value as AiLabConfig['baseModel'] }))}
              className="w-full rounded-lg border px-3 py-2"
            >
              <option value="llama3">LLaMA 3</option>
              <option value="mistral_7b">Mistral 7B</option>
            </select>
          </label>

          <label className="text-sm">
            <span className="mb-1 block text-xs text-slate-500">{locale === 'fr' ? 'Framework orchestration' : 'Orchestration framework'}</span>
            <select
              value={labConfig.orchestration}
              onChange={(event) => setLabConfig((current) => ({ ...current, orchestration: event.target.value as AiLabConfig['orchestration'] }))}
              className="w-full rounded-lg border px-3 py-2"
            >
              <option value="langchain">LangChain</option>
              <option value="llamaindex">LlamaIndex</option>
            </select>
          </label>

          <label className="text-sm">
            <span className="mb-1 block text-xs text-slate-500">{locale === 'fr' ? 'Format de sortie' : 'Output format'}</span>
            <select
              value={labConfig.outputFormat}
              onChange={(event) => setLabConfig((current) => ({ ...current, outputFormat: event.target.value as AiLabConfig['outputFormat'] }))}
              className="w-full rounded-lg border px-3 py-2"
            >
              <option value="structured_json">Structured JSON</option>
              <option value="assistant_text">Assistant text</option>
            </select>
          </label>

          <label className="mt-5 inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={labConfig.separateSources}
              onChange={(event) => setLabConfig((current) => ({ ...current, separateSources: event.target.checked }))}
            />
            <span>{locale === 'fr' ? 'Séparer réponse et sources' : 'Separate answer and sources'}</span>
          </label>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            onClick={() => void saveConfig()}
            disabled={configLoading}
            className="rounded-lg bg-dark px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
          >
            {configLoading ? (locale === 'fr' ? 'Sauvegarde...' : 'Saving...') : locale === 'fr' ? 'Sauvegarder' : 'Save'}
          </button>
          <button
            onClick={() => void fetchConfig()}
            disabled={configLoading}
            className="rounded-lg border px-3 py-1.5 text-xs font-semibold disabled:opacity-60"
          >
            {locale === 'fr' ? 'Rafraîchir' : 'Refresh'}
          </button>
          <span className="text-xs text-slate-500">
            {locale === 'fr' ? 'Dernière mise à jour' : 'Last update'}: {labConfig.lastUpdatedAt}
          </span>
        </div>

        {configStatus ? <p className="mt-2 text-xs text-slate-700">{configStatus}</p> : null}
      </div>

      <div className="mt-3 h-72 overflow-y-auto rounded-lg border bg-slate-50 p-3">
        {messages.length === 0 ? (
          <p className="text-sm text-slate-500">
            {locale === 'fr'
              ? 'Exemple: Quel est le meilleur setup dropshipping pour commencer au Cameroun ?'
              : 'Example: What is the best dropshipping setup to start in Cameroon?'}
          </p>
        ) : (
          <div className="space-y-2">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[90%] rounded-lg px-3 py-2 text-sm ${message.role === 'user' ? 'ml-auto bg-dark text-white' : 'border bg-white text-slate-800'}`}
              >
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
              void send();
            }
          }}
          placeholder={locale === 'fr' ? 'Ecris un prompt de test admin...' : 'Write an admin test prompt...'}
          className="flex-1 rounded-lg border px-3 py-2"
          disabled={loading}
        />
        <button
          onClick={() => void send()}
          disabled={loading}
          className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white disabled:opacity-60"
        >
          {loading ? (locale === 'fr' ? 'Test...' : 'Testing...') : locale === 'fr' ? 'Tester' : 'Test'}
        </button>
      </div>

      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

      <div className="mt-6 rounded-xl border bg-slate-50 p-4">
        <h4 className="text-base font-semibold">
          {locale === 'fr' ? 'Test image Shopyia (Admin)' : 'Shopyia image test (Admin)'}
        </h4>
        <p className="mt-1 text-xs text-slate-600">
          {locale === 'fr'
            ? 'Envoie une image depuis ta machine et pose une question (nom probable, categorie, coherence...).'
            : 'Upload an image from your device and ask a question (probable name, category, coherence...).'}
        </p>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <input
            value={listingName}
            onChange={(event) => setListingName(event.target.value)}
            placeholder={locale === 'fr' ? 'Nom annonce (optionnel)' : 'Declared name (optional)'}
            className="rounded-lg border px-3 py-2 text-sm"
          />
          <select
            value={listingCategory}
            onChange={(event) => setListingCategory(event.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            {marketplaceCategories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.label}
              </option>
            ))}
          </select>
          <textarea
            value={listingDescription}
            onChange={(event) => setListingDescription(event.target.value)}
            placeholder={locale === 'fr' ? 'Description (optionnel)' : 'Description (optional)'}
            className="h-20 rounded-lg border px-3 py-2 text-sm md:col-span-2"
          />
          <textarea
            value={listingQuery}
            onChange={(event) => setListingQuery(event.target.value)}
            placeholder={
              locale === 'fr'
                ? 'Question a Shopyia (ex: Quel est le nom probable de ce produit ?)'
                : 'Question to Shopyia (e.g. What is the likely name of this product?)'
            }
            className="h-20 rounded-lg border px-3 py-2 text-sm md:col-span-2"
          />
          <div className="md:col-span-2">
            <input type="file" accept="image/*" multiple onChange={onFilesChange} className="w-full text-sm" />
          </div>
        </div>

        {uploadedImages.length > 0 ? (
          <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
            {uploadedImages.map((image, index) => (
              <div key={`${index}-${image.src.slice(0, 18)}`} className="relative overflow-hidden rounded border bg-white">
                <Image src={image.src} alt={`admin-upload-${index + 1}`} width={220} height={140} unoptimized className="h-20 w-full object-contain bg-white p-1" />
              </div>
            ))}
          </div>
        ) : null}

        <button
          onClick={() => void runImageAnalysis()}
          disabled={analysisLoading}
          className="mt-3 rounded-lg bg-dark px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {analysisLoading ? (locale === 'fr' ? 'Analyse...' : 'Analyzing...') : locale === 'fr' ? "Analyser l'image" : 'Analyze image'}
        </button>

        {analysisError ? <p className="mt-2 text-sm text-red-600">{analysisError}</p> : null}

        {analysisResult ? (
          <div className="mt-4 space-y-3 rounded-lg border bg-white p-3 text-sm">
            <p>
              <span className="font-semibold">{locale === 'fr' ? 'Nom probable:' : 'Likely name:'}</span>{' '}
              {analysisResult.results[0]?.product.name ?? (locale === 'fr' ? 'Non determine' : 'Not determined')}
            </p>
            <p>
              <span className="font-semibold">{locale === 'fr' ? 'Categorie probable:' : 'Likely category:'}</span>{' '}
              {analysisResult.results[0]?.product.category ?? listingCategory}
            </p>
            <p>
              <span className="font-semibold">{locale === 'fr' ? 'Coherence:' : 'Coherence:'}</span>{' '}
              {analysisResult.coherence.score}/100 ({analysisResult.coherence.status})
            </p>
            <p>
              <span className="font-semibold">{locale === 'fr' ? 'Qualite image:' : 'Image quality:'}</span>{' '}
              {analysisResult.vision.quality}
            </p>
            <p>
              <span className="font-semibold">{locale === 'fr' ? 'Reponse Shopyia:' : 'Shopyia answer:'}</span>{' '}
              {analysisResult.answer.text}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
