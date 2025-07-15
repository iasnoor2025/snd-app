import { ToastService } from '@/Core';

export class ApiToastService extends ToastService {
    // API operation notifications
    static requestSuccess(endpoint: string): string | number {
        return this.success(`API request to ${endpoint} succeeded`);
    }

    static requestFailed(endpoint: string, error?: string): string | number {
        return this.error(`API request to ${endpoint} failed${error ? `: ${error}` : ''}`);
    }

    static validationError(field: string): string | number {
        return this.validationError(field);
    }

    static processingRequest(endpoint: string): string | number {
        return this.processing(`API request to ${endpoint}`);
    }

    static processedRequest(endpoint: string): string | number {
        return this.processed(`API request to ${endpoint}`);
    }

    static permissionDenied(action: string): string | number {
        return this.error(`You don't have permission to ${action}`);
    }
}
