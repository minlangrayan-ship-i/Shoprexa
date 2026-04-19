import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string;
      role: 'ADMIN' | 'CUSTOMER' | 'SELLER';
      sellerId: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    uid?: string;
    role?: 'ADMIN' | 'CUSTOMER' | 'SELLER';
    sellerId?: string | null;
  }
}

