package com.quickbus.busbooking.dto;

import com.quickbus.busbooking.enums.BusType;
import com.quickbus.busbooking.enums.SortType;
import lombok.Data;

import java.time.LocalDate;

@Data
public class SearchRequest {
    private String source;
    private String destination;
    private LocalDate travelDate;
    private SortType sortBy;
    private BusType busType;

}
