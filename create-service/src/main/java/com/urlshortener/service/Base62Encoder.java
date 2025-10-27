package com.urlshortener.service;

import org.springframework.stereotype.Service;

@Service
public class Base62Encoder {
    private static final String BASE62_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    private static final int BASE = 62;
    
    public String encode(long value) {
        if (value == 0) return "00000000";
        
        // Ensure we only use the lower 48 bits to guarantee 8 characters max
        value = value & 0xFFFFFFFFFFFFL;
        
        StringBuilder sb = new StringBuilder();
        while (value > 0) {
            sb.append(BASE62_CHARS.charAt((int)(value % BASE)));
            value /= BASE;
        }
        
        // Pad to exactly 8 characters
        while (sb.length() < 8) {
            sb.append('0');
        }
        
        // Truncate to exactly 8 characters if longer
        if (sb.length() > 8) {
            sb.setLength(8);
        }
        
        return sb.reverse().toString();
    }
    
    public long decode(String encoded) {
        long result = 0;
        for (char c : encoded.toCharArray()) {
            result = result * BASE + BASE62_CHARS.indexOf(c);
        }
        return result;
    }
}