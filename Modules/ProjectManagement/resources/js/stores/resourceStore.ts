import { useTranslation } from 'react-i18next';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  ProjectResource,
  ResourceType,
  ResourceStatus,
  ResourceFilter,
  ResourcePagination,
} from '../types/projectResources';

interface ResourceState {
  resources: ProjectResource[];
  loading: boolean;
  error: string | null;
  filters: ResourceFilter;
  pagination: ResourcePagination;
  selectedResource: ProjectResource | null;
}

interface ResourceActions {
  setResources: (resources: ProjectResource[]) => void;
  addResource: (resource: ProjectResource) => void;
  updateResource: (id: number, resource: Partial<ProjectResource>) => void;
  deleteResource: (id: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<ResourceFilter>) => void;
  setPagination: (pagination: ResourcePagination) => void;
  setSelectedResource: (resource: ProjectResource | null) => void;
  clearFilters: () => void;
  reset: () => void;
}

type ResourceStore = ResourceState & ResourceActions;

const initialState: ResourceState = {
  resources: [],
  loading: false,
  error: null,
  filters: {},
  pagination: {
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
  },
  selectedResource: null,
};

export const useResourceStore = create<ResourceStore>()()
  devtools(
    (set, get) => ({
      ...initialState,

      setResources: (resources) =>
        set({ resources }, false, 'setResources'),

      addResource: (resource) =>
        set(
          (state) => ({ resources: [...state.resources, resource] }),
          false,
          'addResource'
        ),

      updateResource: (id, updatedResource) =>
        set(
          (state) => ({
            resources: state.resources.map((resource) =>
              resource.id === id ? { ...resource, ...updatedResource } : resource
            ),
          }),
          false,
          'updateResource'
        ),

      deleteResource: (id) =>
        set(
          (state) => ({
            resources: state.resources.filter((resource) => resource.id !== id),
          }),
          false,
          'deleteResource'
        ),

      setLoading: (loading) => set({ loading }, false, 'setLoading'),

      setError: (error) => set({ error }, false, 'setError'),

      setFilters: (newFilters) =>
        set(
          (state) => ({ filters: { ...state.filters, ...newFilters } }),
          false,
          'setFilters'
        ),

      setPagination: (pagination) =>
        set({ pagination }, false, 'setPagination'),

      setSelectedResource: (selectedResource) =>
        set({ selectedResource }, false, 'setSelectedResource'),

      clearFilters: () => set({ filters: {} }, false, 'clearFilters'),

      reset: () => set(initialState, false, 'reset'),
    }),
    {
      name: 'resource-store',
    }
  );

