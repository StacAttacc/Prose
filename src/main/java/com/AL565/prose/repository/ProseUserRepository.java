package com.AL565.prose.repository;

import com.AL565.prose.model.ProseUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProseUserRepository extends JpaRepository<ProseUser, Long> {
    Optional<ProseUser> findByCredentials_Username(String credentialsUsername);
}
