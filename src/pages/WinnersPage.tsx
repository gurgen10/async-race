import { useEffect } from 'react';
import { Box, Chip, CircularProgress, Pagination, Stack, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchWinners, setPage, setSort, WINNERS_PAGE_SIZE } from '../store/slices/winnersSlice';
import type { WinnerSortField, SortOrder } from '../api/winnersApi';
import { CarIcon } from '../components/CarIcon';
import type { WinnerWithCar } from '../types/winner';

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

const HEADER_LABELS = ['№', 'Car', 'Name', 'Wins', 'Best time'] as const;
type HeaderLabel = (typeof HEADER_LABELS)[number];

const SORTABLE: Record<string, WinnerSortField | undefined> = {
  '№': 'id',
  Wins: 'wins',
  'Best time': 'time',
};

const HEADER_BOX_SX = {
  display: 'grid',
  gridTemplateColumns: GRID,
  alignItems: 'center',
  gap: 1,
  mt: 2,
  px: '12px',
  pb: 1,
  borderBottom: '1px solid rgba(255,255,255,0.08)',
} as const;

const HEADER_LABEL_SX = {
  opacity: 0.4,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  fontSize: '0.65rem',
} as const;

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

function WinnerRow({ winner }: { winner: WinnerWithCar }) {
  return (
    <Box component="li" className="list-item">
      <Box sx={{ display: 'grid', gridTemplateColumns: GRID, alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" fontWeight={700} sx={{ textAlign: 'right' }}>
          {winner.id}
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

interface SortIndicatorProps {
  field: WinnerSortField;
  sort: WinnerSortField;
  order: SortOrder;
}

function SortIndicator({ field, sort, order }: SortIndicatorProps) {
  if (sort !== field) return <span className="sort-icon-idle">⇅</span>;
  return <span>{order === 'ASC' ? '↑' : '↓'}</span>;
}

interface WinnersTableHeaderProps {
  sort: WinnerSortField;
  order: SortOrder;
  onSort: (field: WinnerSortField) => void;
}

function WinnersTableHeader({ sort, order, onSort }: WinnersTableHeaderProps) {
  return (
    <Box sx={HEADER_BOX_SX}>
      {HEADER_LABELS.map((label: HeaderLabel) => {
        const sortField = SORTABLE[label];
        if (sortField) {
          return (
            <button
              type="button"
              key={label}
              onClick={() => {
                onSort(sortField);
              }}
              className={`sort-col-btn${sort === sortField ? ' active' : ''}`}
            >
              {label}
              <SortIndicator field={sortField} sort={sort} order={order} />
            </button>
          );
        }
        return (
          <Typography key={label} variant="caption" sx={HEADER_LABEL_SX}>
            {label}
          </Typography>
        );
      })}
    </Box>
  );
}

interface WinnersTableProps {
  winners: WinnerWithCar[];
  sort: WinnerSortField;
  order: SortOrder;
  onSort: (field: WinnerSortField) => void;
}

function WinnersTable({ winners, sort, order, onSort }: WinnersTableProps) {
  return (
    <>
      <WinnersTableHeader sort={sort} order={order} onSort={onSort} />
      <Box component="ul" className="list" sx={{ listStyle: 'none', p: 0, m: 0, mt: 1 }}>
        {winners.map((winner) => (
          <WinnerRow key={winner.id} winner={winner} />
        ))}
      </Box>
    </>
  );
}

interface WinnersStatusBodyProps {
  status: 'idle' | 'loading' | 'failed';
  winners: WinnerWithCar[];
  sort: WinnerSortField;
  order: SortOrder;
  onSort: (field: WinnerSortField) => void;
}

function WinnersStatusBody({ status, winners, sort, order, onSort }: WinnersStatusBodyProps) {
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
  return <WinnersTable winners={winners} sort={sort} order={order} onSort={onSort} />;
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
  const { winners, total, page, status, sort, order } = useAppSelector((state) => state.winners);
  const pageCount = Math.ceil(total / WINNERS_PAGE_SIZE);
  const onSort = (field: WinnerSortField) => dispatch(setSort(field));

  useEffect(() => {
    void dispatch(fetchWinners());
  }, [dispatch, page, sort, order]);

  return (
    <Box component="section" className="page-card winners-card">
      <WinnersHeading status={status} total={total} />

      <Typography variant="body1">
        Review the finished races and celebrate the fastest drivers.
      </Typography>

      <WinnersStatusBody
        status={status}
        winners={winners}
        sort={sort}
        order={order}
        onSort={onSort}
      />

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
