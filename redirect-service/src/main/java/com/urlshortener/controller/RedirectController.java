package com.urlshortener.controller;

import com.urlshortener.service.RedirectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/redirect")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RedirectController {
    
    private final RedirectService redirectService;
    
    @GetMapping("/{shortCode}")
    public ResponseEntity<Void> redirect(@PathVariable("shortCode") String shortCode) {
        try {
            var originalUrl = redirectService.getOriginalUrl(shortCode);
            
            if (originalUrl.isPresent()) {
                return ResponseEntity.status(HttpStatus.FOUND)
                        .location(URI.create(originalUrl.get()))
                        .build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}