import { useState, type FormEvent } from 'react'
import { Alert, Box, Button, Grid, Stack, TextField } from '@mui/material'
import { isValidEmail, isValidPhone, sanitizePhoneInput } from '../lib/validation'
import type { NewLeadInput } from '../types/lead'

interface LeadFormProps {
  onSubmit: (input: NewLeadInput) => Promise<void>
  onCancel?: () => void
}

const emptyForm: NewLeadInput = { name: '', email: '', phone: '', source: '', notes: '' }

type FieldErrors = Partial<Record<'name' | 'email' | 'phone', string>>

function validate(form: NewLeadInput): FieldErrors {
  const errors: FieldErrors = {}

  if (!form.name.trim()) {
    errors.name = 'Name is required.'
  }

  const email = form.email?.trim() ?? ''
  if (!email) {
    errors.email = 'Email is required.'
  } else if (!isValidEmail(email)) {
    errors.email = 'Enter a valid email address.'
  }

  const phone = form.phone?.trim() ?? ''
  if (!phone) {
    errors.phone = 'Phone number is required.'
  } else if (!isValidPhone(phone)) {
    errors.phone = 'Enter a valid phone number (7-15 digits).'
  }

  return errors
}

export function LeadForm({ onSubmit, onCancel }: LeadFormProps) {
  const [form, setForm] = useState<NewLeadInput>(emptyForm)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateField<K extends keyof NewLeadInput>(field: K, value: NewLeadInput[K]) {
    setForm((f) => ({ ...f, [field]: value }))
    // Clear that field's error as soon as the user edits it, rather than
    // making them resubmit to find out it's fixed.
    if (field in fieldErrors) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const errors = validate(form)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await onSubmit(form)
      setForm(emptyForm)
      setFieldErrors({})
    } catch {
      setError('Could not add lead. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          label="Name"
          placeholder="Enter Name"
          value={form.name}
          onChange={(e) => updateField('name', e.target.value)}
          error={!!fieldErrors.name}
          helperText={fieldErrors.name}
          autoFocus
          required
          fullWidth
        />

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Email"
              type="email"
              placeholder="Enter Email"
              value={form.email ?? ''}
              onChange={(e) => updateField('email', e.target.value)}
              error={!!fieldErrors.email}
              helperText={fieldErrors.email}
              required
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Phone"
              type="tel"
              placeholder="Enter Phone"
              value={form.phone ?? ''}
              onChange={(e) => updateField('phone', sanitizePhoneInput(e.target.value))}
              error={!!fieldErrors.phone}
              helperText={fieldErrors.phone}
              slotProps={{ htmlInput: { inputMode: 'tel' } }}
              required
              fullWidth
            />
          </Grid>
        </Grid>

        <TextField
          label="Source"
          placeholder="Enter Source"
          value={form.source ?? ''}
          onChange={(e) => updateField('source', e.target.value)}
          fullWidth
        />

        <TextField
          label="Notes"
          placeholder="Enter Notes"
          value={form.notes ?? ''}
          onChange={(e) => updateField('notes', e.target.value)}
          multiline
          minRows={3}
          fullWidth
        />

        <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
          {onCancel && (
            <Button variant="outlined" color="inherit" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? 'Adding…' : 'Add lead'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}
