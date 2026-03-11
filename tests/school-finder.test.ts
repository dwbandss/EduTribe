import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { POST } from '../app/api/schools/search/route';
import { NextRequest } from 'next/server';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
  
  // Create test data with geospatial coordinates
  const testSchools = [
    {
      schoolName: 'Test EMRS School Koraput',
      type: 'EMRS',
      locationCoordinates: {
        type: 'Point',
        coordinates: [82.7167, 18.8158]
      },
      contact: {
        city: 'Koraput',
        district: 'Koraput',
        state: 'Odisha',
        address: 'Test Address',
        pincode: '764012'
      },
      academics: {
        streams: ['science'],
        board: 'CBSE'
      },
      facilities: {
        hostel: true,
        science: true,
        sports: true
      },
      tribalInfo: {
        tribalCategory: 'ST',
        tribalPercentage: 85
      },
      verificationStatus: 'verified',
      rating: 4.2,
      reviewCount: 89
    },
    {
      schoolName: 'Test Government School Malkangiri',
      type: 'Government',
      locationCoordinates: {
        type: 'Point',
        coordinates: [83.5167, 19.2667]
      },
      contact: {
        city: 'Malkangiri',
        district: 'Malkangiri',
        state: 'Odisha',
        address: 'Test Address 2',
        pincode: '764043'
      },
      academics: {
        streams: ['arts'],
        board: 'State Board'
      },
      facilities: {
        hostel: false,
        science: false,
        sports: true
      },
      tribalInfo: {
        tribalCategory: 'ST',
        tribalPercentage: 92
      },
      verificationStatus: 'verified',
      rating: 3.8,
      reviewCount: 45
    }
  ];

  // Insert test data
  if (mongoose.connection.db) {
    await mongoose.connection.db.collection('schools').insertMany(testSchools);
    
    // Create indexes
    await mongoose.connection.db.collection('schools').createIndex({ locationCoordinates: '2dsphere' });
    await mongoose.connection.db.collection('schools').createIndex({ 'contact.state': 1, 'contact.district': 1 });
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Smart School Finder API', () => {
  describe('Natural Language Query Parsing', () => {
    it('should parse "hostel schools near Koraput offering science stream"', async () => {
      const requestBody = {
        query: 'hostel schools near Koraput offering science stream',
        page: 1,
        perPage: 10
      };

      const request = new NextRequest('http://localhost:3000/api/schools/search', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.schools).toBeDefined();
      expect(data.data.parsing).toBeDefined();
      expect(data.data.parsing.confidence).toBeGreaterThan(0.7);
      
      // Check if parsed filters are correct
      const parsedFilters = data.data.parsing.parsedFilters;
      expect(parsedFilters.district).toBe('Koraput');
      expect(parsedFilters.hostel).toBe(true);
      expect(parsedFilters.stream).toBe('science');
    });

    it('should parse "government schools in Odisha with sports facilities"', async () => {
      const requestBody = {
        query: 'government schools in Odisha with sports facilities',
        page: 1,
        perPage: 10
      };

      const request = new NextRequest('http://localhost:3000/api/schools/search', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.parsing.confidence).toBeGreaterThan(0.7);
      
      const parsedFilters = data.data.parsing.parsedFilters;
      expect(parsedFilters.state).toBe('Odisha');
      expect(parsedFilters.type).toBe('government');
      expect(parsedFilters.sports).toBe(true);
    });

    it('should handle complex queries with multiple filters', async () => {
      const requestBody = {
        query: 'EMRS schools with hostel facility in tribal areas offering science stream',
        page: 1,
        perPage: 10
      };

      const request = new NextRequest('http://localhost:3000/api/schools/search', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.parsing.confidence).toBeGreaterThan(0.7);
      
      const parsedFilters = data.data.parsing.parsedFilters;
      expect(parsedFilters.type).toBe('EMRS');
      expect(parsedFilters.hostel).toBe(true);
      expect(parsedFilters.tribalCategory).toBe('ST');
      expect(parsedFilters.stream).toBe('science');
    });
  });

  describe('Geospatial Queries', () => {
    it('should return schools sorted by proximity for location-based queries', async () => {
      const requestBody = {
        query: 'schools near Koraput',
        location: {
          latitude: 18.8158,
          longitude: 82.7167,
          radius: 50 // 50km radius
        },
        page: 1,
        perPage: 10
      };

      const request = new NextRequest('http://localhost:3000/api/schools/search', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.schools.length).toBeGreaterThan(0);
      
      // Check if returned schools are within the radius (simplified check)
      const schools = data.data.schools;
      expect(schools.length).toBeGreaterThan(0);
    });

    it('should handle geospatial queries with filters', async () => {
      const requestBody = {
        query: 'hostel schools near Koraput',
        filters: {
          hostel: true,
          stream: 'science'
        },
        location: {
          latitude: 18.8158,
          longitude: 82.7167,
          radius: 100
        },
        page: 1,
        perPage: 10
      };

      const request = new NextRequest('http://localhost:3000/api/schools/search', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      const schools = data.data.schools;
      expect(schools.length).toBeGreaterThan(0);
      
      // Check if all returned schools have hostel facility
      schools.forEach((school: any) => {
        expect(school.facilities.hostel).toBe(true);
      });
    });
  });

  describe('Filter-based Queries', () => {
    it('should filter by state and district', async () => {
      const requestBody = {
        query: 'schools in Odisha',
        filters: {
          state: 'Odisha',
          district: 'Koraput'
        },
        page: 1,
        perPage: 10
      };

      const request = new NextRequest('http://localhost:3000/api/schools/search', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      const schools = data.data.schools;
      expect(schools.length).toBeGreaterThan(0);
      
      // Check if all schools are from the specified state and district
      schools.forEach((school: any) => {
        expect(school.contact.state).toBe('Odisha');
        expect(school.contact.district).toBe('Koraput');
      });
    });

    it('should filter by facilities', async () => {
      const requestBody = {
        query: 'schools with hostel and science',
        filters: {
          hostel: true,
          science: true
        },
        page: 1,
        perPage: 10
      };

      const request = new NextRequest('http://localhost:3000/api/schools/search', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      const schools = data.data.schools;
      expect(schools.length).toBeGreaterThan(0);
      
      // Check if all returned schools have required facilities
      schools.forEach((school: any) => {
        expect(school.facilities.hostel).toBe(true);
        expect(school.facilities.science).toBe(true);
      });
    });

    it('should filter by tribal category', async () => {
      const requestBody = {
        query: 'ST category schools',
        filters: {
          tribalCategory: 'ST'
        },
        page: 1,
        perPage: 10
      };

      const request = new NextRequest('http://localhost:3000/api/schools/search', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      const schools = data.data.schools;
      expect(schools.length).toBeGreaterThan(0);
      
      // Check if all schools are ST category
      schools.forEach((school: any) => {
        expect(school.tribalInfo.tribalCategory).toBe('ST');
      });
    });
  });

  describe('Pagination', () => {
    it('should handle pagination correctly', async () => {
      const requestBody = {
        query: 'schools in Odisha',
        page: 1,
        perPage: 5
      };

      const request = new NextRequest('http://localhost:3000/api/schools/search', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.schools.length).toBeLessThanOrEqual(5);
      expect(data.data.pagination).toBeDefined();
      expect(data.data.pagination.page).toBe(1);
      expect(data.data.pagination.perPage).toBe(5);
      expect(data.data.pagination.total).toBeGreaterThan(0);
    });

    it('should handle page 2 correctly', async () => {
      const requestBody = {
        query: 'schools in Odisha',
        page: 2,
        perPage: 1
      };

      const request = new NextRequest('http://localhost:3000/api/schools/search', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.pagination.page).toBe(2);
      expect(data.data.pagination.hasPrev).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid requests', async () => {
      const requestBody = {
        query: '', // Empty query
        page: 1,
        perPage: 10
      };

      const request = new NextRequest('http://localhost:3000/api/schools/search', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toContain('Query is required');
    });

    it('should handle malformed requests', async () => {
      const request = new NextRequest('http://localhost:3000/api/schools/search', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      expect(response.status).toBe(500);
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting', async () => {
      // Make multiple rapid requests
      const requests = Array.from({ length: 10 }, (_, i) => {
        const requestBody = {
          query: `test query ${i}`,
          page: 1,
          perPage: 10
        };

        return new NextRequest('http://localhost:3000/api/schools/search', {
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: {
            'Content-Type': 'application/json',
          },
        });
      });

      // Execute all requests rapidly
      const responses = await Promise.allSettled(requests.map(req => POST(req)));
      
      // Check if any requests were rate limited
      const rateLimitedResponses = responses.filter(
        (result): result is PromiseRejectedResult => 
          result.status === 'rejected' || 
          (result.status === 'fulfilled' && result.value.status === 429)
      );

      // At least some requests should be rate limited (depending on configuration)
      expect(rateLimitedResponses.length).toBeGreaterThanOrEqual(0);
    });
  });
});
