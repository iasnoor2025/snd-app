// Types for performance reviews

export interface PerformanceReview {
    id: number;
    employee_id: number;
    reviewer_id: number;
    review_date: string;
    review_period_start?: string;
    review_period_end?: string;
    overall_rating?: number;
    status: string;
    rating: number;
    comments?: string;
    employee_comments?: string;
    created_at?: string;
    updated_at?: string;
    employee?: {
        id: number;
        first_name: string;
        last_name: string;
    };
    reviewer?: {
        id: number;
        name: string;
    };
}

export interface PerformanceReviewFilter {
    employee_id?: number;
    status?: string;
    start_date?: string;
    end_date?: string;
}

export interface PerformanceReviewFormData {
    employee_id: number;
    reviewer_id: number;
    review_date: Date;
    review_period_start: Date;
    review_period_end: Date;
    job_knowledge_rating: number;
    work_quality_rating: number;
    attendance_rating: number;
    communication_rating: number;
    teamwork_rating: number;
    initiative_rating: number;
    strengths: string[];
    weaknesses: string[];
    goals: string[];
    comments?: string;
}

export const PERFORMANCE_RATING_CATEGORIES = [
    { value: 1, label: 'Unsatisfactory', min: 1, max: 1.4 },
    { value: 2, label: 'Needs Improvement', min: 1.5, max: 2.4 },
    { value: 3, label: 'Meets Expectations', min: 2.5, max: 3.4 },
    { value: 4, label: 'Exceeds Expectations', min: 3.5, max: 4.4 },
    { value: 5, label: 'Outstanding', min: 4.5, max: 5 },
];
