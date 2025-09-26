package com.AL565.prose.service.dto;

import lombok.Builder;
import lombok.Data;
import lombok.AllArgsConstructor;

@Data
@Builder
@AllArgsConstructor
public class ReturnEntityDTO<T> {
    private String message;
    
    private T data;

    

}
