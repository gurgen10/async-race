import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  Pagination,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { CarIcon } from '../../shared/components/CarIcon';
import { useAppDispatch, useAppSelector } from '../../shared/store/hooks';
import { setPage, GARAGE_PAGE_SIZE } from './garageSlice';
import { beginRace, clearWinner, resetAllCars } from '../race/raceSlice';
import { CarRow } from './CarRow';
import { WinnerModal } from '../winners/WinnerModal';
import type { Car } from '../../shared/types/car';
import { MODAL_PAPER_SX, PAGINATION_SX } from '../../shared/styles';
import { CREATED_CAR_ICON_SIZE, RACE_LOCK_OPACITY } from '../../shared/constants';
import { CREATED_CAR_BTN_SX, FORM_BOX_SX, INPUT_SX } from './GaragePage.styles';
import { useGarageForm } from './hooks/useGarageForm';
import { useResetOnMount, useGaragePageEffects, useGaragePageDerived } from './hooks/useGaragePage';

interface CreatedCarModalProps {
  open: boolean;
  car: Car;
  onClose: () => void;
}

function CreatedCarModal({ open, car, onClose }: CreatedCarModalProps) {
  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: MODAL_PAPER_SX }}>
      <DialogContent sx={{ pt: 4, pb: 3, px: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <CarIcon color={car.color} size={CREATED_CAR_ICON_SIZE} />
        </Box>
        <Typography variant="h6" fontWeight={700} sx={{ color: car.color }}>
          {car.name}
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.5 }}>
          Added to the garage!
        </Typography>
        <Button variant="contained" fullWidth onClick={onClose} sx={{ mt: 3, ...CREATED_CAR_BTN_SX }}>
          Let&apos;s go!
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function ColorPicker({ color, onChange }: { color: string; onChange: (v: string) => void }) {
  return (
    <Box
      component="label"
      title="Pick a colour"
      sx={{
        width: 38,
        height: 38,
        borderRadius: '50%',
        background: color,
        border: '2.5px solid rgba(255,255,255,0.25)',
        cursor: 'pointer',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color 0.2s',
        '&:hover': { borderColor: 'rgba(255,255,255,0.55)' },
      }}
    >
      <Box
        component="input"
        type="color"
        value={color}
        onChange={(e) => { onChange(e.target.value); }}
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0,
          cursor: 'pointer',
          width: '100%',
          height: '100%',
        }}
      />
    </Box>
  );
}

interface CreateUpdateButtonProps {
  isEditing: boolean;
  formName: string;
  isRacing: boolean;
  onCreate: () => void;
  onUpdate: () => void;
}

function CreateUpdateButton({ isEditing, formName, isRacing, onCreate, onUpdate }: CreateUpdateButtonProps) {
  const isDisabled = !formName.trim() || isRacing;
  if (isEditing) {
    return (
      <Button
        variant="contained"
        onClick={onUpdate}
        disabled={isDisabled}
        sx={{
          borderRadius: 999,
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          flexShrink: 0,
          whiteSpace: 'nowrap',
          '&.Mui-disabled': { opacity: 0.4, color: 'white' },
        }}
      >
        Update
      </Button>
    );
  }
  return (
    <Button
      variant="contained"
      onClick={onCreate}
      disabled={isDisabled}
      sx={{
        borderRadius: 999,
        background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
        flexShrink: 0,
        '&.Mui-disabled': { opacity: 0.4, color: 'white' },
      }}
    >
      Create
    </Button>
  );
}

interface CancelButtonProps {
  formName: string;
  isEditing: boolean;
  onCancel: () => void;
}

function CancelButton({ formName, isEditing, onCancel }: CancelButtonProps) {
  return (
    <Button
      variant="outlined"
      onClick={onCancel}
      disabled={!formName.trim() && !isEditing}
      sx={{
        borderRadius: 999,
        flexShrink: 0,
        borderColor: 'rgba(148,163,184,0.35)',
        color: '#64748b',
        '&:hover': { borderColor: '#94a3b8', bgcolor: 'rgba(148,163,184,0.08)', color: '#94a3b8' },
        '&.Mui-disabled': { borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.15)' },
      }}
    >
      Cancel
    </Button>
  );
}

interface GarageFormProps {
  formName: string;
  formColor: string;
  isEditing: boolean;
  isRacing: boolean;
  onNameChange: (v: string) => void;
  onColorChange: (v: string) => void;
  onCreate: () => void;
  onUpdate: () => void;
  onCancel: () => void;
}

function GarageForm({
  formName,
  formColor,
  isEditing,
  isRacing,
  onNameChange,
  onColorChange,
  onCreate,
  onUpdate,
  onCancel,
}: GarageFormProps) {
  return (
    <Box sx={FORM_BOX_SX}>
      <ColorPicker color={formColor} onChange={onColorChange} />
      <TextField
        size="small"
        value={formName}
        onChange={(e) => { onNameChange(e.target.value); }}
        placeholder="Car name"
        onKeyDown={(e) => {
          if (e.key !== 'Enter') return;
          if (isEditing) onUpdate();
          else onCreate();
        }}
        sx={{ flex: 1, minWidth: 150, ...INPUT_SX }}
      />
      <CreateUpdateButton
        isEditing={isEditing}
        formName={formName}
        isRacing={isRacing}
        onCreate={onCreate}
        onUpdate={onUpdate}
      />
      <CancelButton formName={formName} isEditing={isEditing} onCancel={onCancel} />
    </Box>
  );
}

function RaceButton({ canRace, isRacing, onRace }: { canRace: boolean; isRacing: boolean; onRace: () => void }) {
  return (
    <Button
      variant="contained"
      color="secondary"
      className="action-secondary"
      disabled={!canRace || isRacing}
      onClick={onRace}
      startIcon={<Box component="span" sx={{ fontSize: '0.7rem', lineHeight: 1 }}>▶</Box>}
      sx={{ '&.Mui-disabled': { opacity: 0.4, color: 'white' } }}
    >
      Race
    </Button>
  );
}

function ResetButton({ canReset, onReset }: { canReset: boolean; onReset: () => void }) {
  return (
    <Button
      variant="outlined"
      disabled={!canReset}
      onClick={onReset}
      startIcon={<Box component="span" sx={{ fontSize: '0.95rem', lineHeight: 1 }}>↺</Box>}
      sx={{
        borderRadius: 999,
        borderColor: canReset ? 'rgba(148,163,184,0.5)' : 'rgba(255,255,255,0.12)',
        color: canReset ? '#94a3b8' : 'rgba(255,255,255,0.25)',
        '&:hover': { borderColor: '#94a3b8', bgcolor: 'rgba(148,163,184,0.1)' },
        '&.Mui-disabled': { borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.2)' },
      }}
    >
      Reset
    </Button>
  );
}

function GenerateButton({ disabled, onGenerate }: { disabled: boolean; onGenerate: () => void }) {
  return (
    <Button
      variant="outlined"
      onClick={onGenerate}
      disabled={disabled}
      sx={{
        borderRadius: 999,
        borderColor: 'rgba(249,115,22,0.4)',
        color: '#f97316',
        fontSize: '0.75rem',
        marginLeft: '0 !important',
        '&:hover': { borderColor: '#f97316', bgcolor: 'rgba(249,115,22,0.08)' },
        '&.Mui-disabled': { opacity: 0.4, borderColor: 'rgba(249,115,22,0.2)', color: '#f97316' },
      }}
    >
      Generate 100 Random Cars
    </Button>
  );
}

interface RaceControlsProps {
  canRace: boolean;
  canReset: boolean;
  isRacing: boolean;
  onRace: () => void;
  onReset: () => void;
  onGenerate: () => void;
}

function RaceControls({ canRace, canReset, isRacing, onRace, onReset, onGenerate }: RaceControlsProps) {
  return (
    <Stack direction="row" spacing={1.5} className="page-actions">
      <RaceButton canRace={canRace} isRacing={isRacing} onRace={onRace} />
      <ResetButton canReset={canReset} onReset={onReset} />
      <Box sx={{ flex: 1 }} />
      <GenerateButton disabled={isRacing} onGenerate={onGenerate} />
    </Stack>
  );
}

function GarageHeading({ status, total }: { status: string; total: number }) {
  return (
    <Box className="page-heading">
      <Typography variant="h4" component="h2">
        Garage
      </Typography>
      <Chip
        label={status === 'loading' ? '…' : `${total} cars`}
        color="success"
        variant="outlined"
      />
    </Box>
  );
}

interface GarageStatusBodyProps {
  status: 'idle' | 'loading' | 'failed';
  cars: Car[];
  onEdit: (id: number, name: string, color: string) => void;
}

function GarageStatusBody({ status, cars, onEdit }: GarageStatusBodyProps) {
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
        Failed to load cars — Make sure the API server is running and reachable at the configured URL.
      </Typography>
    );
  }
  if (cars.length === 0) {
    return <Typography sx={{ mt: 2, opacity: 0.5 }}>No cars in the garage yet.</Typography>;
  }
  return (
    <Box component="ul" className="list" sx={{ listStyle: 'none', p: 0, m: 0, mt: 2 }}>
      {cars.map((car) => (
        <CarRow key={car.id} car={car} onEdit={onEdit} />
      ))}
    </Box>
  );
}

interface GaragePaginationProps {
  pageCount: number;
  page: number;
  isRacing: boolean;
  onChange: (page: number) => void;
}

function GaragePagination({ pageCount, page, isRacing, onChange }: GaragePaginationProps) {
  if (pageCount <= 1) return null;
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
      <Box sx={{ opacity: isRacing ? RACE_LOCK_OPACITY : 1, pointerEvents: isRacing ? 'none' : 'auto' }}>
        <Pagination
          count={pageCount}
          page={page}
          onChange={(_e, p) => { onChange(p); }}
          sx={PAGINATION_SX}
        />
      </Box>
    </Box>
  );
}

interface GarageWinnerSectionProps {
  winnerCar: Car | null;
  winnerTime: number | null;
  open: boolean;
  onClose: () => void;
}

function GarageWinnerSection({ winnerCar, winnerTime, open, onClose }: GarageWinnerSectionProps) {
  if (!winnerCar || winnerTime === null) return null;
  return (
    <WinnerModal
      open={open}
      winnerName={winnerCar.name}
      winnerColor={winnerCar.color}
      winnerTime={winnerTime}
      onClose={onClose}
    />
  );
}

interface GarageControlsSectionProps {
  form: ReturnType<typeof useGarageForm>;
  derived: ReturnType<typeof useGaragePageDerived>;
  isRacing: boolean;
}

function GarageControlsSection({ form, derived, isRacing }: GarageControlsSectionProps) {
  const dispatch = useAppDispatch();
  return (
    <>
      <GarageForm
        formName={form.formName}
        formColor={form.formColor}
        isEditing={!!form.selectedCar}
        isRacing={isRacing}
        onNameChange={form.setFormName}
        onColorChange={form.setFormColor}
        onCreate={form.handleCreate}
        onUpdate={form.handleUpdate}
        onCancel={form.handleCancel}
      />
      <RaceControls
        canRace={derived.canRace}
        canReset={derived.canReset}
        isRacing={isRacing}
        onRace={() => { void dispatch(beginRace(derived.carIds)); }}
        onReset={() => { void dispatch(resetAllCars(derived.carIds)); }}
        onGenerate={form.handleGenerateCars}
      />
    </>
  );
}

function GaragePage() {
  const dispatch = useAppDispatch();
  const { cars, total, page, status } = useAppSelector((state) => state.garage);
  const raceState = useAppSelector((state) => state.race);
  const pageCount = Math.ceil(total / GARAGE_PAGE_SIZE);

  const form = useGarageForm(dispatch);
  useResetOnMount(dispatch);
  useGaragePageEffects(dispatch, page, raceState.winnerId, raceState.winnerTime);
  const derived = useGaragePageDerived(cars, raceState);

  return (
    <Box component="section" className="page-card garage-card">
      <GarageHeading status={status} total={total} />
      <GarageControlsSection form={form} derived={derived} isRacing={raceState.isRacing} />
      <GarageStatusBody status={status} cars={cars} onEdit={form.handleEditCar} />
      <GaragePagination
        pageCount={pageCount}
        page={page}
        isRacing={raceState.isRacing}
        onChange={(p) => { dispatch(setPage(p)); }}
      />
      <GarageWinnerSection
        winnerCar={derived.winnerCar}
        winnerTime={raceState.winnerTime}
        open={derived.modalOpen}
        onClose={() => { dispatch(clearWinner()); }}
      />
      {form.createdCar !== null && (
        <CreatedCarModal open car={form.createdCar} onClose={form.clearCreatedCar} />
      )}
    </Box>
  );
}

export default GaragePage;
