import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  // Mock implementation for the authentication mechanism.
  // In a real scenario, this queries the PostgreSQL database via Prisma.
  async validateUser(email: string, pass: string): Promise<any> {
    if (email === 'admin@conqueror.com' && pass === 'admin123') {
      return { id: 'usr_123', email: 'admin@conqueror.com', role: 'SuperAdmin', tenantId: 'global' };
    }
    if (email === 'manager@gym.com' && pass === 'gym123') {
      return { id: 'usr_456', email: 'manager@gym.com', role: 'GymManager', tenantId: 'tnt_abc' };
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role, tenantId: user.tenantId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
