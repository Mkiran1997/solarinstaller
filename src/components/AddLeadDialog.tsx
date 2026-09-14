import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { LeadForm } from './LeadForm'
import type { NewLeadInput } from '../types/lead'

interface AddLeadDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (input: NewLeadInput) => Promise<void>
}

export function AddLeadDialog({ open, onClose, onSubmit }: AddLeadDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Add a new lead
        <IconButton onClick={onClose} size="small" aria-label="Close">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <LeadForm onSubmit={onSubmit} onCancel={onClose} />
      </DialogContent>
    </Dialog>
  )
}
