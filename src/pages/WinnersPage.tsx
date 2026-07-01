import { useEffect } from 'react';
import { Box, Chip, CircularProgress, Pagination, Stack, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchWinners, setPage, WINNERS_PAGE_SIZE } from '../store/slices/winnersSlice';
import { CarIcon } from '../components/CarIcon';
import type { WinnerWithCar } from '../types/winner';

const PODIUM_SIZE = 3;
const GOLD_RANK = 1;
const SILVER_RANK = 2;
const DIMMED_RANK_OPACITY = 0.45;
const TIME_DECIMAL_PLACES = 2;
const CAR_ICON_SIZE = 52;

const COL = {
  rank: '36px',
  car: '64px',
  name: '1fr',
  wins: '56px',
  time: '72px',
};

const GRID = `${COL.rank} ${COL.car} ${COL.name} ${COL.wins} ${COL.time}`;

const HEADER_LABELS = ['#', 'Car', 'Name', 'Wins', 'Best time'];

const WINS_CHIP_SX = {
  height: 20,
  fontSize: '0.7rem',
  fontWeight: 700,
  bgcolor: 'rgba(249,115,22,0.18)',
  color: '#f97316',
  border: '1px solid rgba(249,115,22,0.35)',
  '& .MuiChip-label': { px: 1 },
} as const;

const TIME_SX = {
  textAlign: 'right',
  color: '#34d399',
  fontWeight: 600,
  fontVariantNumeric: 'tabular-nums',
} as const;

const PAGINATION_SX = {
  '& .MuiPaginationItem-root': { color: '#f8fafc' },
  '& .Mui-selected': { background: 'rgba(249,115,22,0.3) !important' },
} as const;

function rankLabel(rank: number): string {
  if (rank === GOLD_RANK) return '🥇';
  if (rank === SILVER_RANK) return '🥈';
  if (rank === PODIUM_SIZE) return '🥉';
  return String(rank);
}

function WinsChip({ wins }: { wins: number }) {
  return (
    <Stack direction="row" justifyContent="flex-end" alignItems="center">
      <Chip label={wins} size="small" sx={WINS_CHIP_SX} />
    </Stack>
  );
}

function TimeStat({ time }: { time: number }) {
  return (
    <Typography variant="body2" sx={TIME_SX}>
      {time.toFixed(TIME_DECIMAL_PLACES)}s
    </Typography>
  );
}

interface WinnerRowProps {
  winner: WinnerWithCar;
  rank: number;
}

function WinnerRow({ winner, rank }: WinnerRowProps) {
  return (
    <Box component="li" className="list-item">
      <Box sx={{ display: 'grid', gridTemplateColumns: GRID, alignItems: 'center', gap: 1 }}>
        <Typography
          variant="body2"
          fontWeight={700}
          sx={{ opacity: rank <= PODIUM_SIZE ? 1 : DIMMED_RANK_OPACITY }}
        >
          {rankLabel(rank)}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CarIcon color={winner.color} size={CAR_ICON_SIZE} />
        </Box>
        <Typography variant="body2" fontWeight={600} sx={{ color: winner.color }}>
          {winner.name}
        </Typography>
        <WinsChip wins={winner.wins} />
        <TimeStat time={winner.time} />
      </Box>
    </Box>
  );
}

function WinnersTableHeader() {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: GRID,
        alignItems: 'center',
        gap: 1,
        mt: 2,
        px: '12px',
        pb: 1,
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {HEADER_LABELS.map((label) => (
        <Typography
          key={label}
          variant="caption"
          sx={{
            opacity: 0.4,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontSize: '0.65rem',
            textAlign: label === 'Wins' || label === 'Best time' ? 'right' : 'left',
          }}
        >
          {label}
        </Typography>
      ))}
    </Box>
  );
}

interface WinnersTableProps {
  winners: WinnerWithCar[];
  rankOffset: number;
}

function WinnersTable({ winners, rankOffset }: WinnersTableProps) {
  return (
    <>
      <WinnersTableHeader />
      <Box component="ul" className="list" sx={{ listStyle: 'none', p: 0, m: 0, mt: 1 }}>
        {winners.map((winner, idx) => (
          <WinnerRow key={winner.id} winner={winner} rank={rankOffset + idx + 1} />
        ))}
      </Box>
    </>
  );
}

interface WinnersStatusBodyProps {
  status: 'idle' | 'loading' | 'failed';
  winners: WinnerWithCar[];
  rankOffset: number;
}

function WinnersStatusBody({ status, winners, rankOffset }: WinnersStatusBodyProps) {
  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <CircularProgress size={32} sx={{ color: '#f97316' }} />
      </Box>
    );
  }
  if (status === 'failed') {
    return (
      <Typography sx={{ mt: 2, color: '#f87171' }}>
        Failed to load winners — is the API server running on port 3000?
      </Typography>
    );
  }
  if (winners.length === 0) {
    return (
      <Typography sx={{ mt: 2, opacity: 0.5 }}>No winners yet — race some cars first!</Typography>
    );
  }
  return <WinnersTable winners={winners} rankOffset={rankOffset} />;
}

interface WinnersHeadingProps {
  status: 'idle' | 'loading' | 'failed';
  total: number;
}

function WinnersHeading({ status, total }: WinnersHeadingProps) {
  return (
    <Box className="page-heading">
      <Box>
        <Typography variant="overline" className="page-kicker">
          Champion board
        </Typography>
        <Typography variant="h4" component="h2">
          Winners
        </Typography>
      </Box>
      <Chip
        label={status === 'loading' ? '…' : `${total} winners`}
        color="warning"
        variant="outlined"
      />
    </Box>
  );
}

interface WinnersPaginationProps {
  pageCount: number;
  page: number;
  onPageChange: (event: React.ChangeEvent<unknown>, value: number) => void;
}

function WinnersPagination({ pageCount, page, onPageChange }: WinnersPaginationProps) {
  if (pageCount <= 1) return null;
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
      <Pagination count={pageCount} page={page} onChange={onPageChange} sx={PAGINATION_SX} />
    </Box>
  );
}

function WinnersPage() {
  const dispatch = useAppDispatch();
  const { winners, total, page, status } = useAppSelector((state) => state.winners);
  const pageCount = Math.ceil(total / WINNERS_PAGE_SIZE);
  const rankOffset = (page - 1) * WINNERS_PAGE_SIZE;

  useEffect(() => {
    void dispatch(fetchWinners());
  }, [dispatch, page]);

  return (
    <Box component="section" className="page-card winners-card">
      <WinnersHeading status={status} total={total} />

      <Typography variant="body1">
        Review the finished races and celebrate the fastest drivers.
      </Typography>

      <WinnersStatusBody status={status} winners={winners} rankOffset={rankOffset} />

      <WinnersPagination
        pageCount={pageCount}
        page={page}
        onPageChange={(_e, p) => {
          dispatch(setPage(p));
        }}
      />
    </Box>
  );
}

export default WinnersPage;
