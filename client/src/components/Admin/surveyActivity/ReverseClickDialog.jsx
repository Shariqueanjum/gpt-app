import { useState, useEffect } from 'react'
import { TextField, Typography } from '@mui/material'
import { ActionDialog } from '../AdminUiKit'
import ClickSummaryLines from './ClickSummaryLines'
import { formatPoints, formatDollar } from './surveyActivityConstants'

const ReverseClickDialog = ({ row, open, onClose, onConfirm, loading, error, COLORS }) => {
  const [reason, setReason] = useState('')

  // Fresh form every time the dialog opens for a (possibly different) click
  useEffect(() => { if (open) setReason('') }, [open, row?.id])

  return (
    <ActionDialog
      open={open}
      onClose={onClose}
      title="Reverse this survey?"
      onConfirm={() => onConfirm(reason.trim())}
      confirmLabel="Reverse survey"
      danger
      loading={loading}
      COLORS={COLORS}
      error={error}
    >
      {row && (
        <>
          <ClickSummaryLines COLORS={COLORS} lines={[
            { label: 'User', value: row.username },
            { label: 'Offer wall', value: row.offer_wall_name },
            { label: 'Our ID', value: row.transaction_id },
            { label: 'External ID', value: row.external_transaction_id },
            { label: 'Will deduct', value: `${formatPoints(row.cpa_user)} (${formatDollar(row.cpa_user)})` },
          ]} />
          <Typography sx={{ fontSize: '0.82rem', color: COLORS.textSecondary, mb: 1.6 }}>
            This takes the points back from <strong>{row.username}</strong> (and any referral commission earned from this survey).
            A survey can be reversed once. You can undo it afterwards, also once.
          </Typography>
          <TextField fullWidth size="small" label="Reason (optional)" value={reason}
            onChange={(e) => setReason(e.target.value)} multiline minRows={2} slotProps={{ htmlInput: { maxLength: 500 } }} />
        </>
      )}
    </ActionDialog>
  )
}

export default ReverseClickDialog
