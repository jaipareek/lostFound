import { useState, useRef } from 'react'
import { Upload, X, Image } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ImageUpload({ value, onChange }) {
    const [loading, setLoading] = useState(false)
    const [preview, setPreview] = useState(value || null)
    const inputRef = useRef()

    const handleFile = async (file) => {
        if (!file) return
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file')
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be under 5MB')
            return
        }

        setLoading(true)
        try {
            // Build FormData and POST to our Express server
            const formData = new FormData()
            formData.append('file', file)

            const token = localStorage.getItem('token')
            const res = await fetch('/api/upload', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            })

            if (!res.ok) {
                const err = await res.json().catch(() => ({ message: 'Upload failed' }))
                throw new Error(err.message)
            }

            const { url } = await res.json()
            setPreview(url)
            onChange(url)
            toast.success('Image uploaded!')
        } catch (err) {
            toast.error('Upload failed: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        if (file) handleFile(file)
    }

    const handleRemove = () => {
        setPreview(null)
        onChange(null)
        if (inputRef.current) inputRef.current.value = ''
    }

    return (
        <div className="w-full">
            {preview ? (
                <div className="relative inline-block w-full">
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full max-h-48 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow"
                    >
                        <X size={14} />
                    </button>
                </div>
            ) : (
                <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => inputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors"
                >
                    {loading ? (
                        <p className="text-sm text-primary-600 font-medium">Uploading...</p>
                    ) : (
                        <>
                            <div className="flex justify-center mb-2">
                                <Image size={32} className="text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-600">
                                <span className="text-primary-600 font-medium">Click to upload</span> or drag & drop
                            </p>
                            <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 5MB</p>
                        </>
                    )}
                </div>
            )}
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files[0])}
            />
        </div>
    )
}
