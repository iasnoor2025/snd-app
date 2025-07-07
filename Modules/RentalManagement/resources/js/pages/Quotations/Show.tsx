import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, Button, Alert, AlertTitle, AlertDescription } from '@/Core';
import { useTranslation } from 'react-i18next';
import { Loader2, ArrowLeft, Home, Printer, Download, Mail } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from '@/Core';

interface QuotationShowProps {
  quotation: any;
  quotationItems: {
    data: any[];
    total: number;
  };
  canApprove?: boolean;
  canReject?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

const QuotationShow: React.FC<QuotationShowProps> = ({ quotation, quotationItems, canApprove, canReject, canEdit, canDelete }) => {
  const { t } = useTranslation('rental');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [actionLoading, setActionLoading] = React.useState<'approve' | 'reject' | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [emailLoading, setEmailLoading] = React.useState(false);
  const [history, setHistory] = React.useState<any[]>([]);

  React.useEffect(() => {
    axios.get(`/api/quotations/${quotation.id}/history`).then(res => {
      setHistory(res.data);
    });
  }, [quotation.id]);

  const handleApprove = async () => {
    setActionLoading('approve');
    setError(null);
    try {
      await axios.post(route('quotations.approve', quotation.id));
      toast.success(t('quotation_approved'));
      window.location.reload();
    } catch (e: any) {
      setError(e?.response?.data?.message || t('error_approving_quotation'));
      toast.error(error || t('error_approving_quotation'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    setActionLoading('reject');
    setError(null);
    try {
      await axios.post(route('quotations.reject', quotation.id));
      toast.success(t('quotation_rejected'));
      window.location.reload();
    } catch (e: any) {
      setError(e?.response?.data?.message || t('error_rejecting_quotation'));
      toast.error(error || t('error_rejecting_quotation'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    setError(null);
    try {
      await axios.delete(route('quotations.destroy', quotation.id));
      toast.success(t('quotation_deleted'));
      window.location.href = route('quotations.index');
    } catch (e: any) {
      setError(e?.response?.data?.message || t('error_deleting_quotation'));
      toast.error(error || t('error_deleting_quotation'));
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleSendEmail = async () => {
    setEmailLoading(true);
    try {
      await axios.post(`/quotations/${quotation.id}/email`);
      toast.success(t('email_sent'));
    } catch (e: any) {
      toast.error(e?.response?.data?.message || t('error_sending_email'));
    } finally {
      setEmailLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">{t('loading_quotation')}</span>
      </div>
    );
  }

  if (!quotation) {
    return (
      <Alert variant="destructive" className="my-8">
        <AlertTitle>{t('not_found')}</AlertTitle>
        <AlertDescription>{t('quotation_not_found')}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Breadcrumbs and Back Button */}
      <div className="flex items-center gap-4 mb-6">
        <a href={route('quotations.index')} className="flex items-center text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t('back_to_quotations')}
        </a>
        <nav className="flex items-center text-sm gap-2 ml-4" aria-label="Breadcrumb">
          <a href="/" className="flex items-center text-muted-foreground hover:text-primary"><Home className="h-4 w-4 mr-1" />{t('home')}</a>
          <span className="mx-1">/</span>
          <a href={route('quotations.index')} className="text-muted-foreground hover:text-primary">{t('quotations')}</a>
          <span className="mx-1">/</span>
          <span className="text-primary font-semibold">{t('quotation_number')}: {quotation.quotation_number}</span>
        </nav>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { toast.info(t('printing')); window.open(`/quotations/${quotation.id}/print`, '_blank'); }}>
            <Printer className="h-4 w-4 mr-1" /> {t('print')}
          </Button>
          <Button variant="outline" size="sm" onClick={() => { toast.info(t('downloading_pdf')); window.open(`/quotations/${quotation.id}/pdf`, '_blank'); }}>
            <Download className="h-4 w-4 mr-1" /> {t('download_pdf')}
          </Button>
          <Button variant="outline" size="sm" onClick={handleSendEmail} disabled={emailLoading}>
            {emailLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Mail className="h-4 w-4 mr-1" />}
            {t('send_email')}
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t('quotation_number')}: {quotation.quotation_number}</CardTitle>
          <CardDescription>{t('customer')}: {quotation.customer?.company_name || '-'}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Related Rental and Customer Info */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rental Info */}
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle>{t('related_rental')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-1 text-sm">
                  <div><b>{t('rental_number')}:</b> {quotation.rental?.rental_number || '-'}</div>
                  <div><b>{t('rental_status')}:</b> {quotation.rental?.status || '-'}</div>
                  <div><b>{t('rental_period')}:</b> {quotation.rental?.start_date || '-'} — {quotation.rental?.expected_end_date || '-'}</div>
                </div>
              </CardContent>
            </Card>
            {/* Customer Contact Info */}
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle>{t('customer_contact')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-1 text-sm">
                  <div><b>{t('contact_person')}:</b> {quotation.customer?.contact_person || '-'}</div>
                  <div><b>{t('email')}:</b> {quotation.customer?.email || '-'}</div>
                  <div><b>{t('phone')}:</b> {quotation.customer?.phone || '-'}</div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="mb-4 grid grid-cols-2 gap-2">
            <div><b>{t('status')}:</b> {quotation.status}</div>
            <div><b>{t('issue_date')}:</b> {quotation.issue_date}</div>
            <div><b>{t('valid_until')}:</b> {quotation.valid_until}</div>
            <div><b>{t('total_amount')}:</b> {quotation.total_amount}</div>
            <div><b>{t('notes')}:</b> {quotation.notes}</div>
          </div>
          <div className="overflow-x-auto">
            <h3 className="font-semibold mb-2">{t('quotation_items')}</h3>
            <table className="min-w-full border text-sm">
              <thead>
                <tr>
                  <th className="border px-2 py-1">{t('equipment')}</th>
                  <th className="border px-2 py-1">{t('description')}</th>
                  <th className="border px-2 py-1">{t('quantity')}</th>
                  <th className="border px-2 py-1">{t('rate')}</th>
                  <th className="border px-2 py-1">{t('total_amount')}</th>
                </tr>
              </thead>
              <tbody>
                {quotationItems.data.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-4">{t('no_items')}</td></tr>
                ) : (
                  quotationItems.data.map((item: any, idx: number) => (
                    <tr key={item.id || idx}>
                      <td className="border px-2 py-1">{item.equipment?.name || '-'}</td>
                      <td className="border px-2 py-1">{item.description || '-'}</td>
                      <td className="border px-2 py-1">{item.quantity}</td>
                      <td className="border px-2 py-1">{item.rate}</td>
                      <td className="border px-2 py-1">{item.total_amount}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex gap-2 flex-wrap">
            {canApprove && <Button onClick={handleApprove} disabled={actionLoading === 'approve'}>{actionLoading === 'approve' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}{t('approve')}</Button>}
            {canReject && <Button variant="destructive" onClick={handleReject} disabled={actionLoading === 'reject'}>{actionLoading === 'reject' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}{t('reject')}</Button>}
            {canEdit && <Button variant="outline" asChild><a href={route('quotations.edit', quotation.id)}>{t('edit')}</a></Button>}
            {canDelete && (
              <>
                <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>{t('delete')}</Button>
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('confirm_delete')}</AlertDialogTitle>
                      <AlertDialogDescription>{t('delete_quotation_warning')}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} disabled={deleteLoading} className="bg-destructive text-destructive-foreground">
                        {deleteLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {t('delete')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>{t('error')}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t('status_timeline')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {history.map((item) => (
              <div key={item.id} className="border-l-2 border-primary pl-4 relative">
                <div className="absolute -left-2 top-1.5 w-3 h-3 bg-primary rounded-full"></div>
                <div className="flex flex-col gap-1">
                  <span className="font-semibold">{t(item.action)}</span>
                  <span className="text-xs text-muted-foreground">{item.user?.name || t('system')}</span>
                  <span className="text-xs">{new Date(item.created_at).toLocaleString()}</span>
                  {item.notes && <span className="text-xs italic">{item.notes}</span>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuotationShow;
