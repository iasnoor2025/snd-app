export interface Equipment {
    [x: string]: any;
    id: number;
    name: string;
    description?: string;
    category_id?: number;
    manufacturer?: string;
    model_number?: string;
    serial_number?: string;
    purchase_date?: string;
    purchase_price?: number;
    warranty_expiry_date?: string;
    status: 'available' | 'rented' | 'maintenance' | 'out_of_service' | 'retired';
    location_id?: number;
    assigned_to?: number;
    last_maintenance_date?: string;
    next_maintenance_date?: string;
    notes?: string;
    unit?: string;
    default_unit_cost?: number;
    is_active: boolean;
    daily_rate?: number;
    weekly_rate?: number;
    monthly_rate?: number;
    door_number?: string;
    current_operating_hours?: number;
    current_mileage?: number;
    current_cycle_count?: number;
    initial_operating_hours?: number;
    initial_mileage?: number;
    initial_cycle_count?: number;
    last_metric_update?: string;
    avg_daily_usage_hours?: number;
    avg_daily_usage_miles?: number;
    avg_operating_cost_per_hour?: number;
    avg_operating_cost_per_mile?: number;
    fuel_type?: string;
    engine_hours?: number;
    last_service_date?: string;
    next_service_due?: string;
    insurance_expiry?: string;
    registration_number?: string;
    vin_number?: string;
    weight?: number;
    dimensions?: string;
    max_load_capacity?: number;
    fuel_capacity?: number;
    hydraulic_capacity?: number;
    operating_weight?: number;
    transport_weight?: number;
    bucket_capacity?: number;
    boom_reach?: number;
    dig_depth?: number;
    lift_capacity?: number;
    travel_speed?: number;
    swing_speed?: number;
    hydraulic_flow?: number;
    hydraulic_pressure?: number;
    engine_power?: number;
    fuel_consumption?: number;
    noise_level?: number;
    emission_standard?: string;
    tire_size?: string;
    track_width?: number;
    ground_clearance?: number;
    turning_radius?: number;
    gradeability?: number;
    operating_temperature_range?: string;
    storage_temperature_range?: string;
    humidity_range?: string;
    altitude_limit?: number;
    vibration_resistance?: string;
    shock_resistance?: string;
    dust_protection?: string;
    water_protection?: string;
    certification?: string;
    compliance_standards?: string;
    safety_features?: string;
    maintenance_schedule?: string;
    spare_parts_availability?: string;
    warranty_terms?: string;
    training_requirements?: string;
    operator_manual?: string;
    service_manual?: string;
    parts_catalog?: string;
    technical_drawings?: string;
    safety_data_sheet?: string;
    environmental_impact?: string;
    recycling_information?: string;
    disposal_instructions?: string;
    upgrade_options?: string;
    accessory_compatibility?: string;
    software_version?: string;
    firmware_version?: string;
    calibration_date?: string;
    calibration_due?: string;
    inspection_date?: string;
    inspection_due?: string;
    certification_date?: string;
    certification_expiry?: string;
    quality_rating?: number;
    performance_rating?: number;
    reliability_rating?: number;
    efficiency_rating?: number;
    cost_effectiveness?: number;
    user_satisfaction?: number;
    maintenance_cost?: number;
    operating_cost?: number;
    total_cost_ownership?: number;
    depreciation_rate?: number;
    resale_value?: number;
    insurance_cost?: number;
    financing_options?: string;
    lease_terms?: string;
    rental_terms?: string;
    availability_schedule?: string;
    booking_calendar?: string;
    usage_restrictions?: string;
    geographic_restrictions?: string;
    seasonal_availability?: string;
    peak_demand_periods?: string;
    off_peak_discounts?: string;
    bulk_rental_discounts?: string;
    loyalty_program_benefits?: string;
    referral_bonuses?: string;
    early_booking_discounts?: string;
    last_minute_deals?: string;
    package_deals?: string;
    cross_selling_opportunities?: string;
    upselling_opportunities?: string;
    customer_feedback?: string;
    improvement_suggestions?: string;
    feature_requests?: string;
    bug_reports?: string;
    support_tickets?: string;
    training_materials?: string;
    video_tutorials?: string;
    online_courses?: string;
    certification_programs?: string;
    competency_assessments?: string;
    skill_development?: string;
    career_advancement?: string;
    professional_development?: string;
    industry_recognition?: string;
    awards_achievements?: string;
    media_coverage?: string;
    case_studies?: string;
    success_stories?: string;
    testimonials?: string;
    references?: string;
    portfolio?: string;
    gallery?: string;
    videos?: string;
    brochures?: string;
    datasheets?: string;
    specifications?: string;
    comparisons?: string;
    reviews?: string;
    ratings?: string;
    recommendations?: string;
    alternatives?: string;
    competitors?: string;
    market_analysis?: string;
    trend_analysis?: string;
    forecast?: string;
    roadmap?: string;
    timeline?: string;
    milestones?: string;
    deliverables?: string;
    requirements?: string;
    constraints?: string;
    assumptions?: string;
    risks?: string;
    mitigation?: string;
    contingency?: string;
    escalation?: string;
    communication?: string;
    reporting?: string;
    monitoring?: string;
    evaluation?: string;
    optimization?: string;
    continuous_improvement?: string;
    best_practices?: string;
    lessons_learned?: string;
    knowledge_transfer?: string;
    documentation?: string;
    archival?: string;
    retention?: string;
    disposal?: string;
    audit_trail?: string;
    compliance_tracking?: string;
    regulatory_updates?: string;
    policy_changes?: string;
    procedure_updates?: string;
    system_updates?: string;
    security_patches?: string;
    vulnerability_assessments?: string;
    penetration_testing?: string;
    security_audits?: string;
    privacy_assessments?: string;
    data_protection?: string;
    backup_recovery?: string;
    disaster_recovery?: string;
    business_continuity?: string;
    emergency_procedures?: string;
    incident_response?: string;
    crisis_management?: string;
    stakeholder_communication?: string;
    public_relations?: string;
    brand_management?: string;
    reputation_management?: string;
    social_media?: string;
    digital_marketing?: string;
    content_marketing?: string;
    seo_optimization?: string;
    analytics_tracking?: string;
    performance_metrics?: string;
    kpi_monitoring?: string;
    dashboard_reporting?: string;
    executive_summaries?: string;
    board_presentations?: string;
    investor_relations?: string;
    financial_reporting?: string;
    budget_planning?: string;
    cost_management?: string;
    revenue_optimization?: string;
    profit_maximization?: string;
    roi_analysis?: string;
    payback_period?: string;
    break_even_analysis?: string;
    sensitivity_analysis?: string;
    scenario_planning?: string;
    stress_testing?: string;
    monte_carlo_simulation?: string;
    predictive_modeling?: string;
    machine_learning?: string;
    artificial_intelligence?: string;
    automation?: string;
    robotics?: string;
    iot_integration?: string;
    cloud_computing?: string;
    edge_computing?: string;
    blockchain?: string;
    cryptocurrency?: string;
    digital_transformation?: string;
    innovation?: string;
    research_development?: string;
    intellectual_property?: string;
    patents?: string;
    trademarks?: string;
    copyrights?: string;
    trade_secrets?: string;
    licensing?: string;
    partnerships?: string;
    joint_ventures?: string;
    mergers_acquisitions?: string;
    strategic_alliances?: string;
    supplier_relationships?: string;
    vendor_management?: string;
    procurement?: string;
    sourcing?: string;
    negotiations?: string;
    contracts?: string;
    legal_compliance?: string;
    regulatory_compliance?: string;
    environmental_compliance?: string;
    health_safety?: string;
    quality_assurance?: string;
    quality_control?: string;
    testing?: string;
    validation?: string;
    verification?: string;
    certification?: string;
    accreditation?: string;
    standardization?: string;
    benchmarking?: string;
    industry_standards?: string;
    global_standards?: string;
    local_regulations?: string;
    international_regulations?: string;
    cross_border_compliance?: string;
    multi_jurisdictional?: string;
    cultural_considerations?: string;
    language_localization?: string;
    currency_conversion?: string;
    time_zone_management?: string;
    global_operations?: string;
    regional_variations?: string;
    local_customization?: string;
    market_adaptation?: string;
    competitive_positioning?: string;
    value_proposition?: string;
    unique_selling_points?: string;
    differentiation?: string;
    brand_positioning?: string;
    target_market?: string;
    customer_segmentation?: string;
    persona_development?: string;
    journey_mapping?: string;
    touchpoint_optimization?: string;
    experience_design?: string;
    service_design?: string;
    process_improvement?: string;
    workflow_optimization?: string;
    efficiency_gains?: string;
    productivity_enhancement?: string;
    performance_improvement?: string;
    capability_building?: string;
    skill_enhancement?: string;
    knowledge_management?: string;
    information_sharing?: string;
    collaboration?: string;
    teamwork?: string;
    leadership?: string;
    management?: string;
    governance?: string;
    oversight?: string;
    accountability?: string;
    transparency?: string;
    ethics?: string;
    integrity?: string;
    trust?: string;
    reliability?: string;
    dependability?: string;
    consistency?: string;
    predictability?: string;
    stability?: string;
    resilience?: string;
    adaptability?: string;
    flexibility?: string;
    agility?: string;
    responsiveness?: string;
    scalability?: string;
    extensibility?: string;
    modularity?: string;
    interoperability?: string;
    compatibility?: string;
    integration?: string;
    synchronization?: string;
    coordination?: string;
    alignment?: string;
    harmony?: string;
    balance?: string;
    optimization?: string;
    maximization?: string;
    minimization?: string;
    efficiency?: string;
    effectiveness?: string;
    productivity?: string;
    performance?: string;
    quality?: string;
    excellence?: string;
    superiority?: string;
    leadership?: string;
    innovation?: string;
    creativity?: string;
    originality?: string;
    uniqueness?: string;
    distinctiveness?: string;
    specialization?: string;
    expertise?: string;
    mastery?: string;
    proficiency?: string;
    competence?: string;
    capability?: string;
    capacity?: string;
    potential?: string;
    opportunity?: string;
    possibility?: string;
    probability?: string;
    likelihood?: string;
    certainty?: string;
    confidence?: string;
    assurance?: string;
    guarantee?: string;
    warranty?: string;
    protection?: string;
    security?: string;
    safety?: string;
    reliability?: string;
    durability?: string;
    longevity?: string;
    sustainability?: string;
    viability?: string;
    feasibility?: string;
    practicality?: string;
    usability?: string;
    accessibility?: string;
    availability?: string;
    affordability?: string;
    cost_effectiveness?: string;
    value_for_money?: string;
    return_on_investment?: string;
    lifetime_maintenance_cost?: number;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
    category?: EquipmentCategory;
    location?: Location;
    assignedUser?: User;
}

export interface EquipmentCategory {
    id: number;
    name: string;
    description?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface MaintenanceRecord {
    id: number;
    equipment_id: number;
    maintenance_type: 'preventive' | 'corrective' | 'emergency' | 'inspection';
    description: string;
    performed_by?: string;
    performed_at: string;
    cost?: number;
    notes?: string;
    next_maintenance_date?: string;
    created_at: string;
    updated_at: string;
    equipment?: Equipment;
}

export interface MaintenanceSchedule {
    id: number;
    equipment_id: number;
    maintenance_type: string;
    frequency_type: 'hours' | 'days' | 'miles' | 'cycles';
    frequency_value: number;
    description?: string;
    is_active: boolean;
    last_performed?: string;
    next_due?: string;
    created_at: string;
    updated_at: string;
    equipment?: Equipment;
}

export interface EquipmentMetric {
    id: number;
    equipment_id: number;
    metric_type: 'operating_hours' | 'mileage' | 'cycles' | 'fuel_consumption';
    value: number;
    recorded_at: string;
    recorded_by?: number;
    notes?: string;
    created_at: string;
    updated_at: string;
    equipment?: Equipment;
}

export interface EquipmentCostRecord {
    id: number;
    equipment_id: number;
    cost_type: 'maintenance' | 'fuel' | 'insurance' | 'depreciation' | 'other';
    amount: number;
    description?: string;
    incurred_at: string;
    created_at: string;
    updated_at: string;
    equipment?: Equipment;
}

export interface EquipmentUtilizationLog {
    id: number;
    equipment_id: number;
    start_time: string;
    end_time?: string;
    operator_id?: number;
    project_id?: number;
    location?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
    equipment?: Equipment;
}

export interface EquipmentDepreciation {
    id: number;
    equipment_id: number;
    depreciation_method: 'straight_line' | 'declining_balance' | 'units_of_production';
    useful_life_years?: number;
    useful_life_hours?: number;
    salvage_value?: number;
    annual_depreciation?: number;
    accumulated_depreciation?: number;
    current_book_value?: number;
    created_at: string;
    updated_at: string;
    equipment?: Equipment;
}

export interface EquipmentValuationRecord {
    id: number;
    equipment_id: number;
    valuation_date: string;
    market_value?: number;
    replacement_value?: number;
    book_value?: number;
    appraised_by?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
    equipment?: Equipment;
}

export interface EquipmentTracking {
    id: number;
    equipment_id: number;
    latitude?: number;
    longitude?: number;
    altitude?: number;
    speed?: number;
    heading?: number;
    accuracy?: number;
    tracked_at: string;
    created_at: string;
    updated_at: string;
    equipment?: Equipment;
}

export interface EquipmentAnalytics {
    id: number;
    equipment_id: number;
    metric_name: string;
    metric_value: number;
    metric_unit?: string;
    period_start: string;
    period_end: string;
    created_at: string;
    updated_at: string;
    equipment?: Equipment;
}

export interface EquipmentLocation {
    id: number;
    equipment_id: number;
    location_name: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    moved_at: string;
    moved_by?: number;
    notes?: string;
    created_at: string;
    updated_at: string;
    equipment?: Equipment;
}

export interface EquipmentMovementHistory {
    id: number;
    equipment_id: number;
    from_location?: string;
    to_location: string;
    moved_at: string;
    moved_by?: number;
    reason?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
    equipment?: Equipment;
}

export interface EquipmentStatusAlert {
    id: number;
    equipment_id: number;
    alert_type: 'maintenance_due' | 'low_fuel' | 'error' | 'warning' | 'info';
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    is_acknowledged: boolean;
    acknowledged_by?: number;
    acknowledged_at?: string;
    created_at: string;
    updated_at: string;
    equipment?: Equipment;
}

export interface EquipmentGeofenceLog {
    id: number;
    equipment_id: number;
    geofence_name: string;
    event_type: 'enter' | 'exit';
    latitude: number;
    longitude: number;
    occurred_at: string;
    created_at: string;
    updated_at: string;
    equipment?: Equipment;
}

export interface EquipmentUtilizationAnalytics {
    id: number;
    equipment_id: number;
    period_start: string;
    period_end: string;
    total_hours_used: number;
    total_distance_traveled?: number;
    total_cycles_completed?: number;
    utilization_percentage: number;
    efficiency_score?: number;
    created_at: string;
    updated_at: string;
    equipment?: Equipment;
}

export interface EquipmentResource {
    id: number;
    equipment_id: number;
    resource_type: 'manual' | 'image' | 'video' | 'document' | 'certificate';
    title: string;
    description?: string;
    file_path?: string;
    file_size?: number;
    mime_type?: string;
    is_public: boolean;
    created_at: string;
    updated_at: string;
    equipment?: Equipment;
}

// Common interfaces
export interface Location {
    id: number;
    name: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
    latitude?: number;
    longitude?: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    created_at: string;
    updated_at: string;
}

// Pagination interface
export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    per_page: number;
    last_page: number;
    total: number;
    from: number;
    to: number;
    links: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
}

// Form data interfaces
export interface EquipmentFormData {
    name: string;
    description?: string;
    category_id?: number;
    manufacturer?: string;
    model_number?: string;
    serial_number?: string;
    purchase_date?: string;
    purchase_price?: number;
    warranty_expiry_date?: string;
    status: string;
    location_id?: number;
    assigned_to?: number;
    last_maintenance_date?: string;
    next_maintenance_date?: string;
    notes?: string;
    unit?: string;
    default_unit_cost?: number;
    is_active: boolean;
    daily_rate?: number;
    weekly_rate?: number;
    monthly_rate?: number;
    door_number?: string;
}

export interface MaintenanceFormData {
    equipment_id: number;
    maintenance_type: string;
    description: string;
    performed_by?: string;
    performed_at: string;
    cost?: number;
    notes?: string;
    next_maintenance_date?: string;
}

// Filter interfaces
export interface EquipmentFilters {
    search?: string;
    category?: string;
    status?: string;
    location?: string;
    manufacturer?: string;
    assigned_to?: string;
    maintenance_due?: boolean;
}

export interface MaintenanceFilters {
    search?: string;
    equipment_id?: number;
    maintenance_type?: string;
    date_from?: string;
    date_to?: string;
    performed_by?: string;
}
