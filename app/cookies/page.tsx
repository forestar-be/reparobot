import CookieSettingsButton from '../../components/CookieSettingsButton';
import { SITE_URL } from '../../lib/site';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Cookies et mesure d'audience",
  description:
    "Les traceurs de reparobot.be : mesure d'audience Google Analytics seulement avec votre accord, durée des cookies et retrait du consentement.",
  alternates: { canonical: `${SITE_URL}/cookies` },
  robots: { index: true, follow: true },
};

export default function CookiesPage() {
  return (
    <div className="py-12 mobile:py-8">
      <div className="wrap max-w-3xl">
        <h1 className="mb-6 text-[41px] text-ink mobile:text-[33px]">
          Cookies et mesure d&apos;audience
        </h1>

        <div className="space-y-6 text-muted">
          <p>
            Ce site ne dépose aucun traceur de mesure avant votre accord. Vous
            choisissez dans le bandeau affiché à votre première visite ; refuser
            est aussi simple qu&apos;accepter et le site reste entièrement
            utilisable après un refus.
          </p>

          <section aria-labelledby="necessaires">
            <h2 id="necessaires" className="mb-2 text-[22px] text-ink">
              Ce qui est enregistré sans votre accord
            </h2>
            <ul className="list-disc space-y-1 pl-6">
              <li>
                Votre choix sur les cookies, dans le stockage local de votre
                navigateur (clé <code>reparobot-consent</code>), pendant 12
                mois. Il ne quitte pas votre navigateur.
              </li>
              <li>
                Les formulaires sont protégés contre les envois automatiques par
                Cloudflare Turnstile. Ce contrôle ne sert pas à mesurer
                l&apos;audience.
              </li>
            </ul>
          </section>

          <section aria-labelledby="mesure">
            <h2 id="mesure" className="mb-2 text-[22px] text-ink">
              Mesure d&apos;audience (Google Analytics 4), avec votre accord
            </h2>
            <ul className="list-disc space-y-1 pl-6">
              <li>
                <strong>Finalité :</strong> compter les pages vues et savoir si
                les visites mènent à une demande (devis, contact, entretien) ou
                à un appel téléphonique.
              </li>
              <li>
                <strong>Cookies :</strong> <code>_ga</code> et{' '}
                <code>_ga_&lt;identifiant&gt;</code>, d&apos;une durée de 13
                mois.
              </li>
              <li>
                <strong>Événements envoyés :</strong> la page vue, une demande
                de devis, de contact ou d&apos;entretien envoyée avec succès, et
                un clic sur le numéro de téléphone. Rien de ce que vous
                saisissez dans un formulaire n&apos;est transmis à Google
                Analytics.
              </li>
              <li>
                Les fonctions publicitaires de Google (signaux, personnalisation
                des annonces) sont désactivées.
              </li>
            </ul>
          </section>

          <section aria-labelledby="retrait">
            <h2 id="retrait" className="mb-2 text-[22px] text-ink">
              Changer ou retirer votre choix
            </h2>
            <p className="mb-3">
              Vous pouvez revenir sur votre choix à tout moment, avec le lien «
              Gérer les cookies » du pied de page ou le bouton ci-dessous. Le
              retrait arrête la mesure immédiatement. Vous pouvez aussi
              supprimer les cookies depuis les réglages de votre navigateur.
            </p>
            <CookieSettingsButton className="min-h-11 rounded-action border border-forest px-5 text-sm font-bold text-forest hover:bg-sage" />
          </section>

          <p>
            Responsable du site : Forestar, 160 Chaussée d&apos;Ecaussinnes,
            7090 Braine-le-Comte,{' '}
            <a href="mailto:info@forestar.be" className="text-forest underline">
              info@forestar.be
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
