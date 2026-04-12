'use client';

import { SellerLayout } from '@/components/seller-layout';
import { ProductSheetAssistant } from '@/features/product-generator/components/product-sheet-assistant';
import { useSite } from '@/components/site-context';

export default function SellerAiGeneratorPage() {
  const { locale } = useSite();

  return (
    <SellerLayout>
      <ProductSheetAssistant locale={locale} />
    </SellerLayout>
  );
}
