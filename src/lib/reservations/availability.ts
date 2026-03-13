import { Prisma, PrismaClient } from '@prisma/client';
import { db } from '@/lib/db';
import {
  createSeatAvailabilitySnapshot,
  parseStoredGuestCount,
  type SeatAvailabilitySnapshot,
} from '@/lib/reservations/capacity';

const NON_BLOCKING_RESERVATION_STATUSES = new Set(['CANCELLED', 'DECLINED', 'REJECTED']);

type ReservationAvailabilityClient = Pick<PrismaClient, 'reservationRequest'> | Prisma.TransactionClient;

export async function getSeatAvailabilityForDate(
  date: string,
  client: ReservationAvailabilityClient = db
): Promise<SeatAvailabilitySnapshot> {
  const reservations = await client.reservationRequest.findMany({
    where: { date },
    select: {
      guests: true,
      status: true,
    },
  });

  const reservedSeats = reservations.reduce((sum, reservation) => {
    if (NON_BLOCKING_RESERVATION_STATUSES.has(reservation.status.toUpperCase())) {
      return sum;
    }

    return sum + (parseStoredGuestCount(reservation.guests) ?? 0);
  }, 0);

  return createSeatAvailabilitySnapshot(reservedSeats);
}
