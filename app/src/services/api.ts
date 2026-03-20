import type { ProjectData } from '@/types';

const API_BASE = '/api';

export async function fetchProject(code: string): Promise<{ success: boolean; project?: ProjectData; error?: string }> {
  const res = await fetch(`${API_BASE}/project/${encodeURIComponent(code)}`);
  return res.json();
}

export async function saveProgress(code: string, formData: any): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/project/${encodeURIComponent(code)}/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ formData }),
  });
  return res.json();
}

export async function submitForm(code: string, formData: any, source: string): Promise<{ success: boolean; submissionId?: string; message?: string }> {
  const res = await fetch(`${API_BASE}/project/${encodeURIComponent(code)}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ formData, source }),
  });
  return res.json();
}

export async function extractDocument(
  imageBase64: string,
  documentType: 'ibi' | 'electricity'
): Promise<{
  success: boolean;
  extraction: any;
  needsManualReview?: boolean;
  isWrongDocument?: boolean;
  message?: string;
}> {
  const res = await fetch(`${API_BASE}/extract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, documentType }),
  });
  return res.json();
}
