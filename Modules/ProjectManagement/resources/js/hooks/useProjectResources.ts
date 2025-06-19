import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

interface UseProjectResourcesProps {
    projectId: number;
}

interface UseProjectResourcesReturn {
    resources: any[];
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useProjectResources({
    projectId
}: UseProjectResourcesProps): UseProjectResourcesReturn {
    const [resources, setResources] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchResources = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await axios.get(`/api/projects/${projectId}/resources`);
            setResources(response.data);
        } catch (err) {
            setError('Failed to fetch project resources');
            console.error('Error fetching project resources:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (projectId) {
            fetchResources();
        }
    }, [projectId]);

    const refetch = () => {
  const { t } = useTranslation('project');

        fetchResources();
    };

    return {
        resources,
        isLoading,
        error,
        refetch,
    };
}

