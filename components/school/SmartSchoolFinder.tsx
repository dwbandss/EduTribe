"use client";

import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, MapPin, School, Star, Users, Wifi, Car, Home, BookOpen, Microscope, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';

// Dynamically import map component to avoid SSR issues
const MapComponent = dynamic(() => import('../school/MapComponent'), {
  ssr: false,
  loading: () => <div className="h-96 bg-muted animate-pulse rounded-lg" />
});

interface School {
  _id: string;
  name: string;
  type: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  contact: {
    city: string;
    district: string;
    state: string;
    address: string;
  };
  academics: {
    streams: string[];
    classes: string[];
    board: string;
    medium: string[];
  };
  facilities: {
    hostel: boolean;
    science: boolean;
    sports: boolean;
    library: boolean;
    laboratory: boolean;
    computerLab: boolean;
    transport: boolean;
    playground: boolean;
    medical: boolean;
    cafeteria: boolean;
  };
  tribalInfo: {
    tribalCategory: string;
    tribalPercentage?: number;
    specialSchemes: string[];
  };
  description?: string;
  rating: number;
  reviewCount: number;
}

interface SearchFilters {
  state?: string;
  district?: string;
  hostel?: boolean;
  science?: boolean;
  sports?: boolean;
  stream?: string;
  type?: string;
  board?: string;
  tribalCategory?: string;
  radius?: number;
}

interface SearchResponse {
  schools: School[];
  pagination: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  parsing?: {
    originalQuery: string;
    parsedFilters: SearchFilters;
    confidence: number;
  };
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Puducherry'
];

const SCHOOL_TYPES = [
  'Government', 'Private', 'Government-Aided', 'EMRS', 'Eklavya', 'Ashram'
];

const STREAMS = ['science', 'commerce', 'arts'];
const BOARDS = ['CBSE', 'State Board', 'ICSE', 'NIOS'];
const TRIBAL_CATEGORIES = ['ST', 'SC', 'OBC', 'General'];

export type { School, SearchFilters, SearchResponse };

export default function SmartSchoolFinder() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

  // Handle natural language search
  const handleSearch = useCallback(async (page = 1) => {
    if (!query.trim() && Object.keys(filters).length === 0) {
      toast.error('Please enter a search query or select filters');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/schools/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          filters,
          page,
          perPage: 10,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setSearchResponse(data.data);
        if (page === 1) {
          setSchools(data.data.schools);
        } else {
          setSchools(prev => [...prev, ...data.data.schools]);
        }
        
        // Show parsing confidence if available
        if (data.data.parsing && data.data.parsing.confidence > 0) {
          toast.success(`Query parsed with ${Math.round(data.data.parsing.confidence * 100)}% confidence`);
        }
      } else {
        toast.error(data.message || 'Search failed');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search schools');
    } finally {
      setLoading(false);
    }
  }, [query, filters]);

  // Handle filter changes
  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({});
    setQuery('');
    setSchools([]);
    setSearchResponse(null);
  };

  // Get facility icon
  const getFacilityIcon = (facility: string) => {
    const icons: Record<string, React.ReactNode> = {
      hostel: <Home className="w-4 h-4" />,
      science: <Microscope className="w-4 h-4" />,
      sports: <Trophy className="w-4 h-4" />,
      library: <BookOpen className="w-4 h-4" />,
      laboratory: <Microscope className="w-4 h-4" />,
      computerLab: <Wifi className="w-4 h-4" />,
      transport: <Car className="w-4 h-4" />,
    };
    return icons[facility] || null;
  };

  // Render school card
  const renderSchoolCard = (school: School) => (
    <Card key={school._id} className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{school.name}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <MapPin className="w-4 h-4" />
              {school.contact.city}, {school.contact.district}, {school.contact.state}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={school.type === 'Government' ? 'default' : 'secondary'}>
              {school.type}
            </Badge>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{school.rating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">({school.reviewCount})</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Academic Info */}
          <div className="flex flex-wrap gap-2">
            {school.academics.streams.map(stream => (
              <Badge key={stream} variant="outline" className="text-xs">
                {stream}
              </Badge>
            ))}
            <Badge variant="outline" className="text-xs">
              {school.academics.board}
            </Badge>
          </div>

          {/* Facilities */}
          <div className="flex flex-wrap gap-2">
            {school.facilities.hostel && (
              <Badge variant="secondary" className="text-xs">
                <Home className="w-3 h-3 mr-1" />
                Hostel
              </Badge>
            )}
            {school.facilities.science && (
              <Badge variant="secondary" className="text-xs">
                <Microscope className="w-3 h-3 mr-1" />
                Science
              </Badge>
            )}
            {school.facilities.sports && (
              <Badge variant="secondary" className="text-xs">
                <Trophy className="w-3 h-3 mr-1" />
                Sports
              </Badge>
            )}
            {school.facilities.transport && (
              <Badge variant="secondary" className="text-xs">
                <Car className="w-3 h-3 mr-1" />
                Transport
              </Badge>
            )}
          </div>

          {/* Tribal Info */}
          {school.tribalInfo.tribalCategory && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                {school.tribalInfo.tribalCategory} Category
                {school.tribalInfo.tribalPercentage && (
                  <span className="text-muted-foreground">
                    {' '}({school.tribalInfo.tribalPercentage}% tribal students)
                  </span>
                )}
              </span>
            </div>
          )}

          {/* Description */}
          {school.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {school.description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <School className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Smart Tribal School Finder</h1>
              <p className="text-sm text-muted-foreground">
                Find schools using natural language search
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Search and Filters */}
          <div className="lg:col-span-1 space-y-4">
            {/* Natural Language Search */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Natural Search
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Input
                    placeholder="e.g., 'hostel schools near Koraput offering science stream'"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pr-12"
                  />
                  <Button
                    size="sm"
                    onClick={() => handleSearch()}
                    disabled={loading}
                    className="absolute right-1 top-1 h-8"
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Example Queries */}
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium mb-2">Try these queries:</p>
                  <ul className="space-y-1">
                    <li>• "government schools with hostel in Odisha"</li>
                    <li>• "science stream schools near Koraput"</li>
                    <li>• "EMRS schools with sports facilities"</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full"
                >
                  {showFilters ? 'Hide' : 'Show'} Filters
                </Button>
              </CardHeader>
              {showFilters && (
                <CardContent className="space-y-4">
                  {/* State Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">State</label>
                    <Select
                      value={filters.state || ''}
                      onValueChange={(value) => handleFilterChange('state', value || undefined)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDIAN_STATES.map(state => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* School Type */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">School Type</label>
                    <Select
                      value={filters.type || ''}
                      onValueChange={(value) => handleFilterChange('type', value || undefined)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {SCHOOL_TYPES.map(type => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Facility Filters */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Facilities</label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="hostel"
                          checked={filters.hostel || false}
                          onCheckedChange={(checked) => handleFilterChange('hostel', checked)}
                        />
                        <label htmlFor="hostel" className="text-sm">Hostel Facility</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="science"
                          checked={filters.science || false}
                          onCheckedChange={(checked) => handleFilterChange('science', checked)}
                        />
                        <label htmlFor="science" className="text-sm">Science Stream</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="sports"
                          checked={filters.sports || false}
                          onCheckedChange={(checked) => handleFilterChange('sports', checked)}
                        />
                        <label htmlFor="sports" className="text-sm">Sports Facilities</label>
                      </div>
                    </div>
                  </div>

                  {/* Stream Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Stream</label>
                    <Select
                      value={filters.stream || ''}
                      onValueChange={(value) => handleFilterChange('stream', value || undefined)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select stream" />
                      </SelectTrigger>
                      <SelectContent>
                        {STREAMS.map(stream => (
                          <SelectItem key={stream} value={stream}>
                            {stream.charAt(0).toUpperCase() + stream.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleSearch()} 
                      disabled={loading}
                      className="flex-1"
                    >
                      {loading ? 'Searching...' : 'Apply Filters'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={clearFilters}
                      disabled={loading}
                    >
                      Clear
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>

          {/* Results Area */}
          <div className="lg:col-span-3">
            {/* View Toggle */}
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-muted-foreground">
                {searchResponse && (
                  <>
                    Found {searchResponse.pagination.total} schools
                    {searchResponse.parsing && (
                      <span className="ml-2">
                        (Confidence: {Math.round(searchResponse.parsing.confidence * 100)}%)
                      </span>
                    )}
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  List View
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('map')}
                >
                  Map View
                </Button>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}

            {/* Results */}
            {!loading && (
              <>
                {viewMode === 'list' ? (
                  <div className="space-y-4">
                    {schools.map(renderSchoolCard)}
                    
                    {/* Load More */}
                    {searchResponse?.pagination.hasNext && (
                      <div className="text-center">
                        <Button
                          onClick={() => handleSearch(searchResponse.pagination.page + 1)}
                          disabled={loading}
                          variant="outline"
                        >
                          Load More Schools
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-96 lg:h-[600px] rounded-lg overflow-hidden border">
                    <MapComponent schools={schools} />
                  </div>
                )}

                {/* No Results */}
                {!loading && schools.length === 0 && (
                  <div className="text-center py-12">
                    <School className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No schools found</h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your search query or filters
                    </p>
                    <Button onClick={clearFilters} variant="outline">
                      Clear Filters
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
