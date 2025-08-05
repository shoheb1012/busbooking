package com.quickbus.busbooking.repository;




import com.quickbus.busbooking.entity.CancellationRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CancellationRecordRepository extends JpaRepository<CancellationRecord, Long> {

    // Find all cancellations for a specific booking
    List<CancellationRecord> findByBookingId(Long bookingId);

    // Find cancellations by user
    List<CancellationRecord> findByCancelledBy(String cancelledBy);

    // Find cancellations by refund status
    List<CancellationRecord> findByRefundStatus(String refundStatus);

    // Find pending refunds
    List<CancellationRecord> findByRefundStatusOrderByCancellationTimeAsc(String refundStatus);

    // Find cancellations within date range
    List<CancellationRecord> findByCancellationTimeBetween(LocalDateTime startDate, LocalDateTime endDate);

    // Get total refund amount for a booking
    @Query("SELECT COALESCE(SUM(cr.refundAmount), 0) FROM CancellationRecord cr WHERE cr.bookingId = :bookingId")
    Double getTotalRefundAmountByBookingId(@Param("bookingId") Long bookingId);

    // Get total cancelled seats for a booking
    @Query("SELECT COALESCE(SUM(cr.seatsCancelled), 0) FROM CancellationRecord cr WHERE cr.bookingId = :bookingId")
    Integer getTotalCancelledSeatsByBookingId(@Param("bookingId") Long bookingId);

    // Check if booking has any cancellations
    boolean existsByBookingId(Long bookingId);

    // Get cancellation statistics for date range
    @Query("SELECT " +
            "COUNT(cr) as totalCancellations, " +
            "SUM(cr.seatsCancelled) as totalSeatsCancelled, " +
            "SUM(cr.refundAmount) as totalRefundAmount " +
            "FROM CancellationRecord cr " +
            "WHERE cr.cancellationTime BETWEEN :startDate AND :endDate")
    Object[] getCancellationStats(@Param("startDate") LocalDateTime startDate,
                                  @Param("endDate") LocalDateTime endDate);
}