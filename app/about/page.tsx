'use client';

import { useSite } from '@/components/site-context';

export default function AboutPage() {
  const { t } = useSite();

  return (
    <section className="section py-12">
      <h1 className="text-3xl font-bold">{t('À propos de Min-shop', 'About Min-shop')}</h1>
      <p className="mt-2 max-w-3xl text-slate-600">
        {t(
          'Min-shop est une startup africaine ambitieuse. Notre vision est panafricaine, et notre lancement opérationnel actuel est au Cameroun.',
          'Min-shop is an ambitious African startup. Our vision is pan-African, and our current operational launch is in Cameroon.'
        )}
      </p>

      <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
        <p className="font-semibold">🇨🇲 {t('Disponible au Cameroun', 'Available in Cameroon')}</p>
        <p>{t('Livraison à Yaoundé, Douala, Bafoussam et dans le Sud.', 'Delivery to Yaounde, Douala, Bafoussam, and South region.')}</p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <article className="card p-6">
          <h2 className="text-xl font-semibold">{t('Notre vision', 'Our vision')}</h2>
          <p className="mt-2 text-slate-600">
            {t(
              'Empowering African Commerce : une plateforme pensée pour l’Afrique, avec une exécution locale solide et progressive.',
              'Empowering African Commerce: a platform built for Africa, with strong and progressive local execution.'
            )}
          </p>
        </article>

        <article className="card p-6">
          <h2 className="text-xl font-semibold">{t('Dropshipper : définition simple', 'Dropshipper: simple definition')}</h2>
          <p className="mt-2 text-slate-600">
            {t(
              'Un dropshipper vend les produits d’une entreprise sans stock initial local. Il active un catalogue et coordonne la vente.',
              'A dropshipper sells company products without initial local stock. They activate a catalog and coordinate sales.'
            )}
          </p>
        </article>

        <article className="card p-6">
          <h2 className="text-xl font-semibold">{t('Dropshipping : comment ça marche', 'Dropshipping: how it works')}</h2>
          <p className="mt-2 text-slate-600">
            {t(
              'Le client commande, le fournisseur prépare, puis la livraison est suivie avec délai estimé, mode de transport et coût.',
              'The customer orders, the supplier prepares, then shipping is tracked with ETA, transport mode, and cost.'
            )}
          </p>
        </article>

        <article className="card p-6">
          <h2 className="text-xl font-semibold">{t('Avantages vendeur Min-shop', 'Min-shop seller advantages')}</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-600">
            <li>{t('Visibilité locale renforcée par ville et quartier', 'Local visibility boosted by city and district')}</li>
            <li>{t('Badge vérifié automatique selon performance et satisfaction', 'Automatic verified badge from performance and satisfaction')}</li>
            <li>{t('Accès aux recrutements proposés par les entreprises', 'Access to company recruitment offers')}</li>
          </ul>
        </article>
      </div>
    </section>
  );
}
