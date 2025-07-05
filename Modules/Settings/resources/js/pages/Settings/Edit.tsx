interface Props {
  setting: any;
  groups?: string[];
  types?: string[];
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export default function Edit({ setting, groups = [], types = [], created_at, updated_at, deleted_at }: Props) {
  // ... existing code ...
  // Pre-populate all fields, render dropdowns for groups/types, and show all timestamps if needed
  // ... existing code ...
}
