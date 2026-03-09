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
            const formData = new FormData()
            formData.append('file', file)

            const token = localStorage.getItem('token')
            const apiBase = import.meta.env.VITE_API_URL || '/api'
            const res = await fetch(`${apiBase}/upload`, {
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
                        className="w-full max-h-48 object-cover rounded-xl border border-white/10"
                    />
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-lg"
                    >
                        <X size={14} />
                    </button>
                </div>
            ) : (
                <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => inputRef.current?.click()}
                    className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-colors"
                >
                    {loading ? (
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin" />
                            <p className="text-sm text-indigo-400 font-medium">Uploading...</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-center mb-2">
                                <Image size={28} className="text-slate-600" />
                            </div>
                            <p className="text-sm text-slate-400">
                                <span className="text-indigo-400 font-medium">Click to upload</span> or drag & drop
                            </p>
                            <p className="text-xs text-slate-600 mt-1">PNG, JPG, WEBP up to 5MB</p>
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
