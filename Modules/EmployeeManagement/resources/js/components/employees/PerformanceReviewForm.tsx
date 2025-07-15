import {
    Alert,
    AlertDescription,
    AlertTitle,
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    DatePicker,
    Input,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Slider,
    Textarea,
} from '@/Core';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { format } from 'date-fns';
import { AlertCircle, Loader2, Plus, Save, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';
import useLoadingState from '../../hooks/useLoadingState';
import { Employee } from '../../types/employee';
import { PERFORMANCE_RATING_CATEGORIES, PerformanceReview, PerformanceReviewFormData } from '../../types/performance';
import { User } from '../../types/user';

interface PerformanceReviewFormProps {
    review?: PerformanceReview;
    employeeId?: number;
    onSave?: (review: PerformanceReview) => void;
    onCancel?: () => void;
}

// Define Zod schema for form validation
const formSchema = z.object({
    employee_id: z.coerce.number().min(1, 'Employee is required'),
    reviewer_id: z.coerce.number().min(1, 'Reviewer is required'),
    review_date: z.date({ required_error: 'Review date is required' }),
    review_period_start: z.date({ required_error: 'Review period start date is required' }),
    review_period_end: z
        .date({ required_error: 'Review period end date is required' })
        .refine((date) => date > new Date(0), { message: 'End date is required' }),
    job_knowledge_rating: z.coerce.number().min(1).max(5),
    work_quality_rating: z.coerce.number().min(1).max(5),
    attendance_rating: z.coerce.number().min(1).max(5),
    communication_rating: z.coerce.number().min(1).max(5),
    teamwork_rating: z.coerce.number().min(1).max(5),
    initiative_rating: z.coerce.number().min(1).max(5),
    strengths: z.array(z.string()).default([]),
    weaknesses: z.array(z.string()).default([]),
    goals: z.array(z.string()).default([]),
    comments: z.string().optional(),
});

const PerformanceReviewForm: React.FC<PerformanceReviewFormProps> = ({ review, employeeId, onSave, onCancel }) => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [reviewers, setReviewers] = useState<User[]>([]);
    const [strengthInput, setStrengthInput] = useState('');
    const [weaknessInput, setWeaknessInput] = useState('');
    const [goalInput, setGoalInput] = useState('');
    const [overallRating, setOverallRating] = useState(3);
    const { isLoading, error, withLoading } = useLoadingState('performanceReviewForm');

    // Calculate rating category
    const getRatingCategory = (rating: number) => {
        const { t } = useTranslation('employee');

        const category = PERFORMANCE_RATING_CATEGORIES.find((cat) => rating >= cat.min && rating <= cat.max);
        return category || PERFORMANCE_RATING_CATEGORIES[2]; // Default to "Good" if not found
    };

    // Initialize form with React Hook Form and Zod validation
    const {
        register,
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
        reset,
    } = useForm<PerformanceReviewFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: review
            ? mapReviewToFormValues(review)
            : {
                  employee_id: employeeId || 0,
                  reviewer_id: 0,
                  review_date: new Date(),
                  review_period_start: new Date(new Date().setMonth(new Date().getMonth() - 6)),
                  review_period_end: new Date(),
                  job_knowledge_rating: 3,
                  work_quality_rating: 3,
                  attendance_rating: 3,
                  communication_rating: 3,
                  teamwork_rating: 3,
                  initiative_rating: 3,
                  strengths: [],
                  weaknesses: [],
                  goals: [],
                  comments: '',
              },
    });

    // Watch rating values to calculate overall rating
    const ratings = [
        watch('job_knowledge_rating'),
        watch('work_quality_rating'),
        watch('attendance_rating'),
        watch('communication_rating'),
        watch('teamwork_rating'),
        watch('initiative_rating'),
    ];

    // Helper function to map PerformanceReview to form values
    function mapReviewToFormValues(review: PerformanceReview): PerformanceReviewFormData {
        return {
            employee_id: review.employee_id,
            reviewer_id: review.reviewer_id,
            review_date: new Date(review.review_date),
            review_period_start: new Date(review.review_period_start),
            review_period_end: new Date(review.review_period_end),
            job_knowledge_rating: review.job_knowledge_rating,
            work_quality_rating: review.work_quality_rating,
            attendance_rating: review.attendance_rating,
            communication_rating: review.communication_rating,
            teamwork_rating: review.teamwork_rating,
            initiative_rating: review.initiative_rating,
            strengths: review.strengths || [],
            weaknesses: review.weaknesses || [],
            goals: review.goals || [],
            comments: review.comments || '',
        };
    }

    // Calculate overall rating whenever individual ratings change
    useEffect(() => {
        const validRatings = ratings.filter((r) => !isNaN(r));
        if (validRatings.length > 0) {
            const avg = validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length;
            setOverallRating(parseFloat(avg.toFixed(1)));
        }
    }, [ratings]);

    // Fetch employees and reviewers on component mount
    useEffect(() => {
        const fetchData = async () => {
            await withLoading(async () => {
                try {
                    const [employeesResponse, usersResponse] = await Promise.all([axios.get('/api/employees'), axios.get('/api/users')]);

                    setEmployees(employeesResponse.data.data);
                    setReviewers(usersResponse.data.data);
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            });
        };

        fetchData();
    }, []);

    // Handle form submission
    const onSubmit = async (data: PerformanceReviewFormData) => {
        await withLoading(async () => {
            try {
                // Format dates for API
                const formattedData = {
                    ...data,
                    review_date: format(data.review_date, 'yyyy-MM-dd'),
                    review_period_start: format(data.review_period_start, 'yyyy-MM-dd'),
                    review_period_end: format(data.review_period_end, 'yyyy-MM-dd'),
                };

                let response;
                if (review?.id) {
                    // Update existing review
                    response = await axios.put(`/api/performance-reviews/${review.id}`, formattedData);
                } else {
                    // Create new review
                    response = await axios.post('/api/performance-reviews', formattedData);
                }

                if (onSave) {
                    onSave(response.data.data);
                }
            } catch (error) {
                console.error('Error saving performance review:', error);
                throw error;
            }
        });
    };

    // Handle adding a strength
    const handleAddStrength = () => {
        if (strengthInput.trim()) {
            const currentStrengths = watch('strengths') || [];
            setValue('strengths', [...currentStrengths, strengthInput.trim()]);
            setStrengthInput('');
        }
    };

    // Handle adding a weakness
    const handleAddWeakness = () => {
        if (weaknessInput.trim()) {
            const currentWeaknesses = watch('weaknesses') || [];
            setValue('weaknesses', [...currentWeaknesses, weaknessInput.trim()]);
            setWeaknessInput('');
        }
    };

    // Handle adding a goal
    const handleAddGoal = () => {
        if (goalInput.trim()) {
            const currentGoals = watch('goals') || [];
            setValue('goals', [...currentGoals, goalInput.trim()]);
            setGoalInput('');
        }
    };

    // Handle removing an item from an array
    const handleRemoveItem = (field: 'strengths' | 'weaknesses' | 'goals', index: number) => {
        const current = watch(field) || [];
        setValue(
            field,
            current.filter((_, i) => i !== index),
        );
    };

    // Get rating badge
    const getRatingBadge = (rating: number) => {
        const category = getRatingCategory(rating);
        return (
            <Badge className={category.color}>
                {rating.toFixed(1)} - {category.label}
            </Badge>
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{review ? 'Edit Performance Review' : 'Create New Performance Review'}</CardTitle>
                <CardDescription>{review ? 'Update performance review information' : 'Create a new employee performance review'}</CardDescription>
            </CardHeader>
            <CardContent>
                {error && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Review Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">{t('review_information')}</h3>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="employee_id">
                                    Employee <span className="text-red-500">*</span>
                                </Label>
                                <Controller
                                    name="employee_id"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value.toString()}
                                            onValueChange={(value) => field.onChange(parseInt(value))}
                                            disabled={!!employeeId || isLoading}
                                        >
                                            <SelectTrigger id="employee_id">
                                                <SelectValue placeholder={t('ph_select_employee')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {employees.map((employee) => (
                                                    <SelectItem key={employee.id} value={employee.id.toString()}>
                                                        {employee.first_name} {employee.last_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.employee_id && <p className="text-sm text-red-500">{errors.employee_id.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reviewer_id">
                                    Reviewer <span className="text-red-500">*</span>
                                </Label>
                                <Controller
                                    name="reviewer_id"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value.toString()}
                                            onValueChange={(value) => field.onChange(parseInt(value))}
                                            disabled={isLoading}
                                        >
                                            <SelectTrigger id="reviewer_id">
                                                <SelectValue placeholder={t('ph_select_reviewer')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {reviewers.map((user) => (
                                                    <SelectItem key={user.id} value={user.id.toString()}>
                                                        {user.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.reviewer_id && <p className="text-sm text-red-500">{errors.reviewer_id.message}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="review_date">
                                    {t('lbl_review_date')} <span className="text-red-500">*</span>
                                </Label>
                                <Controller
                                    name="review_date"
                                    control={control}
                                    render={({ field }) => <DatePicker value={field.value} onChange={field.onChange} />}
                                />
                                {errors.review_date && <p className="text-sm text-red-500">{errors.review_date.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="review_period_start">
                                    {t('lbl_period_start')} <span className="text-red-500">*</span>
                                </Label>
                                <Controller
                                    name="review_period_start"
                                    control={control}
                                    render={({ field }) => <DatePicker value={field.value} onChange={field.onChange} />}
                                />
                                {errors.review_period_start && <p className="text-sm text-red-500">{errors.review_period_start.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="review_period_end">
                                    {t('lbl_period_end')} <span className="text-red-500">*</span>
                                </Label>
                                <Controller
                                    name="review_period_end"
                                    control={control}
                                    render={({ field }) => <DatePicker value={field.value} onChange={field.onChange} />}
                                />
                                {errors.review_period_end && <p className="text-sm text-red-500">{errors.review_period_end.message}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Performance Ratings */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium">{t('performance_ratings')}</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Overall:</span>
                                {getRatingBadge(overallRating)}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Label htmlFor="job_knowledge_rating">{t('lbl_job_knowledge')}</Label>
                                    <span className="text-sm">{watch('job_knowledge_rating')}/5</span>
                                </div>
                                <Controller
                                    name="job_knowledge_rating"
                                    control={control}
                                    render={({ field }) => (
                                        <Slider
                                            value={[field.value]}
                                            min={1}
                                            max={5}
                                            step={0.5}
                                            onValueChange={(value) => field.onChange(value[0])}
                                        />
                                    )}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Label htmlFor="work_quality_rating">{t('lbl_work_quality')}</Label>
                                    <span className="text-sm">{watch('work_quality_rating')}/5</span>
                                </div>
                                <Controller
                                    name="work_quality_rating"
                                    control={control}
                                    render={({ field }) => (
                                        <Slider
                                            value={[field.value]}
                                            min={1}
                                            max={5}
                                            step={0.5}
                                            onValueChange={(value) => field.onChange(value[0])}
                                        />
                                    )}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Label htmlFor="attendance_rating">Attendance & Punctuality</Label>
                                    <span className="text-sm">{watch('attendance_rating')}/5</span>
                                </div>
                                <Controller
                                    name="attendance_rating"
                                    control={control}
                                    render={({ field }) => (
                                        <Slider
                                            value={[field.value]}
                                            min={1}
                                            max={5}
                                            step={0.5}
                                            onValueChange={(value) => field.onChange(value[0])}
                                        />
                                    )}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Label htmlFor="communication_rating">Communication</Label>
                                    <span className="text-sm">{watch('communication_rating')}/5</span>
                                </div>
                                <Controller
                                    name="communication_rating"
                                    control={control}
                                    render={({ field }) => (
                                        <Slider
                                            value={[field.value]}
                                            min={1}
                                            max={5}
                                            step={0.5}
                                            onValueChange={(value) => field.onChange(value[0])}
                                        />
                                    )}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Label htmlFor="teamwork_rating">Teamwork</Label>
                                    <span className="text-sm">{watch('teamwork_rating')}/5</span>
                                </div>
                                <Controller
                                    name="teamwork_rating"
                                    control={control}
                                    render={({ field }) => (
                                        <Slider
                                            value={[field.value]}
                                            min={1}
                                            max={5}
                                            step={0.5}
                                            onValueChange={(value) => field.onChange(value[0])}
                                        />
                                    )}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Label htmlFor="initiative_rating">Initiative & Innovation</Label>
                                    <span className="text-sm">{watch('initiative_rating')}/5</span>
                                </div>
                                <Controller
                                    name="initiative_rating"
                                    control={control}
                                    render={({ field }) => (
                                        <Slider
                                            value={[field.value]}
                                            min={1}
                                            max={5}
                                            step={0.5}
                                            onValueChange={(value) => field.onChange(value[0])}
                                        />
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Strengths, Weaknesses, and Goals */}
                    <div className="space-y-8">
                        {/* Strengths */}
                        <div className="space-y-2">
                            <Label htmlFor="strengths">Strengths</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="strength-input"
                                    value={strengthInput}
                                    onChange={(e) => setStrengthInput(e.target.value)}
                                    placeholder={t('ph_enter_strength')}
                                    className="flex-1"
                                />
                                <Button type="button" onClick={handleAddStrength} size="sm" className="flex items-center gap-1">
                                    <Plus className="h-4 w-4" />
                                    Add
                                </Button>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {watch('strengths')?.map((strength, index) => (
                                    <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                                        {strength}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveItem('strengths', index)}
                                            className="text-gray-500 hover:text-gray-700 focus:outline-none"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Weaknesses */}
                        <div className="space-y-2">
                            <Label htmlFor="weaknesses">{t('lbl_areas_for_improvement')}</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="weakness-input"
                                    value={weaknessInput}
                                    onChange={(e) => setWeaknessInput(e.target.value)}
                                    placeholder={t('ph_enter_area_for_improvement')}
                                    className="flex-1"
                                />
                                <Button type="button" onClick={handleAddWeakness} size="sm" className="flex items-center gap-1">
                                    <Plus className="h-4 w-4" />
                                    Add
                                </Button>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {watch('weaknesses')?.map((weakness, index) => (
                                    <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                                        {weakness}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveItem('weaknesses', index)}
                                            className="text-gray-500 hover:text-gray-700 focus:outline-none"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Goals */}
                        <div className="space-y-2">
                            <Label htmlFor="goals">Goals & Objectives</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="goal-input"
                                    value={goalInput}
                                    onChange={(e) => setGoalInput(e.target.value)}
                                    placeholder={t('ph_enter_goal_or_objective')}
                                    className="flex-1"
                                />
                                <Button type="button" onClick={handleAddGoal} size="sm" className="flex items-center gap-1">
                                    <Plus className="h-4 w-4" />
                                    Add
                                </Button>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {watch('goals')?.map((goal, index) => (
                                    <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                                        {goal}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveItem('goals', index)}
                                            className="text-gray-500 hover:text-gray-700 focus:outline-none"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Comments */}
                        <div className="space-y-2">
                            <Label htmlFor="comments">{t('lbl_additional_comments')}</Label>
                            <Textarea id="comments" {...register('comments')} rows={4} placeholder={t('ph_enter_any_additional_comments_or_notes')} />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                        {onCancel && (
                            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                                Cancel
                            </Button>
                        )}

                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    {review ? 'Update Review' : 'Create Review'}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default PerformanceReviewForm;
