package com.AL565.prose.repository;

import com.AL565.prose.model.ProseUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProseUserRepository extends JpaRepository<ProseUser, Long> {
    Optional<ProseUser> findByCredentials_Email(String email);
}
