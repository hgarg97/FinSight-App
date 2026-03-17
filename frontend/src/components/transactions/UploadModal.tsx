import { useRef, useState } from 'react'
import { Upload, X, CheckCircle, FileText, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { uploadDocument, type UploadResult } from '../../api/documents'

interface Props {
  onClose: () => void
  onSuccess: () => void
}

type Stage = 'idle' | 'uploading' | 'done' | 'error'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function UploadModal({ onClose, onSuccess }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [stage, setStage] = useState<Stage>('idle')
  const [result, setResult] = useState<UploadResult | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === overlayRef.current) onClose()
  }

  function pickFile(f: File) {
    const ext = f.name.split('.').pop()?.toLowerCase() ?? ''
    if (!['csv', 'xlsx', 'xls', 'pdf'].includes(ext)) {
      toast.error('Unsupported file type. Use CSV, Excel, or PDF.')
      return
    }
    setFile(f)
    setStage('idle')
    setResult(null)
    setErrorMsg('')
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) pickFile(dropped)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (selected) pickFile(selected)
  }

  async function handleUpload() {
    if (!file) return
    setStage('uploading')
    try {
      const res = await uploadDocument(file)
      setResult(res)
      setStage('done')
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? 'Upload failed. Please try again.'
      setErrorMsg(msg)
      setStage('error')
    }
  }

  function handleDone() {
    onSuccess()
    onClose()
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.4)' }}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full mx-4"
        style={{ maxWidth: 480, padding: 24 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900">Upload statement</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Done state */}
        {stage === 'done' && result ? (
          <div className="flex flex-col items-center gap-4 py-6">
            <CheckCircle size={48} className="text-[#0F9E64]" />
            <div className="text-center">
              <p className="text-base font-semibold text-gray-900">
                Extracted {result.transactions_extracted} transaction{result.transactions_extracted !== 1 ? 's' : ''}
              </p>
              <p className="text-sm text-gray-500 mt-1">{result.document.filename}</p>
            </div>

            {result.preview.length > 0 && (
              <div className="w-full border border-gray-100 rounded-lg overflow-hidden">
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider px-3 py-2 bg-gray-50">
                  Preview (first {result.preview.length})
                </p>
                {result.preview.map(txn => (
                  <div
                    key={txn.id}
                    className="flex items-center justify-between px-3 py-2 border-t border-gray-100"
                  >
                    <div>
                      <span className="text-[13px] font-medium text-gray-900">
                        {txn.normalized_merchant ?? txn.merchant}
                      </span>
                      <span className="block text-[11px] text-gray-400">{txn.date}</span>
                    </div>
                    <span
                      className={`text-[13px] font-semibold ${
                        txn.transaction_type === 'income' ? 'text-[#0F9E64]' : 'text-gray-900'
                      }`}
                    >
                      {txn.transaction_type === 'income' ? '+' : ''}
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: txn.currency || 'USD',
                      }).format(txn.amount_total)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleDone}
              className="w-full h-10 bg-[#111] text-white rounded-lg text-sm font-semibold hover:bg-[#222] transition-colors"
            >
              Done
            </button>
          </div>
        ) : stage === 'error' ? (
          /* Error state */
          <div className="flex flex-col items-center gap-4 py-6">
            <AlertCircle size={48} className="text-red-400" />
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-900">Upload failed</p>
              <p className="text-sm text-red-500 mt-1">{errorMsg}</p>
            </div>
            <button
              onClick={() => { setStage('idle'); setFile(null) }}
              className="px-6 h-9 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Try again
            </button>
          </div>
        ) : (
          /* Upload form */
          <div className="space-y-4">
            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => !file && inputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 rounded-xl transition-colors cursor-pointer select-none"
              style={{
                height: 160,
                border: `2px dashed ${dragging ? '#0F9E64' : '#E5E7EB'}`,
                borderRadius: 12,
                background: dragging ? '#F0FDF4' : '#FAFAFA',
              }}
            >
              {file ? (
                <>
                  <FileText size={36} className="text-[#0F9E64]" />
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-400">{formatBytes(file.size)}</p>
                  <button
                    onClick={e => { e.stopPropagation(); setFile(null) }}
                    className="text-xs text-gray-400 hover:text-gray-600 underline"
                  >
                    Remove
                  </button>
                </>
              ) : (
                <>
                  <Upload size={36} style={{ color: '#D1D5DB' }} />
                  <p className="text-sm text-gray-500">Drag and drop your file here</p>
                  <p className="text-sm text-gray-400">or</p>
                  <span className="text-sm font-medium" style={{ color: '#0F9E64' }}>
                    Browse files
                  </span>
                  <p className="text-xs text-gray-400 mt-1">CSV, Excel (.xlsx, .xls), PDF</p>
                </>
              )}
            </div>

            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xlsx,.xls,.pdf"
              className="hidden"
              onChange={handleInputChange}
            />

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-4 h-9 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={!file || stage === 'uploading'}
                onClick={handleUpload}
                className="flex items-center gap-2 px-4 h-9 bg-[#111] text-white rounded-lg text-sm font-semibold hover:bg-[#222] transition-colors disabled:opacity-50"
              >
                {stage === 'uploading' ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Parsing…
                  </>
                ) : (
                  <>
                    <Upload size={14} />
                    Upload & Parse
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
