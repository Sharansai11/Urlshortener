package com.urlshortener.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "urls")
@Data
@NoArgsConstructor
public class Url {
    @Id
    private String shortCode;
    
    @Column(nullable = false, length = 2048)
    private String originalUrl;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    public Url(String shortCode, String originalUrl) {
        this.shortCode = shortCode;
        this.originalUrl = originalUrl;
        this.createdAt = LocalDateTime.now();
    }
}