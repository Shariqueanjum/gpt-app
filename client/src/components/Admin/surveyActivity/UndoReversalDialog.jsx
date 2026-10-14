import { Typography } from '@mui/material'
import { ActionDialog } from '../AdminUiKit'
import ClickSummaryLines from './ClickSummaryLines'
import { formatPoints, formatDollar } from './surveyActivityConstants'

const UndoReversalDialog = ({ row, open, onClose, onConfirm, loading, error, COLORS }) => {
  // reversed_amount is stored as a negative number on the reversal transaction
  const restored = Math.abs(Number(row?.reversed_amount ?? row?.cpa_user ?? 0))

  return (
    <ActionDialog
      open={open}
      onClose={onClose}
      title="Undo this reversal?"
      onConfirm={onConfirm}
      confirmLabel="Undo reversal"
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
            { label: 'Will restore', value: `${formatPoints(restored)} (${formatDollar(restored)})` },
          ]} />
          <Typography sx={{ fontSize: '0.82rem', color: COLORS.textSecondary }}>
            The points go back to <strong>{row.username}</strong> and the survey becomes Completed again.
            A reversal can only be undone once, and after an undo this survey cannot be reversed a second time.
          </Typography>
        </>
      )}
    </ActionDialog>
  )
}

export default UndoReversalDialog
