import { useEffect } from 'react';
import { Box, Chip, CircularProgress, Pagination, Stack, Typography } from '@mui/material';
import './WinnersPage.css';
import { useAppDispatch, useAppSelector } from '../../shared/store/hooks';
import { fetchWinners, setPage, setSort, WINNERS_PAGE_SIZE } from './winnersSlice';
import type { WinnerSortField, SortOrder } from './winnersApi';
import { CarIcon } from '../../shared/components/CarIcon';
import type { WinnerWithCar } from '../../shared/types/winner';
import { PAGINATION_SX } from '../../shared/styles';
import { CAR_ICON_SIZE, GRID, HEADER_LABELS, SORTABLE, TIME_DECIMAL_PLACES } from '../../shared/constants';
import { HEADER_BOX_SX, HEADER_LABEL_SX, TIME_SX, WINS_CHIP_SX } from './WinnersPage.styles';

type HeaderLabel = (typeof HEADER_LABELS)[number];

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

// Fix #7: accept rank (1-based visual position) instead of relying on winner.id
function WinnerRow({ winner, rank }: { winner: WinnerWithCar; rank: number }) {
  return (
    <Box component="li" className="list-item">
      <Box sx={{ display: 'grid', gridTemplateColumns: GRID, alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" fontWeight={700} sx={{ textAlign: 'right' }}>
          {rank}
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
  page: number;
  onSort: (field: WinnerSortField) => void;
}

function WinnersTable({ winners, sort, order, page, onSort }: WinnersTableProps) {
  return (
    <>
      <WinnersTableHeader sort={sort} order={order} onSort={onSort} />
      <Box component="ul" className="list" sx={{ listStyle: 'none', p: 0, m: 0, mt: 1 }}>
        {winners.map((winner, index) => (
          <WinnerRow key={winner.id} winner={winner} rank={(page - 1) * WINNERS_PAGE_SIZE + index + 1} />
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
  page: number;
  onSort: (field: WinnerSortField) => void;
}

function WinnersStatusBody({ status, winners, sort, order, page, onSort }: WinnersStatusBodyProps) {
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
  return <WinnersTable winners={winners} sort={sort} order={order} page={page} onSort={onSort} />;
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
        page={page}
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
