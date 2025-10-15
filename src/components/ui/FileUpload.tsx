'use client'

import { useState, useCallback } from 'react'
import { FiUpload, FiX, FiImage } from 'react-icons/fi'
import Image from 'next/image'

interface FileUploadProps {
  label?: string
  accept?: string
  maxSize?: number // in bytes
  onUpload: (file: File) => Promise<string>
  onRemove?: () => void
  currentUrl?: string
  error?: string
}

export default function FileUpload({
  label = 'Upload File',
  accept = 'image/jpeg,image/jpg,image/png',
  maxSize = 2097152, // 2MB
  onUpload,
  onRemove,
  currentUrl,
  error,
}: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentUrl || null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      // Validate file size
      if (file.size > maxSize) {
        setUploadError(`File size must be less than ${maxSize / 1024 / 1024}MB`)
        return
      }

      // Validate file type
      const acceptedTypes = accept.split(',').map(t => t.trim())
      const isValidType = acceptedTypes.some(type => {
        if (type === 'image/*') {
          return file.type.startsWith('image/')
        }
        return type === file.type
      })
      
      if (!isValidType) {
        setUploadError('Invalid file type. Please upload an image file.')
        return
      }

      setUploadError(null)
      setUploading(true)

      try {
        // Create preview
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreview(reader.result as string)
        }
        reader.readAsDataURL(file)

        // Upload file
        const url = await onUpload(file)
        setPreview(url)
      } catch (err: any) {
        setUploadError(err.message || 'Upload failed')
        setPreview(null)
      } finally {
        setUploading(false)
      }
    },
    [accept, maxSize, onUpload]
  )

  const handleRemove = useCallback(() => {
    setPreview(null)
    setUploadError(null)
    if (onRemove) {
      onRemove()
    }
  }, [onRemove])

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <div className="relative">
        {!preview ? (
          <label
            className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              uploadError || error
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <FiUpload className="w-10 h-10 mb-3 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                {accept.split(',').join(', ')} (MAX. {maxSize / 1024 / 1024}MB)
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              accept={accept}
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
        ) : (
          <div className="relative w-full h-48 border-2 border-gray-300 rounded-lg overflow-hidden">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
            <div className="text-center">
              <svg
                className="animate-spin h-10 w-10 text-blue-500 mx-auto"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-600">Uploading...</p>
            </div>
          </div>
        )}
      </div>

      {(uploadError || error) && (
        <p className="mt-2 text-sm text-red-500">{uploadError || error}</p>
      )}
    </div>
  )
}
