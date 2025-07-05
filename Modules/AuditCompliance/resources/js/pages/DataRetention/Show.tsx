interface Props {
  policy: any;
  executionLogs?: any[];
  affectedRecords?: number;
  dataTypes?: any;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export default function Show({ policy, executionLogs = [], affectedRecords = 0, dataTypes = {}, created_at, updated_at, deleted_at }: Props) {
  // ... existing code ...
  // Render all fields and relationships with fallbacks
  // ... existing code ...
}
