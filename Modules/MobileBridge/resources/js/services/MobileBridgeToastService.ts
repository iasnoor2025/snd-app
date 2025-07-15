import { ToastService } from '@/Core';

export class MobileBridgeToastService extends ToastService {
    // Device operations
    static deviceRegistered(deviceId: string): string | number {
        return this.success(`Device ${deviceId} registered successfully`);
    }

    static deviceUnregistered(deviceId: string): string | number {
        return this.success(`Device ${deviceId} unregistered successfully`);
    }

    static deviceBlocked(deviceId: string, reason: string): string | number {
        return this.warning(`Device ${deviceId} blocked: ${reason}`);
    }

    static deviceUnblocked(deviceId: string): string | number {
        return this.success(`Device ${deviceId} unblocked`);
    }

    // Authentication operations
    static deviceAuthenticated(deviceId: string): string | number {
        return this.success(`Device ${deviceId} authenticated successfully`);
    }

    static authenticationFailed(deviceId: string, error?: string): string | number {
        return this.error(`Authentication failed for device ${deviceId}${error ? `: ${error}` : ''}`);
    }

    static sessionExpired(deviceId: string): string | number {
        return this.warning(`Session expired for device ${deviceId}`);
    }

    static sessionRenewed(deviceId: string): string | number {
        return this.success(`Session renewed for device ${deviceId}`);
    }

    // Sync operations
    static syncStarted(module: string): string | number {
        return this.loading(`Syncing ${module} data...`);
    }

    static syncCompleted(module: string): string | number {
        return this.success(`${module} data synced successfully`);
    }

    static syncFailed(module: string, error?: string): string | number {
        return this.error(`Failed to sync ${module} data${error ? `: ${error}` : ''}`);
    }

    static syncConflict(module: string, details: string): string | number {
        return this.warning(`Sync conflict in ${module}: ${details}`);
    }

    // Push notification operations
    static notificationSent(deviceId: string, type: string): string | number {
        return this.success(`${type} notification sent to device ${deviceId}`);
    }

    static notificationDelivered(deviceId: string, type: string): string | number {
        return this.success(`${type} notification delivered to device ${deviceId}`);
    }

    static notificationFailed(deviceId: string, type: string, error?: string): string | number {
        return this.error(`Failed to send ${type} notification to device ${deviceId}${error ? `: ${error}` : ''}`);
    }

    // Offline operations
    static offlineModeEnabled(deviceId: string): string | number {
        return this.warning(`Offline mode enabled for device ${deviceId}`);
    }

    static offlineModeDisabled(deviceId: string): string | number {
        return this.success(`Offline mode disabled for device ${deviceId}`);
    }

    static offlineDataSaved(type: string): string | number {
        return this.success(`${type} data saved for offline use`);
    }

    static offlineDataCleared(type: string): string | number {
        return this.success(`${type} offline data cleared`);
    }

    // Update operations
    static updateAvailable(version: string): string | number {
        return this.info(`New version ${version} available`);
    }

    static updateStarted(version: string): string | number {
        return this.loading(`Updating to version ${version}...`);
    }

    static updateCompleted(version: string): string | number {
        return this.success(`Updated to version ${version} successfully`);
    }

    static updateFailed(version: string, error?: string): string | number {
        return this.error(`Failed to update to version ${version}${error ? `: ${error}` : ''}`);
    }

    // Cache operations
    static cacheCleared(type: string): string | number {
        return this.success(`${type} cache cleared successfully`);
    }

    static cacheSynced(type: string): string | number {
        return this.success(`${type} cache synced with server`);
    }

    static cacheError(type: string, error?: string): string | number {
        return this.error(`Cache error for ${type}${error ? `: ${error}` : ''}`);
    }

    // Location operations
    static locationUpdated(deviceId: string): string | number {
        return this.success(`Location updated for device ${deviceId}`);
    }

    static locationError(deviceId: string, error?: string): string | number {
        return this.error(`Location error for device ${deviceId}${error ? `: ${error}` : ''}`);
    }

    static geofenceEntered(deviceId: string, zone: string): string | number {
        return this.info(`Device ${deviceId} entered ${zone} zone`);
    }

    static geofenceExited(deviceId: string, zone: string): string | number {
        return this.info(`Device ${deviceId} exited ${zone} zone`);
    }

    // Validation errors
    static mobileValidationError(field: string): string | number {
        return this.validationError(field);
    }

    // Process notifications
    static processingMobile(action: string): string | number {
        return this.processing(`mobile ${action}`);
    }

    static mobileProcessed(action: string): string | number {
        return this.processed(`mobile ${action}`);
    }

    static mobileProcessFailed(action: string, error?: string): string | number {
        return this.operationFailed(`${action} mobile operation`, error);
    }

    // Bulk operations
    static bulkOperationStarted(operation: string, count: number): string | number {
        return this.loading(`Processing ${operation} for ${count} devices...`);
    }

    static bulkOperationCompleted(operation: string, count: number): string | number {
        return this.success(`Successfully ${operation} ${count} devices`);
    }

    static bulkOperationFailed(operation: string, error?: string): string | number {
        return this.error(`Bulk ${operation} failed${error ? `: ${error}` : ''}`);
    }

    // Permission errors
    static permissionDenied(action: string): string | number {
        return this.error(`You don't have permission to ${action}`);
    }
}
