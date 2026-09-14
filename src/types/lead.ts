export type LeadStage = 'new' | 'contacted' | 'signed'

export const LEAD_STAGES: LeadStage[] = ['new', 'contacted', 'signed']

export const LEAD_STAGE_LABELS: Record<LeadStage, string> = {
  new: 'New',
  contacted: 'Contacted',
  signed: 'Signed',
}

export interface Lead {
  id: string
  user_id: string
  name: string
  email: string | null
  phone: string | null
  source: string | null
  stage: LeadStage
  notes: string | null
  created_at: string
  updated_at: string
}

export type NewLeadInput = Pick<Lead, 'name'> &
  Partial<Pick<Lead, 'email' | 'phone' | 'source' | 'notes'>>
