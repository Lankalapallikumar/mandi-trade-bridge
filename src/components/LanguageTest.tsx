'use client';

import { useI18n } from '../lib/i18n/context';

export default function LanguageTest() {
  const { language, supportedLanguages, t } = useI18n();

  return (
    <div className="bg-blue-100 p-4 m-4 rounded-lg border-2 border-blue-500">
      <h3 className="font-bold text-lg mb-2">Language Test Component</h3>
      <div className="space-y-2">
        <p><strong>Current Language:</strong> {language}</p>
        <p><strong>Home Title:</strong> {t('home.title')}</p>
        <p><strong>Home Description:</strong> {t('home.description')}</p>
        <p><strong>Available Languages:</strong> {supportedLanguages.map(lang => lang.code).join(', ')}</p>
      </div>
    </div>
  );
}