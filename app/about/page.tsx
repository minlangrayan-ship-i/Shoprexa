'use client';

import { useSite } from '@/components/site-context';

export default function AboutPage() {
  const { t } = useSite();

  return (
    <section className="section py-12">
      <h1 className="text-3xl font-bold">{t('A propos de Min-shop', 'About Min-shop')}</h1>
      <p className="mt-2 max-w-3xl text-slate-600">
        {t(
          'Min-shop construit une marketplace africaine de confiance: vendeurs classes, livraison previsible et accompagnement transparent.',
          'Min-shop builds a trusted African marketplace: ranked sellers, predictable delivery, and transparent guidance.'
        )}
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <article className="card p-6">
          <h2 className="text-xl font-semibold">{t('Dropshipper: definition simple', 'Dropshipper: simple definition')}</h2>
          <p className="mt-2 text-slate-600">
            {t(
              'Un dropshipper vend les produits d une entreprise sans stock initial local. Il active un catalogue et coordonne la vente.',
              'A dropshipper sells company products without initial local stock. They activate a catalog and coordinate sales.'
            )}
          </p>
        </article>

        <article className="card p-6">
          <h2 className="text-xl font-semibold">{t('Dropshipping: comment ca marche', 'Dropshipping: how it works')}</h2>
          <p className="mt-2 text-slate-600">
            {t(
              'Le client commande, le fournisseur prepare, puis la livraison est suivie avec delai estime, mode de transport et cout.',
              'The customer orders, the supplier prepares, then shipping is tracked with ETA, transport mode, and cost.'
            )}
          </p>
        </article>

        <article className="card p-6">
          <h2 className="text-xl font-semibold">{t('Avantages vendeur Min-shop', 'Min-shop seller advantages')}</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-600">
            <li>{t('Visibilite locale renforcee par ville et pays', 'Local visibility boosted by city and country')}</li>
            <li>{t('Badge verifie automatique selon performance et satisfaction', 'Automatic verified badge from performance and satisfaction')}</li>
            <li>{t('Acces aux recrutements proposes par les entreprises', 'Access to company recruitment offers')}</li>
          </ul>
        </article>

        <article className="card p-6">
          <h2 className="text-xl font-semibold">{t('Avantages entreprise', 'Company advantages')}</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-600">
            <li>{t('Diffusion de produits et services sur plusieurs pays', 'Products and services distribution across countries')}</li>
            <li>{t('Recrutement de vendeurs Min-shop et dropshippers', 'Recruit Min-shop sellers and dropshippers')}</li>
            <li>{t('Suivi du taux de satisfaction et des plaintes', 'Track satisfaction rates and complaints')}</li>
          </ul>
        </article>
      </div>
    </section>
  );
}
