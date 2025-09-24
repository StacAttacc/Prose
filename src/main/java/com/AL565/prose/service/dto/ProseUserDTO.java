package com.AL565.prose.service.dto;

import com.AL565.prose.model.ProseUser;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProseUserDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String role;
    private String token;

    public static ProseUserDTO toDto(ProseUser u) {
        ProseUserDTO dto = new ProseUserDTO();
        dto.setId(u.getId());
        dto.setEmail(u.getEmail());
        dto.setFirstName(u.getFirstName());
        dto.setLastName(u.getLastName());
        dto.setRole(u.getAuthorities().iterator().next().getAuthority());
        return dto;
    }

    public static ProseUserDTO toDtoWithToken(ProseUser u, String token) {
        ProseUserDTO dto = toDto(u);
        dto.setToken(token);
        return dto;
    }
}
