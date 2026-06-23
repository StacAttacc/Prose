package com.AL565.prose.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private record Rule(String method, String path, int limit, Duration window) {}

    private static final List<Rule> RULES = List.of(
            new Rule("POST", "/user/login", 5, Duration.ofMinutes(5)),
            new Rule("POST", "/etudiant/register", 3, Duration.ofHours(1)),
            new Rule("POST", "/employeur/register", 3, Duration.ofHours(1))
    );

    private final Map<String, Deque<Instant>> hits = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        Rule rule = match(request);
        if (rule == null) {
            chain.doFilter(request, response);
            return;
        }

        String key = rule.path() + "|" + clientIp(request);
        Instant now = Instant.now();
        Instant cutoff = now.minus(rule.window());

        Deque<Instant> bucket = hits.computeIfAbsent(key, k -> new ArrayDeque<>());
        synchronized (bucket) {
            while (!bucket.isEmpty() && bucket.peekFirst().isBefore(cutoff)) {
                bucket.pollFirst();
            }
            if (bucket.size() >= rule.limit()) {
                Instant oldest = bucket.peekFirst();
                long retryAfterSec = Math.max(1L, Duration.between(now, oldest.plus(rule.window())).getSeconds());
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setHeader("Retry-After", String.valueOf(retryAfterSec));
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                response.getWriter().write("{\"message\":\"Trop de requêtes, réessayez plus tard.\"}");
                return;
            }
            bucket.addLast(now);
        }

        chain.doFilter(request, response);
    }

    private Rule match(HttpServletRequest request) {
        if (!HttpMethod.POST.matches(request.getMethod())) {
            return null;
        }
        String path = request.getServletPath();
        for (Rule r : RULES) {
            if (r.method().equals(request.getMethod()) && r.path().equals(path)) {
                return r;
            }
        }
        return null;
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(forwarded)) {
            int comma = forwarded.indexOf(',');
            return (comma >= 0 ? forwarded.substring(0, comma) : forwarded).trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (StringUtils.hasText(realIp)) {
            return realIp.trim();
        }
        return request.getRemoteAddr();
    }
}
