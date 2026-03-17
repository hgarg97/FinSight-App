import client from './client'
import type { Transaction } from '../types'

export interface DocumentRecord {
  id: string
  user_id: string
  filename: string
  file_type: string
  document_type: string | null
  file_size: number
  transactions_extracted: number
  status: string
  error_message: string | null
  uploaded_at: string
}

export interface UploadResult {
  document: DocumentRecord
  transactions_extracted: number
  preview: Transaction[]
}

export async function uploadDocument(file: File): Promise<UploadResult> {
  const form = new FormData()
  form.append('file', file)
  const { data } = await client.post('/api/documents/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function getDocuments(): Promise<DocumentRecord[]> {
  const { data } = await client.get('/api/documents')
  return data
}
