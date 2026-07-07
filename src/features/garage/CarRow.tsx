import { Box, Stack } from '@mui/material';
import type { Car } from '../../shared/types/car';
import { useCarRow } from './hooks/useCarRow';
import { RaceTrack } from './components/RaceTrack';
import { CarRowButtons } from './components/CarRowButtons';
import { DeleteDialog } from '../../shared/components/DeleteDialog';

interface CarRowProps {
  car: Car;
  onEdit: (id: number, name: string, color: string) => void;
}

export function CarRow({ car, onEdit }: CarRowProps) {
  const view = useCarRow(car, onEdit);

  return (
    <Box component="li" className="list-item" sx={view.selectedSx}>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <CarRowButtons
          isRunning={view.isRunning}
          canStart={view.canStart}
          canReset={view.canReset}
          isSelected={view.isSelected}
          isRacing={view.isRacing}
          onStart={view.onStart}
          onStop={view.onStop}
          onReset={view.onReset}
          onEdit={view.onEditClick}
          onDeleteRequest={view.onDeleteRequest}
        />
        <RaceTrack
          trackRef={view.trackRef}
          carRef={view.carRef}
          car={car}
          isBroken={view.isBroken}
          isWinner={view.isWinner}
        />
      </Stack>

      <DeleteDialog
        open={view.confirmOpen}
        carName={car.name}
        carColor={car.color}
        onConfirm={view.handleDelete}
        onClose={view.onCloseDelete}
      />
    </Box>
  );
}
