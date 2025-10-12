package com.AL565.prose.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.AL565.prose.model.Postuler;

public interface PostulerRepository extends JpaRepository<Postuler, Long> {
    
}
