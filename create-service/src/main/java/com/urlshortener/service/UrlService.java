package com.urlshortener.service;

import com.urlshortener.model.Url;
import com.urlshortener.repository.UrlRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import java.time.Duration;

@Service
public class UrlService {
    
    @Autowired
    private UrlRepository urlRepository;
    
    @Autowired
    @Qualifier("stringRedisTemplate")
    private RedisTemplate<String, String> redisTemplate;
    
    @Autowired
    private SnowflakeIdGenerator idGenerator;
    
    @Autowired
    private Base62Encoder base62Encoder;
    
    public String createShortUrl(String originalUrl) {
        long id = idGenerator.nextId();
        String shortCode = base62Encoder.encode(id);
        
        Url url = new Url(shortCode, originalUrl);
        urlRepository.save(url);
        
        // Cache with 6 hours TTL
        redisTemplate.opsForValue().set(shortCode, originalUrl, Duration.ofHours(6));
        
        return shortCode;
    }
}