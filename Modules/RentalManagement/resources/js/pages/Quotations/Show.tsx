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
import AppLayout from '@/Core/layouts/AppLayout';
import debounce from 'lodash/debounce';

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
    const fetchHistory = async () => {
      try {
        await axios.get('/sanctum/csrf-cookie');
        const res = await axios.get(`/api/v1/quotations/${quotation.id}/history`);
        setHistory(res.data);
      } catch (e: any) {
        if ([401, 403, 404].includes(e?.response?.status)) {
          toast.error(getTranslationString(t('history_access_denied'), 'Session expired or you do not have access to view quotation history.'));
          return;
        }
        toast.error(getTranslationString(t('error_loading_history'), 'Error loading quotation history.'));
      }
    };
    fetchHistory();
  }, [quotation.id]);

  const showErrorToast = debounce((msg) => toast.error(msg), 500, { leading: true, trailing: false });

  const handleApprove = async () => {
    setActionLoading('approve');
    setError(null);
    try {
      await axios.get('/sanctum/csrf-cookie');
      await axios.post(route('quotations.approve', quotation.id));
      toast.success(getTranslationString(t('quotation_approved'), 'Quotation Approved'));
      window.location.reload();
    } catch (e: any) {
      // Handle HTML/redirect response
      if (typeof e?.response?.data === 'string' && e.response.data.includes('<html')) {
        showErrorToast(getTranslationString(t('session_expired'), 'Your session has expired. Please log in again.'));
        setActionLoading(null);
        return;
      }
      if (e?.response?.status === 401) {
        showErrorToast(getTranslationString(t('error_no_access'), 'You do not have access to approve this quotation'));
        setActionLoading(null);
        return;
      }
      if (e?.response?.status === 403) {
        showErrorToast(getTranslationString(t('error_forbidden'), 'You are not allowed to perform this action.'));
        setActionLoading(null);
        return;
      }
      if (e?.response?.status === 419) {
        showErrorToast(getTranslationString(t('session_expired'), 'Your session has expired. Please log in again.'));
        setActionLoading(null);
        return;
      }
      setError(e?.response?.data?.message || getTranslationString(t('error_approving_quotation'), 'Error approving quotation'));
      showErrorToast(error || getTranslationString(t('error_approving_quotation'), 'Error approving quotation'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    setActionLoading('reject');
    setError(null);
    try {
      await axios.post(route('quotations.reject', quotation.id));
      toast.success(getTranslationString(t('quotation_rejected'), 'Quotation Rejected'));
      window.location.reload();
    } catch (e: any) {
      setError(e?.response?.data?.message || getTranslationString(t('error_rejecting_quotation'), 'Error rejecting quotation'));
      toast.error(error || getTranslationString(t('error_rejecting_quotation'), 'Error rejecting quotation'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    setError(null);
    try {
      await axios.delete(route('quotations.destroy', quotation.id));
      toast.success(getTranslationString(t('quotation_deleted'), 'Quotation Deleted'));
      window.location.href = route('quotations.index');
    } catch (e: any) {
      setError(e?.response?.data?.message || getTranslationString(t('error_deleting_quotation'), 'Error deleting quotation'));
      toast.error(error || getTranslationString(t('error_deleting_quotation'), 'Error deleting quotation'));
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleSendEmail = async () => {
    setEmailLoading(true);
    try {
      await axios.post(`/quotations/${quotation.id}/email`);
      toast.success(getTranslationString(t('email_sent'), 'Email Sent'));
    } catch (e: any) {
      toast.error(e?.response?.data?.message || getTranslationString(t('error_sending_email'), 'Error sending email'));
    } finally {
      setEmailLoading(false);
    }
  };

  // Helper to safely get translation string
  const getTranslationString = (val: any, fallback: string) => {
    if (typeof val === 'string') return val;
    if (val && typeof val === 'object' && 'en' in val) return val.en;
    return fallback;
  };

  // Helper to safely get a string from any value (translation object, string, or other)
  const safeString = (val: any, fallback: string = '-') => {
    if (typeof val === 'string') return val;
    if (val && typeof val === 'object' && 'en' in val) return val.en;
    if (val === null || val === undefined) return fallback;
    return String(val);
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">{getTranslationString(t('loading_quotation'), 'Loading Quotation')}</span>
      </div>
    );
  }

  if (!quotation) {
    return (
      <Alert variant="destructive" className="my-8">
        <AlertTitle>{getTranslationString(t('not_found'), 'Not Found')}</AlertTitle>
        <AlertDescription>{getTranslationString(t('quotation_not_found'), 'Quotation not found')}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Breadcrumbs and Back Button */}
      <div className="flex items-center gap-4 mb-6">
        <a href={route('quotations.index')} className="flex items-center text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1" />
          {getTranslationString(t('back_to_quotations'), 'Back to Quotations')}
        </a>
        <nav className="flex items-center text-sm gap-2 ml-4" aria-label="Breadcrumb">
          <a href="/" className="flex items-center text-muted-foreground hover:text-primary"><Home className="h-4 w-4 mr-1" />{getTranslationString(t('home'), 'Home')}</a>
          <span className="mx-1">/</span>
          <a href={route('quotations.index')} className="text-muted-foreground hover:text-primary">{getTranslationString(t('quotations'), 'Quotations')}</a>
          <span className="mx-1">/</span>
          <span className="text-primary font-semibold">{getTranslationString(t('quotation_number'), 'Quotation Number')}: {quotation.quotation_number}</span>
        </nav>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { toast.info(getTranslationString(t('printing'), 'Printing')); window.open(`/quotations/${quotation.id}/print`, '_blank'); }}>
            <Printer className="h-4 w-4 mr-1" /> {getTranslationString(t('print'), 'Print')}
          </Button>
          <Button variant="outline" size="sm" onClick={() => { toast.info(getTranslationString(t('downloading_pdf'), 'Downloading PDF')); window.open(`/quotations/${quotation.id}/pdf`, '_blank'); }}>
            <Download className="h-4 w-4 mr-1" /> {getTranslationString(t('download_pdf'), 'Download PDF')}
          </Button>
          <Button variant="outline" size="sm" onClick={handleSendEmail} disabled={emailLoading}>
            {emailLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Mail className="h-4 w-4 mr-1" />}
            {getTranslationString(t('send_email'), 'Send Email')}
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{getTranslationString(t('quotation_number'), 'Quotation Number')}: {quotation.quotation_number}</CardTitle>
          <CardDescription>{getTranslationString(t('customer'), 'Customer')}: {safeString(quotation.customer?.company_name)}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Related Rental and Customer Info */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rental Info */}
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle>{getTranslationString(t('related_rental'), 'Related Rental')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-1 text-sm">
                  <div><b>{getTranslationString(t('rental_number'), 'Rental Number')}:</b> {safeString(quotation.rental?.rental_number)}</div>
                  <div><b>{getTranslationString(t('rental_status'), 'Rental Status')}:</b> {safeString(quotation.rental?.status)}</div>
                  <div><b>{getTranslationString(t('rental_period'), 'Rental Period')}:</b> {safeString(quotation.rental?.start_date)} — {safeString(quotation.rental?.expected_end_date)}</div>
                </div>
              </CardContent>
            </Card>
            {/* Customer Contact Info */}
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle>{getTranslationString(t('customer_contact'), 'Customer Contact')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-1 text-sm">
                  <div><b>{getTranslationString(t('contact_person'), 'Contact Person')}:</b> {safeString(quotation.customer?.contact_person)}</div>
                  <div><b>{getTranslationString(t('email'), 'Email')}:</b> {safeString(quotation.customer?.email)}</div>
                  <div><b>{getTranslationString(t('phone'), 'Phone')}:</b> {safeString(quotation.customer?.phone)}</div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="mb-4 grid grid-cols-2 gap-2">
            <div><b>{getTranslationString(t('status'), 'Status')}:</b> {getTranslationString(quotation.status, quotation.status)}</div>
            <div><b>{getTranslationString(t('issue_date'), 'Issue Date')}:</b> {getTranslationString(quotation.issue_date, quotation.issue_date)}</div>
            <div><b>{getTranslationString(t('valid_until'), 'Valid Until')}:</b> {getTranslationString(quotation.valid_until, quotation.valid_until)}</div>
            <div><b>{getTranslationString(t('total_amount'), 'Total Amount')}:</b> {getTranslationString(quotation.total_amount, quotation.total_amount)}</div>
            <div><b>{getTranslationString(t('notes'), 'Notes')}:</b> {safeString(quotation.notes)}</div>
          </div>
          <div className="overflow-x-auto">
            <h3 className="font-semibold mb-2">{getTranslationString(t('quotation_items'), 'Quotation Items')}</h3>
            <table className="min-w-full border text-sm">
              <thead>
                <tr>
                  <th className="border px-2 py-1">{getTranslationString(t('equipment'), 'Equipment')}</th>
                  <th className="border px-2 py-1">{getTranslationString(t('description'), 'Description')}</th>
                  <th className="border px-2 py-1">{getTranslationString(t('quantity'), 'Quantity')}</th>
                  <th className="border px-2 py-1">{getTranslationString(t('rate'), 'Rate')}</th>
                  <th className="border px-2 py-1">{getTranslationString(t('total_amount'), 'Total Amount')}</th>
                </tr>
              </thead>
              <tbody>
                {quotationItems.data.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-4">{getTranslationString(t('no_items'), 'No items')}</td></tr>
                ) : (
                  quotationItems.data.map((item: any, idx: number) => (
                    <tr key={item.id || idx}>
                      <td className="border px-2 py-1">{safeString(item.equipment?.name)}</td>
                      <td className="border px-2 py-1">{safeString(item.description)}</td>
                      <td className="border px-2 py-1">{safeString(item.quantity)}</td>
                      <td className="border px-2 py-1">{safeString(item.rate)}</td>
                      <td className="border px-2 py-1">{safeString(item.total_amount)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex gap-2 flex-wrap">
            {canApprove && <Button onClick={handleApprove} disabled={actionLoading === 'approve'}>{actionLoading === 'approve' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}{getTranslationString(t('approve'), 'Approve')}</Button>}
            {canReject && <Button variant="destructive" onClick={handleReject} disabled={actionLoading === 'reject'}>{actionLoading === 'reject' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}{getTranslationString(t('reject'), 'Reject')}</Button>}
            {canEdit && <Button variant="outline" asChild><a href={route('quotations.edit', quotation.id)}>{getTranslationString(t('edit'), 'Edit')}</a></Button>}
            {canDelete && (
              <>
                <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>{getTranslationString(t('delete'), 'Delete')}</Button>
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{getTranslationString(t('confirm_delete'), 'Confirm Delete')}</AlertDialogTitle>
                      <AlertDialogDescription>{getTranslationString(t('delete_quotation_warning'), 'Are you sure?')}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{getTranslationString(t('cancel'), 'Cancel')}</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} disabled={deleteLoading} className="bg-destructive text-destructive-foreground">
                        {deleteLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {getTranslationString(t('delete'), 'Delete')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>{getTranslationString(t('error'), 'Error')}</AlertTitle>
              <AlertDescription>{getTranslationString(error, error)}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{getTranslationString(t('status_timeline'), 'Status Timeline')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {history.map((item) => (
              <div key={item.id} className="border-l-2 border-primary pl-4 relative">
                <div className="absolute -left-2 top-1.5 w-3 h-3 bg-primary rounded-full"></div>
                <div className="flex flex-col gap-1">
                  <span className="font-semibold">{getTranslationString(t(item.action), item.action)}</span>
                  <span className="text-xs text-muted-foreground">{item.user?.name || getTranslationString(t('system'), 'System')}</span>
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

(QuotationShow as any).layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;

export default QuotationShow;
