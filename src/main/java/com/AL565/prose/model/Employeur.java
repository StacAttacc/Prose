package com.AL565.prose.model;


import com.AL565.prose.model.auth.Credentials;
import com.AL565.prose.model.auth.Role;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.*;

@Getter
@Setter
@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Employeur extends ProseUser {
    private String company;

    public Employeur(String firstName, String lastName, String company, String username, String password) {
        super(firstName, lastName, new Credentials(username, password, Role.EMPLOYEUR));
        this.company = company;
    }

    public Employeur(Long id,String firstName, String lastName, String company, String username) {
        super(id, firstName, lastName, new Credentials(username, null, Role.EMPLOYEUR));
        this.company = company;
    }


}
