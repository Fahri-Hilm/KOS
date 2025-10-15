import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
  errors?: Record<string, string[]>
}

/**
 * Create a success response
 */
export function successResponse<T>(
  message: string,
  data?: T,
  status: number = 200
) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    } as ApiResponse<T>,
    { status }
  )
}

/**
 * Create an error response
 */
export function errorResponse(
  message: string,
  error?: string,
  status: number = 400,
  errors?: Record<string, string[]>
) {
  return NextResponse.json(
    {
      success: false,
      message,
      error,
      errors,
    } as ApiResponse,
    { status }
  )
}

/**
 * Validate required fields in request body
 */
export function validateRequiredFields(
  body: any,
  requiredFields: string[]
): { valid: boolean; errors?: Record<string, string[]> } {
  const errors: Record<string, string[]> = {}

  requiredFields.forEach((field) => {
    if (!body[field] || body[field] === '') {
      errors[field] = [`${field} is required`]
    }
  })

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors }
  }

  return { valid: true }
}

/**
 * Handle API errors
 */
export function handleApiError(error: any) {
  console.error('API Error:', error)

  if (error.code === 'P2002') {
    return errorResponse(
      'Data already exists',
      'Unique constraint violation',
      409
    )
  }

  if (error.code === 'P2025') {
    return errorResponse('Record not found', error.message, 404)
  }

  return errorResponse(
    'Internal server error',
    error.message || 'An unexpected error occurred',
    500
  )
}

/**
 * Parse JSON body safely
 */
export async function parseBody(request: NextRequest) {
  try {
    return await request.json()
  } catch (error) {
    throw new Error('Invalid JSON in request body')
  }
}

/**
 * Get pagination parameters from URL
 */
export function getPaginationParams(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const skip = (page - 1) * limit

  return { page, limit, skip }
}

/**
 * Create paginated response
 */
export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
  message: string = 'Data retrieved successfully'
) {
  const totalPages = Math.ceil(total / limit)

  return successResponse(message, {
    items: data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  })
}
