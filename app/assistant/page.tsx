'use client';

import { AssistantChat } from '@/features/ai-chat/components/assistant-chat';
import { useSite } from '@/components/site-context';

export default function AssistantPage() {
  const { locale, country, city } = useSite();
  return <AssistantChat locale={locale} country={country} city={city} />;
}
