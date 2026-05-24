import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Assume basic JWT guard applies to WS too

@WebSocketGateway({
  cors: {
    origin: '*', // To be restricted to the specific frontend domain in production
  },
  namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Track connected clients per tenant
  private tenantRooms: Map<string, Set<string>> = new Map();

  handleConnection(client: Socket) {
    // In a real implementation, extract tenantId from the JWT query token
    const tenantId = client.handshake.query.tenantId as string;
    
    if (tenantId) {
      client.join(tenantId);
      console.log(`Client ${client.id} joined room for tenant ${tenantId}`);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client ${client.id} disconnected`);
  }

  // Called by BullMQ processors to push a live notification to the Admin Dashboard
  notifyTenantOfNewLead(tenantId: string, leadData: any) {
    this.server.to(tenantId).emit('new_lead', leadData);
  }
}
