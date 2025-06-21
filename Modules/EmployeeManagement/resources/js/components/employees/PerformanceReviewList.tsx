import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { format } from 'date-fns';
import { useSearchParams } from 'react-router-dom';
import {
  PerformanceReview,
  PerformanceReviewFilter,
  PERFORMANCE_RATING_CATEGORIES
} from '../../types/performance';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  MoreHorizontal,
  Plus,
  Search,
  Edit,
  Trash,
  CheckCircle,
  XCircle,
  MessageCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PerformanceReviewListProps {
  employeeId?: number;
  onCreateNew?: () => void;
  onEdit?: (review: PerformanceReview) => void;
}

// Placeholder for useLoadingState
const useLoadingState = () => ({ isLoading: false, error: null, withLoading: async (fn: any) => await fn() });
// Placeholder translation function
const t = (s: string) => s;

export const PerformanceReviewList: React.FC<PerformanceReviewListProps> = ({
  employeeId,
  onCreateNew,
  onEdit
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<PerformanceReview[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<number | null>(null);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [reviewForComment, setReviewForComment] = useState<PerformanceReview | null>(null);
  const [employeeComment, setEmployeeComment] = useState('');
  const { isLoading, error, withLoading } = useLoadingState();

  // Fetch reviews on component mount
  useEffect(() => {
    fetchReviews();
  }, [employeeId]);

  // Apply filters when filter values change
  useEffect(() => {
    applyFilters();
  }, [searchQuery, statusFilter, startDate, endDate, reviews]);

  const fetchReviews = async () => {
    await withLoading(async () => {
      let url = '/api/performance-reviews';
      const params: PerformanceReviewFilter = {};

      if (employeeId) {
        params.employee_id = employeeId;
      }

      if (Object.keys(params).length > 0) {
        url += '?' + new URLSearchParams(params as any).toString();
      }

      const response = await axios.get(url);
      setReviews(response.data.data);
      setFilteredReviews(response.data.data);
    })
  };

  const applyFilters = () => {
    let filtered = [...reviews];

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(review => {
        const employeeName = review.employee
          ? `${review.employee.first_name} ${review.employee.last_name}`.toLowerCase()
          : '';
        const reviewerName = review.reviewer
          ? review.reviewer.name.toLowerCase()
          : '';

        return (
          employeeName.includes(query) ||
          reviewerName.includes(query) ||
          (review.comments && review.comments.toLowerCase().includes(query))
        );
      })
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(review => review.status === statusFilter);
    }

    // Apply date range filter
    if (startDate && endDate) {
      filtered = filtered.filter(review => {
        const reviewDate = new Date(review.review_date);
        return reviewDate >= startDate && reviewDate <= endDate;
      })
    }

    setFilteredReviews(filtered);
  };

  const handleEdit = (review: PerformanceReview) => {
    if (onEdit) {
      onEdit(review);
    }
  };

  const handleDelete = (reviewId: number) => {
    setReviewToDelete(reviewId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (reviewToDelete) {
      await withLoading(async () => {
        await axios.delete(`/api/performance-reviews/${reviewToDelete}`);
        setReviews(reviews.filter(r => r.id !== reviewToDelete));
        setShowDeleteConfirm(false);
        setReviewToDelete(null);
      })
    }
  };

  const handleApprove = async (reviewId: number) => {
    await withLoading(async () => {
      const response = await axios.post(`/api/performance-reviews/${reviewId}/approve`);
      setReviews(reviews.map(r => (r.id === reviewId ? response.data.data : r)));
    })
  };

  const handleReject = async (reviewId: number) => {
    await withLoading(async () => {
      const response = await axios.post(`/api/performance-reviews/${reviewId}/reject`);
      setReviews(reviews.map(r => (r.id === reviewId ? response.data.data : r)));
    })
  };

  const handleAddComment = (review: PerformanceReview) => {
    setReviewForComment(review);
    setEmployeeComment(review.employee_comments || '');
    setShowCommentDialog(true);
  };

  const submitEmployeeComment = async () => {
    if (reviewForComment) {
      await withLoading(async () => {
        const response = await axios.post(
          `/api/performance-reviews/${reviewForComment.id}/employee-comments`,
          { employee_comments: employeeComment }
        );
        setReviews(reviews.map(r => (r.id === reviewForComment.id ? response.data.data : r)));
        setShowCommentDialog(false);
        setReviewForComment(null);
      })
    }
  };

  const getRatingBadge = (rating: number) => {
    const cat: any = PERFORMANCE_RATING_CATEGORIES.find((c: any) => c.value === rating);
    if (!cat) return null;
    return <Badge>{t(cat.label)}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Approved</Badge>
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  };

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">{t('ttl_performance_reviews')}</CardTitle>
          {onCreateNew && (
            <Button className="flex items-center gap-1" onClick={onCreateNew}>
              <Plus className="h-4 w-4" />
              New Review
            </Button>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder={t('ph_search_reviews')}
              className="w-full pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder={t('ph_status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('opt_all_status')}</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <DatePicker date={startDate} setDate={setStartDate} placeholder={t('lbl_start_date')} />
            <DatePicker date={endDate} setDate={setEndDate} placeholder={t('lbl_end_date')} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {!employeeId && <TableHead>Employee</TableHead>}
                <TableHead>Reviewer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={employeeId ? 6 : 7} className="text-center py-10">
                    Loading reviews...
                  </TableCell>
                </TableRow>
              ) : filteredReviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={employeeId ? 6 : 7} className="text-center py-10">
                    No performance reviews found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredReviews.map((review) => (
                  <TableRow key={review.id}>
                    {!employeeId && (
                      <TableCell>
                        {review.employee ? `${review.employee.first_name} ${review.employee.last_name}` : '-'}
                      </TableCell>
                    )}
                    <TableCell>
                      {review.reviewer ? review.reviewer.name : '-'}
                    </TableCell>
                    <TableCell>
                      {format(new Date(review.review_date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      {format(new Date(review.review_period_start), 'MMM dd, yyyy')} - {format(new Date(review.review_period_end), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      {getRatingBadge(review.overall_rating)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(review.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(review)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(review.id)}>
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                          {review.status === 'pending' && (
                            <>
                              <DropdownMenuItem onClick={() => handleApprove(review.id)}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleReject(review.id)}>
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem onClick={() => handleAddComment(review)}>
                            <MessageCircle className="mr-2 h-4 w-4" />
                            Add Employee Comment
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('ttl_delete_performance_review')}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this performance review? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex space-x-2 justify-end">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Employee Comment Dialog */}
      <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('ttl_employee_comments')}</DialogTitle>
            <DialogDescription>
              Add or update employee comments for this performance review.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="employee_comments">Comments</Label>
              <Textarea
                id="employee_comments"
                value={employeeComment}
                onChange={(e) => setEmployeeComment(e.target.value)}
                rows={5}
                placeholder={t('ph_enter_employee_comments')}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCommentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={submitEmployeeComment}>
              Save Comments
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PerformanceReviewList;


















