import { ExecutionContext, HttpStatus } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { CustomError } from '../../utils/custom-error';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;

  const mockAuthService = {
    extractTokenFromHeader: jest.fn(),
    decodeJwtToken: jest.fn(),
  } as any;

  beforeEach(() => {
    authGuard = new AuthGuard(mockAuthService);
  });

  it('should allow access when a valid token is present', async () => {
    const context = createContextWithToken('valid-token');

    mockAuthService.extractTokenFromHeader.mockReturnValueOnce('valid-token');
    mockAuthService.decodeJwtToken.mockReturnValueOnce({ userId: 'user123' });

    const result = await authGuard.canActivate(context);

    expect(result).toEqual(true);
    expect(context.switchToHttp().getRequest().user).toEqual({
      userId: 'user123',
    });
  });

  it('should throw UnauthorizedException when no token is present', async () => {
    const context = createContextWithToken(undefined);

    await expect(authGuard.canActivate(context)).rejects.toThrow(
      new CustomError('Unauthorized', HttpStatus.UNAUTHORIZED),
    );
    expect(context.switchToHttp().getRequest().user).toBeUndefined();
  });

  it('should throw UnauthorizedException when token verification fails', async () => {
    const context = createContextWithToken('invalid-token');

    mockAuthService.extractTokenFromHeader.mockReturnValueOnce('invalid-token');
    mockAuthService.decodeJwtToken.mockImplementationOnce(() => {
      throw new Error('Invalid token');
    });

    await expect(authGuard.canActivate(context)).rejects.toThrow(
      new CustomError('Unauthorized', HttpStatus.UNAUTHORIZED),
    );
    expect(context.switchToHttp().getRequest().user).toBeUndefined();
  });

  function createContextWithToken(token: string | undefined): ExecutionContext {
    const request = {
      headers: {
        authorization: token ? `Bearer ${token}` : undefined,
      },
    } as any;

    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;
  }
});
