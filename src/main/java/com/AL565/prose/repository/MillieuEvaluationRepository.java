package com.AL565.prose.repository;

import com.AL565.prose.model.MillieuEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MillieuEvaluationRepository extends JpaRepository<MillieuEvaluation, Long> {
}
