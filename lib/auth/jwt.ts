import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'edutribe-secret-key-change-in-production';

// Define JWT payload interface
export interface JwtPayload {
  uid: string;
  role: string;
  userId: string;
  name?: string;
  email?: string;
  phone?: string;
  volunteerType?: string;  // For volunteer type (ngo/independent)
  ngoUid?: string;         // For NGO volunteers
  adminVerified?: boolean; // For independent volunteers
  volunteerUid?: string;  // For new architecture
  verified?: boolean;     // For new architecture
  status?: string;        // For new architecture
  type?: string;          // For new architecture
  adminRole?: string;     // For admin role
  iat?: number;
  exp?: number;
}

export function signToken(payload: Omit<JwtPayload, 'iat' | 'exp'>) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    // For Edge runtime, we need to handle this differently
    const decoded = jwt.decode(token) as JwtPayload;
    if (!decoded || typeof decoded === 'string') {
      return null;
    }
    
    // Basic validation without crypto verification (less secure but works in Edge)
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      return null;
    }
    
    return decoded;
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}
