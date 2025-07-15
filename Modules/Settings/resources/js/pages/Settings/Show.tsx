interface Props {
    setting: any;
    groups?: string[];
    types?: string[];
    created_at?: string;
    updated_at?: string;
    deleted_at?: string;
}

export default function Show({ setting, groups = [], types = [], created_at, updated_at, deleted_at }: Props) {
    // ... existing code ...
    // Render all fields and relationships with fallbacks
    // ... existing code ...
}
