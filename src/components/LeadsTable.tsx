import { Link as RouterLink, useNavigate } from 'react-router-dom'
import {
  Avatar,
  Box,
  IconButton,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import { StageControl } from './StageControl'
import { formatDate } from '../lib/formatDate'
import type { Lead, LeadStage } from '../types/lead'

interface LeadsTableProps {
  leads: Lead[]
  onStageChange: (lead: Lead, stage: LeadStage) => void
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

export function LeadsTable({ leads, onStageChange }: LeadsTableProps) {
  const navigate = useNavigate()

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table sx={{ minWidth: 640 }}>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Contact</TableCell>
            <TableCell>Source</TableCell>
            <TableCell>Added</TableCell>
            <TableCell>Stage</TableCell>
            <TableCell align="right">Details</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {leads.map((lead) => (
            <TableRow
              key={lead.id}
              hover
              sx={{ '&:last-of-type td': { border: 0 } }}
            >
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light', fontSize: 13 }}>
                    {initials(lead.name)}
                  </Avatar>
                  <Link
                    component={RouterLink}
                    to={`/leads/${lead.id}`}
                    underline="hover"
                    color="text.primary"
                    sx={{ fontWeight: 600 }}
                  >
                    {lead.name}
                  </Link>
                </Box>
              </TableCell>
              <TableCell>
                {lead.email && <Typography variant="body2">{lead.email}</Typography>}
                {lead.phone && (
                  <Typography variant="body2" color="text.secondary">
                    {lead.phone}
                  </Typography>
                )}
                {!lead.email && !lead.phone && (
                  <Typography variant="body2" color="text.disabled">
                    —
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {lead.source || '—'}
                </Typography>
              </TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(lead.created_at)}
                </Typography>
              </TableCell>
              <TableCell>
                <StageControl value={lead.stage} onChange={(stage) => onStageChange(lead, stage)} />
              </TableCell>
              <TableCell align="right">
                <Tooltip title="View lead details">
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/leads/${lead.id}`)}
                    sx={{
                      bgcolor: 'action.hover',
                      '&:hover': { bgcolor: 'primary.main', color: 'primary.contrastText' },
                    }}
                  >
                    <VisibilityRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
