import React from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '../ui/button';

/**
 * Example component demonstrating how to use react-i18next with toast notifications
 * This replaces the TODO comments in the codebase about toast messages
 */
const ToastExample: React.FC = () => {
  // Use the useTranslation hook to access translation functions
  const { t } = useTranslation(['common', 'employees']);

  // Example functions to show different types of toast messages
  const showSuccessToast = () => {
    toast.success(t('common:success'), {
      description: t('employees:document_uploaded_successfully'),
    });
  };

  const showErrorToast = () => {
    toast.error(t('common:error'), {
      description: t('employees:document_upload_failed'),
    });
  };

  const showWarningToast = () => {
    toast.warning(t('common:warning'), {
      description: t('employees:document_expiring_soon'),
    });
  };

  const showInfoToast = () => {
    toast.info(t('common:info'), {
      description: t('employees:document_processing'),
    });
  };

  const showConfirmationToast = () => {
    // Example of a confirmation toast with translated buttons
    toast(t('employees:confirm_delete_document'), {
      action: {
        label: t('common:delete'),
        onClick: () => console.log('Confirmed delete')
      },
      cancel: {
        label: t('common:cancel'),
        onClick: () => console.log('Cancelled delete')
      },
    });
  };

  // Example of replacing a TODO comment in the original code
  const handleDocumentDelete = (documentId: number) => {
    // Original code with TODO:
    // axios.delete(`/api/employee/${employeeId}/documents/${doc.id}`)
    //   .then(() => {
    //     // TODO: Replace with toast('message')
    //   })
    //   .catch((error) => {
    //     // TODO: Replace with toast('message')
    //   });

    // New code with react-i18next:
    toast(t('employees:confirm_delete_document'), {
      action: {
        label: t('common:delete'),
        onClick: () => {
          // axios.delete(`/api/employee/${employeeId}/documents/${documentId}`)
          //   .then(() => {
          //     toast.success(t('common:success'), {
          //       description: t('employees:document_deleted_successfully')
          //     });
          //   })
          //   .catch((error) => {
          //     toast.error(t('common:error'), {
          //       description: t('employees:document_delete_failed')
          //     });
          //   });
          console.log('Document deleted');
        }
      },
      cancel: {
        label: t('common:cancel'),
        onClick: () => console.log('Cancelled delete')
      },
    });
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">{t('employees:toast_examples')}</h1>

      <div className="flex flex-wrap gap-2">
        <Button onClick={showSuccessToast} className="bg-green-500 hover:bg-green-600">
          {t('employees:show_success_toast')}
        </Button>

        <Button onClick={showErrorToast} className="bg-red-500 hover:bg-red-600">
          {t('employees:show_error_toast')}
        </Button>

        <Button onClick={showWarningToast} className="bg-yellow-500 hover:bg-yellow-600 text-black">
          {t('employees:show_warning_toast')}
        </Button>

        <Button onClick={showInfoToast} className="bg-blue-500 hover:bg-blue-600">
          {t('employees:show_info_toast')}
        </Button>

        <Button onClick={showConfirmationToast} className="bg-purple-500 hover:bg-purple-600">
          {t('employees:show_confirmation_toast')}
        </Button>

        <Button onClick={() => handleDocumentDelete(1)} className="bg-gray-500 hover:bg-gray-600">
          {t('employees:delete_document_example')}
        </Button>
      </div>
    </div>
  );
};

export default ToastExample;
