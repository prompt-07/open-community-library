import { useTranslation } from 'react-i18next';

export default function About() {
  const { t } = useTranslation();
  return (
    <section>
      <h1>{t('nav.about')}</h1>
      <p style={{ opacity: 0.6 }}>[Stub — implemented in a later phase.]</p>
    </section>
  );
}
