import { Chip, MenuItem, Select, type SelectChangeEvent } from '@mui/material'
import { LEAD_STAGES, LEAD_STAGE_LABELS, type LeadStage } from '../types/lead'

interface StageControlProps {
  value: LeadStage
  onChange: (stage: LeadStage) => void
  disabled?: boolean
}

const STAGE_COLOR: Record<LeadStage, 'default' | 'warning' | 'success'> = {
  new: 'default',
  contacted: 'warning',
  signed: 'success',
}

export function StageControl({ value, onChange, disabled }: StageControlProps) {
  function handleChange(e: SelectChangeEvent) {
    onChange(e.target.value as LeadStage)
  }

  return (
    <Select
      value={value}
      onChange={handleChange}
      disabled={disabled}
      variant="standard"
      disableUnderline
      renderValue={(v) => (
        <Chip
          label={LEAD_STAGE_LABELS[v as LeadStage]}
          color={STAGE_COLOR[v as LeadStage]}
          size="small"
          sx={{ cursor: 'pointer' }}
        />
      )}
      sx={{
        '.MuiSelect-select': { display: 'flex', alignItems: 'center', py: 0, pr: '24px !important' },
      }}
    >
      {LEAD_STAGES.map((stage) => (
        <MenuItem key={stage} value={stage}>
          <Chip label={LEAD_STAGE_LABELS[stage]} color={STAGE_COLOR[stage]} size="small" />
        </MenuItem>
      ))}
    </Select>
  )
}
