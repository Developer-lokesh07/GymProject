import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true; // No roles required, allow access
    }
    
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Appended by JwtAuthGuard
    
    if (!user) {
      throw new ForbiddenException('User is not authenticated');
    }
    
    // Check if the user's role is in the list of required roles
    // In a real hierarchical system, SuperAdmin would bypass this
    if (user.role === 'SuperAdmin') {
      return true;
    }
    
    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      throw new ForbiddenException(`Access Denied: Requires one of the following roles: ${requiredRoles.join(', ')}`);
    }
    
    return true;
  }
}
