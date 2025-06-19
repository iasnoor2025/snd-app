import React, { useCallback, useState, useEffect, memo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ReactDOM from 'react-dom';
import TaskForm from './TaskForm';
import { ProjectTask } from './TaskList';
import { XIcon } from 'lucide-react';

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
  initialData: ProjectTask | null;
  assignableUsers?: Array<{ id: number; name: string }>
  onSuccess: () => void;
}

// Creates a portal outside of React's normal rendering flow with safety checks
function Portal({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation('project');

  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create container only once on mount
    if (!containerRef.current) {
      containerRef.current = document.createElement('div');
    }

    const container = containerRef.current;
    setMounted(true);
    document.body.appendChild(container);

    return () => {
      // Safe cleanup
      if (container && document.body.contains(container)) {
        document.body.removeChild(container);
      }
    };
  }, []);

  // Don't render until mounted
  return mounted && containerRef.current ? ReactDOM.createPortal(children, containerRef.current) : null;
}

// Custom implementation to avoid using Dialog component that might be causing the issues
const TaskDialog = memo(function TaskDialog({
  open,
  onOpenChange,
  projectId,
  initialData = null,
  assignableUsers = [],
  onSuccess
}: TaskDialogProps) {
  // Ref to track mounted state
  const isMounted = useRef(true);
  const [isRendered, setIsRendered] = useState(false);

  // Track mounted state for safe updates
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Manage rendering with small delays to avoid race conditions
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    if (open) {
      timeoutId = setTimeout(() => {
        if (isMounted.current) {
          setIsRendered(true);
        }
      }, 10);
    } else {
      timeoutId = setTimeout(() => {
        if (isMounted.current) {
          setIsRendered(false);
        }
      }, 300);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [open]);

  // Only render when open and after a safe delay
  if (!open && !isRendered) return null;

  // Create stable callbacks
  const handleClose = useCallback(() => {
    if (isMounted.current) {
      onOpenChange(false);
    }
  }, [onOpenChange]);

  const handleSuccess = useCallback(() => {
    if (isMounted.current) {
      onSuccess();
    }
  }, [onSuccess]);

  // Create a stable key for the form
  const formKey = initialData ? `task-form-${initialData.id}` : 'task-form-new';

  return (
    <Portal>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
        onClick={handleClose}
      >
        {/* Dialog */}
        <div
          className="bg-white max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-lg p-6 shadow-lg relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            onClick={handleClose}
          >
            <XIcon size={20} />
            <span className="sr-only">Close</span>
          </button>
          {/* Header */}
          <div className="mb-4">
            <h2 className="text-lg font-semibold">
              {initialData ? 'Edit Task' : 'Add Task'}
            </h2>
            <p className="text-sm text-gray-500">
              {initialData
                ? 'Update the details for this task.'
                : 'Add a new task to this project.'}
            </p>
          </div>
          {/* Form */}
          <div className="py-2">
            <TaskForm
              key={formKey}
              projectId={projectId}
              initialData={initialData}
              assignableUsers={assignableUsers}
              onSuccess={handleSuccess}
              {...({} as any)}
            />
          </div>
        </div>
      </div>
    </Portal>
  );
})

export default TaskDialog;














