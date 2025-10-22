package com.AL565.prose.model.notifications;

import com.AL565.prose.model.Candidature;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PostulationNotification extends Notification {
    @OneToOne
    @JoinColumn(name = "candidature_id")
    private Candidature candidature;
}
