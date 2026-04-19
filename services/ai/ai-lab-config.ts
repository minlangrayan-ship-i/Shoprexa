import fs from 'node:fs';
import path from 'node:path';
import type { AiLabConfig } from '@/types/marketplace-ai';

const STORE_PATH = path.join(process.cwd(), 'db', 'ai-lab-config.json');

const DEFAULT_CONFIG: AiLabConfig = {
  baseModel: 'mistral_7b',
  orchestration: 'langchain',
  outputFormat: 'structured_json',
  separateSources: true,
  lastUpdatedAt: new Date().toISOString()
};

function ensureDir() {
  const dir = path.dirname(STORE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function safeParse(raw: string): AiLabConfig | null {
  try {
    const parsed = JSON.parse(raw) as Partial<AiLabConfig>;
    if (!parsed) return null;
    if (parsed.baseModel !== 'llama3' && parsed.baseModel !== 'mistral_7b') return null;
    if (parsed.orchestration !== 'langchain' && parsed.orchestration !== 'llamaindex') return null;
    if (parsed.outputFormat !== 'structured_json' && parsed.outputFormat !== 'assistant_text') return null;
    if (typeof parsed.separateSources !== 'boolean') return null;
    if (typeof parsed.lastUpdatedAt !== 'string') return null;
    return parsed as AiLabConfig;
  } catch {
    return null;
  }
}

export function getAiLabConfig(): AiLabConfig {
  try {
    if (!fs.existsSync(STORE_PATH)) return DEFAULT_CONFIG;
    const raw = fs.readFileSync(STORE_PATH, 'utf8');
    return safeParse(raw) ?? DEFAULT_CONFIG;
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveAiLabConfig(
  payload: Pick<AiLabConfig, 'baseModel' | 'orchestration' | 'outputFormat' | 'separateSources'>
): AiLabConfig {
  const next: AiLabConfig = {
    ...payload,
    lastUpdatedAt: new Date().toISOString()
  };
  ensureDir();
  fs.writeFileSync(STORE_PATH, JSON.stringify(next), 'utf8');
  return next;
}
