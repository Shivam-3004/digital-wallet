package com.shivam.digital_wallet.security;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class RateLimitingFilter implements Filter {

    private static final int MAX_REQUESTS_PER_MINUTE = 100;
    private final Map<String, RequestCounter> requestCounts = new ConcurrentHashMap<>();

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        if (request instanceof HttpServletRequest httpRequest && response instanceof HttpServletResponse httpResponse) {
            String ip = httpRequest.getRemoteAddr();
            long currentTime = System.currentTimeMillis();

            RequestCounter counter = requestCounts.compute(ip, (key, value) -> {
                if (value == null || currentTime - value.resetTime > 60000) {
                    return new RequestCounter(new AtomicInteger(1), currentTime);
                } else {
                    value.count.incrementAndGet();
                    return value;
                }
            });

            if (counter.count.get() > MAX_REQUESTS_PER_MINUTE) {
                httpResponse.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                httpResponse.setContentType("application/json");
                httpResponse.getWriter().write("{\"success\":false,\"message\":\"Too many requests. Please try again later.\",\"timestamp\":\"" + java.time.LocalDateTime.now() + "\"}");
                return;
            }
        }

        chain.doFilter(request, response);
    }

    private static class RequestCounter {
        final AtomicInteger count;
        final long resetTime;

        RequestCounter(AtomicInteger count, long resetTime) {
            this.count = count;
            this.resetTime = resetTime;
        }
    }
}
