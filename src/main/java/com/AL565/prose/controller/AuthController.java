package com.AL565.prose.controller;

import com.AL565.prose.security.exceptions.UserNotFoundException;
import com.AL565.prose.service.AuthService;
import com.AL565.prose.service.dto.LoginRequestDTO;
import com.AL565.prose.service.dto.ProseUserDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDTO request) {
        try {
            ProseUserDTO user = authService.login(request);
            return ResponseEntity.ok(user);
            
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(401).body(Map.of(
                "error", "User not found"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of(
                "error", "Invalid credentials"
            ));
        }
    }

}
