import { ArgumentsHost, BadRequestException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ErrorFilter } from './error.filter';
import { CustomError } from '../../utils/custom-error';

describe('ErrorFilter', () => {
  let errorFilter: ErrorFilter;

  beforeEach(() => {
    errorFilter = new ErrorFilter();
  });

  it('should catch validation Error and return the correct response', () => {
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    const mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
      }),
    } as unknown as ArgumentsHost;

    const badRequestError = new BadRequestException([
      'validation error1',
      'validation error2',
    ]);

    errorFilter.catch(badRequestError, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      message: ['validation error1', 'validation error2'],
    });
  });

  it('should catch CustomError and return the correct response', () => {
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    const mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
      }),
    } as unknown as ArgumentsHost;

    const customError = new CustomError(
      'Custom error message',
      HttpStatus.NOT_FOUND,
    );

    errorFilter.catch(customError, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.NOT_FOUND,
      message: 'Custom error message',
    });
  });

  it('should catch generic Error and return the correct response', () => {
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    const mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
      }),
    } as unknown as ArgumentsHost;

    const genericError = new Error('Generic error message');

    errorFilter.catch(genericError, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  });
});
