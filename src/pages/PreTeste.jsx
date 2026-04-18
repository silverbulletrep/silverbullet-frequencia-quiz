import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './PreTeste.module.scss';

const PreTeste = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const onContinue = () => {
    // Próximo passo após o pré-teste — se preferir outra rota, me avise
    const qs = searchParams.toString();
    navigate(`/quiz-step-1${qs ? `?${qs}` : ''}`);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Removido conforme solicitado */}

        {/* Conteúdo principal */}
        <div className={styles.card}>
          <div className={styles.section}>
            <h1 className={styles.title}>
              {t('pre_teste.title_part1')}
              <br />
              {t('pre_teste.title_part2')}
            </h1>
            <p className={styles.subtitle}>
              {t('pre_teste.subtitle_part1')}
              <br />
              {t('pre_teste.subtitle_part2')}
              <br />
              {t('pre_teste.subtitle_part3')}
            </p>

            <div className={styles.listIntro}>
              <strong className={styles.listTitle}>{t('pre_teste.list_title')}</strong>
            </div>
            <ul className={styles.list}>
              <li>{t('pre_teste.list_items.frequency')}</li>
              <li>{t('pre_teste.list_items.blocks')}</li>
              <li>{t('pre_teste.list_items.patterns')}</li>
              <li>{t('pre_teste.list_items.impediment')}</li>
              <li>{t('pre_teste.list_items.impact')}</li>
            </ul>
          </div>

          {/* Aviso amarelo */}
          <div className={styles.warning}>
            <p>
              <strong>{t('pre_teste.warning_title')}</strong> {t('pre_teste.warning_text_part1')}
              <br />
              {t('pre_teste.warning_text_part2')}
              <br />
              {t('pre_teste.warning_text_part3')}
            </p>
          </div>

          {/* Frase de ênfase */}
          <div className={styles.emphasis}>
            <p>
              {t('pre_teste.emphasis_text_part1')}
              <br />
              {t('pre_teste.emphasis_text_part2')}
            </p>
          </div>

          {/* Botão continuar */}
          <div className={styles.actions}>
            <button className={styles.continueBtn} onClick={onContinue}>
              {t('pre_teste.button_continue')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreTeste;