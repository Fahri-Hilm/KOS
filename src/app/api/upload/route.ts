import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api'
import { uploadToCloudinary } from '@/lib/cloudinary'

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '2097152') // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = (formData.get('folder') as string) || 'kos-management'

    if (!file) {
      return errorResponse('No file provided', 'File is required', 400)
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return errorResponse(
        'Invalid file type',
        `Allowed types: ${ALLOWED_TYPES.join(', ')}`,
        400
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return errorResponse(
        'File too large',
        `Maximum file size: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        400
      )
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

    // Upload to Cloudinary
    const result = await uploadToCloudinary(base64, folder)

    return successResponse('File uploaded successfully', {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return errorResponse('Upload failed', error.message, 500)
  }
}

// DELETE - Delete uploaded file
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const publicId = searchParams.get('publicId')

    if (!publicId) {
      return errorResponse('No public ID provided', 'Public ID is required', 400)
    }

    const { deleteFromCloudinary } = await import('@/lib/cloudinary')
    await deleteFromCloudinary(publicId)

    return successResponse('File deleted successfully', null)
  } catch (error: any) {
    console.error('Delete error:', error)
    return errorResponse('Delete failed', error.message, 500)
  }
}
