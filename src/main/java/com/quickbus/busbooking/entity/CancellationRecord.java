package com.quickbus.busbooking.entity;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "cancellation_records")
public class CancellationRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_id", nullable = false)
    private Long bookingId;

    @Column(name = "seats_cancelled", nullable = false)
    private Integer seatsCancelled;

    @Column(name = "refund_amount", nullable = false)
    private Double refundAmount;

    @Column(name = "cancellation_time", nullable = false)
    private LocalDateTime cancellationTime;

    @Column(name = "refund_status", length = 20)
    private String refundStatus; // PENDING, PROCESSED, FAILED

    @Column(name = "refund_processed_time")
    private LocalDateTime refundProcessedTime;

    @Column(name = "cancelled_by")
    private String cancelledBy; // User ID or username

    // Default constructor
    public CancellationRecord() {
        this.cancellationTime = LocalDateTime.now();
        this.refundStatus = "PENDING";
    }

    // Constructor with required fields
    public CancellationRecord(Long bookingId, Integer seatsCancelled, Double refundAmount) {
        this();
        this.bookingId = bookingId;
        this.seatsCancelled = seatsCancelled;
        this.refundAmount = refundAmount;
    }

    // Constructor with all fields
    public CancellationRecord(Long bookingId, Integer seatsCancelled, Double refundAmount,
                               String cancelledBy) {
        this(bookingId, seatsCancelled, refundAmount);

        this.cancelledBy = cancelledBy;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public Integer getSeatsCancelled() {
        return seatsCancelled;
    }

    public void setSeatsCancelled(Integer seatsCancelled) {
        this.seatsCancelled = seatsCancelled;
    }

    public Double getRefundAmount() {
        return refundAmount;
    }

    public void setRefundAmount(Double refundAmount) {
        this.refundAmount = refundAmount;
    }

    public LocalDateTime getCancellationTime() {
        return cancellationTime;
    }

    public void setCancellationTime(LocalDateTime cancellationTime) {
        this.cancellationTime = cancellationTime;
    }


    public String getRefundStatus() {
        return refundStatus;
    }

    public void setRefundStatus(String refundStatus) {
        this.refundStatus = refundStatus;
    }

    public LocalDateTime getRefundProcessedTime() {
        return refundProcessedTime;
    }

    public void setRefundProcessedTime(LocalDateTime refundProcessedTime) {
        this.refundProcessedTime = refundProcessedTime;
    }

    public String getCancelledBy() {
        return cancelledBy;
    }

    public void setCancelledBy(String cancelledBy) {
        this.cancelledBy = cancelledBy;
    }

    // Helper methods
    public void markRefundProcessed() {
        this.refundStatus = "PROCESSED";
        this.refundProcessedTime = LocalDateTime.now();
    }

    public void markRefundFailed() {
        this.refundStatus = "FAILED";
    }

    public boolean isRefundPending() {
        return "PENDING".equals(this.refundStatus);
    }

    public boolean isRefundProcessed() {
        return "PROCESSED".equals(this.refundStatus);
    }

    @Override
    public String toString() {
        return "CancellationRecord{" +
                "id=" + id +
                ", bookingId=" + bookingId +
                ", seatsCancelled=" + seatsCancelled +
                ", refundAmount=" + refundAmount +
                ", cancellationTime=" + cancellationTime +
                ", refundStatus='" + refundStatus + '\'' +
                ", cancelledBy='" + cancelledBy + '\'' +
                '}';
    }
}
