import { useTranslation } from 'react-i18next';

export default function Reviews() {
  const { t } = useTranslation();
  return (
    <section>
      <h1>{t('nav.myReservations')}</h1>
      <p style={{ opacity: 0.6 }}>[Stub — implemented in a later phase.]</p>
    </section>
  );
}
