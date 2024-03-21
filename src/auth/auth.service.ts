import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

const JWT_ALGORITHM = 'RS256';
const JWT_ISSUER = 'instagram';

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService) {}
    async getAuthInfoFromToken(token: string) {
        const data = await this.verifyToken(token);
        return {
            id: +data.sub,
            name: data.name,
        };
    }

    verifyToken(token: string) {
        return this.jwtService.verifyAsync(token, {
            secret: process.env.JWT_PUBLIC_KEY,
            algorithms: [JWT_ALGORITHM],
        });
    }
}
