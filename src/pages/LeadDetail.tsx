import { useEffect, useState, type ReactNode } from 'react'
import { Link as RouterLink, useParams } from 'react-router-dom'
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import EmailRoundedIcon from '@mui/icons-material/EmailRounded'
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded'
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded'
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import UpdateRoundedIcon from '@mui/icons-material/UpdateRounded'
import { supabase } from '../lib/supabaseClient'
import { StageControl } from '../components/StageControl'
import { Footer } from '../components/Footer'
import { formatDate, formatDateTime } from '../lib/formatDate'
import type { Lead, LeadStage } from '../types/lead'

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

function InfoRow({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
      <Box sx={{ color: 'text.secondary', display: 'flex', mt: '2px' }}>{icon}</Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
          {value || '—'}
        </Typography>
      </Box>
    </Stack>
  )
}

export function LeadDetail() {
  const { id } = useParams<{ id: string }>()
  const [lead, setLead] = useState<Lead | null>(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setNotFound(false)

      // This is the query that enforces per-user isolation for this demo:
      // `.eq('id', id)` alone would let any signed-in user fetch ANY lead by
      // guessing/editing the id in the URL. What actually stops that is the
      // RLS policy on `leads` in supabase/schema.sql
      // (`USING (user_id = auth.uid())`) — if the row belongs to a
      // different account, Postgres never returns it, so `data` comes back
      // null/empty here regardless of what the UI does.
      const { data, error } = await supabase.from('leads').select('*').eq('id', id).maybeSingle()

      if (cancelled) return
      if (error || !data) {
        setNotFound(true)
      } else {
        setLead(data as Lead)
        setNotes((data as Lead).notes ?? '')
      }
      setLoading(false)
    }

    if (id) load()
    return () => {
      cancelled = true
    }
  }, [id])

  async function handleStageChange(stage: LeadStage) {
    if (!lead) return
    setError(null)
    const { data, error } = await supabase
      .from('leads')
      .update({ stage })
      .eq('id', lead.id)
      .select()
      .maybeSingle()
    if (error || !data) {
      console.error('Failed to update lead stage:', error)
      setError('Could not update this lead. Please try again.')
    } else {
      setLead(data as Lead)
    }
  }

  async function handleSaveNotes() {
    if (!lead) return
    setSaving(true)
    setError(null)
    const { data, error } = await supabase
      .from('leads')
      .update({ notes })
      .eq('id', lead.id)
      .select()
      .maybeSingle()
    if (error || !data) {
      console.error('Failed to save notes:', error)
      setError('Could not save notes. Please try again.')
    } else {
      setLead(data as Lead)
    }
    setSaving(false)
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Container maxWidth="md" sx={{ py: 2 }}>
          <Link
            component={RouterLink}
            to="/"
            underline="hover"
            color="text.secondary"
            sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontWeight: 600 }}
          >
            <ArrowBackRoundedIcon fontSize="small" /> Back to leads
          </Link>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ flex: 1, py: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Paper variant="outlined" sx={{ p: 8, textAlign: 'center' }}>
            <CircularProgress size={28} />
          </Paper>
        ) : notFound || !lead ? (
          <Paper variant="outlined" sx={{ p: 8, textAlign: 'center' }}>
            <Typography color="text.primary">Lead not found.</Typography>
            <Typography variant="body2" color="text.secondary">
              It may not exist, or it doesn't belong to your account.
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={3}>
            {/* Header */}
            <Paper variant="outlined" sx={{ p: { xs: 3, sm: 4 } }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}
              >
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                  <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: 20 }}>
                    {initials(lead.name)}
                  </Avatar>
                  <Box>
                    <Typography variant="h5">{lead.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {lead.source ? `via ${lead.source}` : 'No source recorded'}
                    </Typography>
                  </Box>
                </Stack>
                <StageControl value={lead.stage} onChange={handleStageChange} />
              </Stack>

              {(lead.email || lead.phone) && (
                <Stack direction="row" spacing={1.5} sx={{ mt: 3, flexWrap: 'wrap', gap: 1.5 }}>
                  {lead.email && (
                    <Button
                      component="a"
                      href={`mailto:${lead.email}`}
                      variant="outlined"
                      size="small"
                      startIcon={<EmailRoundedIcon fontSize="small" />}
                    >
                      Email
                    </Button>
                  )}
                  {lead.phone && (
                    <Button
                      component="a"
                      href={`tel:${lead.phone}`}
                      variant="outlined"
                      size="small"
                      startIcon={<PhoneRoundedIcon fontSize="small" />}
                    >
                      Call
                    </Button>
                  )}
                </Stack>
              )}
            </Paper>

            <Grid container spacing={3}>
              {/* Sidebar */}
              <Grid size={{ xs: 12, md: 5 }}>
                <Stack spacing={3}>
                  <Paper variant="outlined" sx={{ p: 3 }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 12 }}
                    >
                      Contact
                    </Typography>
                    <Stack spacing={2}>
                      <InfoRow icon={<EmailRoundedIcon fontSize="small" />} label="Email" value={lead.email} />
                      <InfoRow icon={<PhoneRoundedIcon fontSize="small" />} label="Phone" value={lead.phone} />
                      <InfoRow
                        icon={<CampaignRoundedIcon fontSize="small" />}
                        label="Source"
                        value={lead.source}
                      />
                    </Stack>
                  </Paper>

                  <Paper variant="outlined" sx={{ p: 3 }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 12 }}
                    >
                      Details
                    </Typography>
                    <Stack spacing={2}>
                      <InfoRow
                        icon={<CalendarMonthRoundedIcon fontSize="small" />}
                        label="Added"
                        value={formatDate(lead.created_at)}
                      />
                      <InfoRow
                        icon={<UpdateRoundedIcon fontSize="small" />}
                        label="Last updated"
                        value={formatDateTime(lead.updated_at)}
                      />
                    </Stack>
                  </Paper>
                </Stack>
              </Grid>

              {/* Notes */}
              <Grid size={{ xs: 12, md: 7 }}>
                <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 12 }}
                  >
                    Notes
                  </Typography>
                  <TextField
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Anything worth remembering about this lead…"
                    multiline
                    minRows={8}
                    fullWidth
                  />
                  <Button variant="contained" onClick={handleSaveNotes} disabled={saving} sx={{ mt: 2 }}>
                    {saving ? 'Saving…' : 'Save notes'}
                  </Button>
                </Paper>
              </Grid>
            </Grid>
          </Stack>
        )}
      </Container>

      <Footer />
    </Box>
  )
}
