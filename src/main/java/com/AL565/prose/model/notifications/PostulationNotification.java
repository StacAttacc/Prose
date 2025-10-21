package com.AL565.prose.model.notifications;

import com.AL565.prose.model.Candidature;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PostulationNotification extends Notification {
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "candidature_id")
    private Candidature candidature;
    private LocalDateTime secondRecipientReadAt;
}
