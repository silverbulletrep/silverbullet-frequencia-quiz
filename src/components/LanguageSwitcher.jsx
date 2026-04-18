import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const currentLang = i18n.language;

  const styles = {
    container: {
      display: 'flex',
      gap: '10px',
      padding: '10px',
      justifyContent: 'center',
      marginBottom: '20px'
    },
    button: {
      padding: '8px 16px',
      borderRadius: '4px',
      border: '1px solid #ccc',
      background: 'rgba(255, 255, 255, 0.1)',
      color: '#fff',
      cursor: 'pointer',
      fontWeight: 'bold',
      transition: 'all 0.3s ease'
    },
    active: {
      background: '#3CC7C2',
      border: '1px solid #3CC7C2',
      color: '#000'
    }
  };

  return (
    <div style={styles.container}>
      <button
        style={{ ...styles.button, ...(currentLang === 'de' || currentLang?.startsWith('de') ? styles.active : {}) }}
        onClick={() => changeLanguage('de')}
      >
        🇩🇪 DE
      </button>
      <button
        style={{ ...styles.button, ...(currentLang === 'pt' || currentLang?.startsWith('pt') ? styles.active : {}) }}
        onClick={() => changeLanguage('pt')}
      >
        🇧🇷 PT
      </button>
    </div>
  );
};

export default LanguageSwitcher;
