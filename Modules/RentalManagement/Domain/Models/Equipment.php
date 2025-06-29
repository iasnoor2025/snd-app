use Illuminate\Database\Eloquent\Relations\HasMany;

public function dynamicPricingRules(): HasMany
{
    return $this->hasMany(DynamicPricing::class);
} 