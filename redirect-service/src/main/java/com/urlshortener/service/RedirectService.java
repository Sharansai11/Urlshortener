package com.urlshortener.service;

import com.urlshortener.repository.UrlRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Optional;

@Service
@Slf4j
public class RedirectService {
    
    private final UrlRepository urlRepository;
    private final RedisTemplate<String, String> redisTemplate;
    
    public RedirectService(UrlRepository urlRepository, 
                          @Qualifier("stringRedisTemplate") RedisTemplate<String, String> redisTemplate) {
        this.urlRepository = urlRepository;
        this.redisTemplate = redisTemplate;
    }
    
    public Optional<String> getOriginalUrl(String shortCode) {
        // Try Redis cache first
        String cachedUrl = redisTemplate.opsForValue().get(shortCode);
        if (cachedUrl != null) {
            log.debug("Cache hit for shortCode: {}", shortCode);
            return Optional.of(cachedUrl);
        }
        
        // Fallback to database
        log.debug("Cache miss for shortCode: {}, checking database", shortCode);
        return urlRepository.findById(shortCode)
                .map(url -> {
                    // Cache the result for 6 hours
                    redisTemplate.opsForValue().set(shortCode, url.getOriginalUrl(), Duration.ofHours(6));
                    return url.getOriginalUrl();
                });
    }
}