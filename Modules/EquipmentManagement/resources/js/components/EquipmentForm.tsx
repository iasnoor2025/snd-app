import { EquipmentLocationMap } from './EquipmentLocationMap';

<>
    <Input
        label="Latitude"
        type="number"
        step="0.0000001"
        value={form.latitude || ''}
        onChange={(e) => setForm({ ...form, latitude: parseFloat(e.target.value) })}
        placeholder="Latitude"
    />
    <Input
        label="Longitude"
        type="number"
        step="0.0000001"
        value={form.longitude || ''}
        onChange={(e) => setForm({ ...form, longitude: parseFloat(e.target.value) })}
        placeholder="Longitude"
    />
    <EquipmentLocationMap
        latitude={form.latitude || 0}
        longitude={form.longitude || 0}
        onChange={(lat, lng) => setForm({ ...form, latitude: lat, longitude: lng })}
    />
</>;
