/**
 * Mobile Equipment Browser Component
 * Touch-optimized equipment browsing and search interface
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  DollarSign,
  Package,
  Truck,
  Star,
  Heart,
  Share,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  Wrench,
  Camera,
  Grid,
  List,
  SlidersHorizontal
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePWA } from '@/hooks/usePWA';

interface Equipment {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  availability: 'available' | 'rented' | 'maintenance' | 'reserved';
  location: string;
  images: string[];
  specifications: Record<string, any>;
  rating: number;
  reviewCount: number;
  isFavorite?: boolean;
  lastMaintenance?: string;
  nextMaintenance?: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
}

interface MobileEquipmentBrowserProps {
  className?: string;
  equipment?: Equipment[];
  categories?: Array<{
    id: string;
    name: string;
    count: number;
    subcategories?: Array<{ id: string; name: string; count: number }>;
  }>;
  onEquipmentSelect?: (equipment: Equipment) => void;
  onFavoriteToggle?: (equipmentId: string) => void;
}

const MobileEquipmentBrowser: React.FC<MobileEquipmentBrowserProps> = ({
  className = '',
  equipment = [],
  categories = [],
  onEquipmentSelect,
  onFavoriteToggle
}) => {
  const isMobile = useIsMobile();
  const { isOnline } = usePWA();
  const { t } = useTranslation(['common', 'equipment']);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [availabilityFilter, setAvailabilityFilter] = useState<string[]>(['available']);
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>(equipment);
  const [isLoading, setIsLoading] = useState(false);

  // Filter equipment based on search and filters
  const filterEquipment = useCallback(() => {
    let filtered = equipment;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Subcategory filter
    if (selectedSubcategory) {
      filtered = filtered.filter(item => item.subcategory === selectedSubcategory);
    }

    // Availability filter
    if (availabilityFilter.length > 0) {
      filtered = filtered.filter(item => availabilityFilter.includes(item.availability));
    }

    // Price range filter
    filtered = filtered.filter(item =>
      item.dailyRate >= priceRange[0] && item.dailyRate <= priceRange[1]
    );

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-low':
          return a.dailyRate - b.dailyRate;
        case 'price-high':
          return b.dailyRate - a.dailyRate;
        case 'rating':
          return b.rating - a.rating;
        case 'availability':
          return a.availability.localeCompare(b.availability);
        default:
          return 0;
      }
    });

    setFilteredEquipment(filtered);
  }, [equipment, searchQuery, selectedCategory, selectedSubcategory, priceRange, availabilityFilter, sortBy]);

  useEffect(() => {
    filterEquipment();
  }, [filterEquipment]);

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-500';
      case 'rented': return 'bg-red-500';
      case 'maintenance': return 'bg-orange-500';
      case 'reserved': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case 'available': return t('equipment:available', 'Available');
      case 'rented': return t('equipment:rented', 'Rented');
      case 'maintenance': return t('equipment:maintenance', 'Maintenance');
      case 'reserved': return t('equipment:reserved', 'Reserved');
      default: return t('equipment:unknown', 'Unknown');
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const handleFavoriteToggle = (equipmentId: string) => {
    if (onFavoriteToggle) {
      onFavoriteToggle(equipmentId);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedSubcategory('');
    setPriceRange([0, 1000]);
    setAvailabilityFilter(['available']);
    setSortBy('name');
  };

  const renderEquipmentCard = (item: Equipment) => (
    <Card key={item.id} className="overflow-hidden">
      <div className="relative">
        {/* Equipment Image */}
        <div className="aspect-video bg-muted relative overflow-hidden">
          {item.images.length > 0 ? (
            <img
              src={item.images[0]}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
          )}

          {/* Availability Badge */}
          <Badge
            className={`absolute top-2 left-2 ${getAvailabilityColor(item.availability)} text-white`}
          >
            {getAvailabilityText(item.availability)}
          </Badge>

          {/* Favorite Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 bg-white/80 hover:bg-white"
            onClick={() => handleFavoriteToggle(item.id)}
          >
            <Heart
              className={`h-4 w-4 ${item.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
            />
          </Button>
        </div>

        <CardContent className="p-4">
          <div className="space-y-2">
            {/* Title and Rating */}
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-sm leading-tight">{item.name}</h3>
              <div className="flex items-center space-x-1 ml-2">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-muted-foreground">
                  {item.rating.toFixed(1)} ({item.reviewCount})
                </span>
              </div>
            </div>

            {/* Category and Condition */}
            <div className="flex items-center justify-between text-xs">
              <Badge variant="outline">{item.category}</Badge>
              <span className={`font-medium ${getConditionColor(item.condition)}`}>
                {t(`equipment:condition_${item.condition}`, item.condition)}
              </span>
            </div>

            {/* Location */}
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{item.location}</span>
            </div>

            {/* Pricing */}
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <span className="font-bold">${item.dailyRate}</span>
                <span className="text-muted-foreground">/{t('equipment:day', 'day')}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                ${item.weeklyRate}/{t('equipment:week', 'week')}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 pt-2">
              <Button
                size="sm"
                className="flex-1"
                onClick={() => onEquipmentSelect?.(item)}
                disabled={item.availability !== 'available'}
              >
                {item.availability === 'available' ? t('equipment:book_now', 'Book Now') : t('equipment:view_details', 'View Details')}
              </Button>
              <Button variant="outline" size="sm">
                <Info className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );

  const renderEquipmentList = (item: Equipment) => (
    <Card key={item.id} className="mb-3">
      <CardContent className="p-4">
        <div className="flex space-x-3">
          {/* Equipment Image */}
          <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
            {item.images.length > 0 ? (
              <img
                src={item.images[0]}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Equipment Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                <p className="text-xs text-muted-foreground truncate">{item.description}</p>

                <div className="flex items-center space-x-2 mt-1">
                  <Badge
                    variant="outline"
                    className={`text-xs ${getAvailabilityColor(item.availability)} text-white`}
                  >
                    {getAvailabilityText(item.availability)}
                  </Badge>
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs">{item.rating.toFixed(1)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="text-sm">
                    <span className="font-bold">${item.dailyRate}</span>
                    <span className="text-muted-foreground">/{t('equipment:day', 'day')}</span>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFavoriteToggle(item.id)}
                    >
                      <Heart
                        className={`h-4 w-4 ${item.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                      />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onEquipmentSelect?.(item)}
                      disabled={item.availability !== 'available'}
                    >
                      {item.availability === 'available' ? t('equipment:book', 'Book') : t('equipment:view', 'View')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={`mobile-equipment-browser ${className}`}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="p-4 space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('equipment:search_placeholder', 'Search equipment...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4"
            />
          </div>

          {/* Filter and View Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sheet open={showFilters} onOpenChange={setShowFilters}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    {t('equipment:filters', 'Filters')}
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[80vh]">
                  <SheetHeader>
                    <SheetTitle>{t('equipment:filter_equipment', 'Filter Equipment')}</SheetTitle>
                  </SheetHeader>
                  <div className="py-4 space-y-6">
                    {/* Category Filter */}
                    <div>
                      <label className="text-sm font-medium">{t('equipment:category', 'Category')}</label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder={t('equipment:all_categories', 'All categories')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">{t('equipment:all_categories', 'All categories')}</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name} ({category.count})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Availability Filter */}
                    <div>
                      <label className="text-sm font-medium">{t('equipment:availability', 'Availability')}</label>
                      <div className="mt-2 space-y-2">
                        {['available', 'rented', 'maintenance', 'reserved'].map((status) => (
                          <div key={status} className="flex items-center space-x-2">
                            <Checkbox
                              id={status}
                              checked={availabilityFilter.includes(status)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setAvailabilityFilter([...availabilityFilter, status]);
                                } else {
                                  setAvailabilityFilter(availabilityFilter.filter(s => s !== status));
                                }
                              }}
                            />
                            <label htmlFor={status} className="text-sm capitalize">
                              {getAvailabilityText(status)}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sort By */}
                    <div>
                      <label className="text-sm font-medium">{t('equipment:sort_by', 'Sort By')}</label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="name">{t('equipment:sort_name', 'Name')}</SelectItem>
                          <SelectItem value="price-low">{t('equipment:sort_price_low', 'Price: Low to High')}</SelectItem>
                          <SelectItem value="price-high">{t('equipment:sort_price_high', 'Price: High to Low')}</SelectItem>
                          <SelectItem value="rating">{t('equipment:sort_rating', 'Rating')}</SelectItem>
                          <SelectItem value="availability">{t('equipment:sort_availability', 'Availability')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" onClick={clearFilters} className="flex-1">
                        {t('equipment:clear_all', 'Clear All')}
                      </Button>
                      <Button onClick={() => setShowFilters(false)} className="flex-1">
                        {t('equipment:apply_filters', 'Apply Filters')}
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">{t('equipment:sort_name', 'Name')}</SelectItem>
                  <SelectItem value="price-low">{t('equipment:sort_price_asc', 'Price ↑')}</SelectItem>
                  <SelectItem value="price-high">{t('equipment:sort_price_desc', 'Price ↓')}</SelectItem>
                  <SelectItem value="rating">{t('equipment:sort_rating', 'Rating')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="p-4">
        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {t('equipment:items_found', '{{count}} equipment items found', { count: filteredEquipment.length })}
          </p>
          {!isOnline && (
            <Badge variant="outline">{t('equipment:offline_mode', 'Offline Mode')}</Badge>
          )}
        </div>

        {/* Equipment Grid/List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredEquipment.length > 0 ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'space-y-3'}>
            {filteredEquipment.map((item) =>
              viewMode === 'grid' ? renderEquipmentCard(item) : renderEquipmentList(item)
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">{t('equipment:no_equipment_found', 'No equipment found')}</h3>
            <p className="text-muted-foreground mb-4">
              {t('equipment:try_adjusting_filters', 'Try adjusting your search or filters')}
            </p>
            <Button variant="outline" onClick={clearFilters}>
              {t('equipment:clear_filters', 'Clear Filters')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileEquipmentBrowser;


