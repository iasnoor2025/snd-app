import React from 'react';
import { useTranslation } from 'react-i18next';

const FileUpload: React.FC = () => {
    const { t } = useTranslation('common');
    return (
        <div>
            <label>{t('upload_document')}</label>
            <button>{t('btn_upload')}</button>
            <span>{t('file_selected')}</span>
            {t('upload_success')}
            {t('upload_error')}
        </div>
    );
};

export default FileUpload;
