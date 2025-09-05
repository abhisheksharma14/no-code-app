export class ApiError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

export function createErrorResponse(message: string, statusCode: number) {
  return Response.json(
    { error: message },
    { status: statusCode }
  );
}

export function handleValidationError(error: any) {
  if (error.errors) {
    const messages = error.errors.map((err: any) => err.message).join(', ');
    return createErrorResponse(`Validation error: ${messages}`, 400);
  }
  return createErrorResponse('Validation error', 400);
}
