package com.urlshortener.controller;

import com.urlshortener.service.UrlService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/create")
@CrossOrigin(origins = "*")
public class CreateController {
    
    @Autowired
    private UrlService urlService;
    
    @PostMapping
    public ResponseEntity<Map<String, String>> createShortUrl(@RequestBody Map<String, String> request) {
        String originalUrl = request.get("url");
        if (originalUrl == null || originalUrl.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "URL is required"));
        }
        
        String shortCode = urlService.createShortUrl(originalUrl);
        return ResponseEntity.ok(Map.of("shortCode", shortCode));
    }
}