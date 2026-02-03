package com.testdevsu.demo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import java.util.List;

@Entity
@Table(name = "client")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Client extends Person {

    @Column(unique = true, nullable = false, length = 50)
    private String clientId;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(nullable = false)
    private Boolean status;

    @OneToMany(mappedBy = "client", cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    private List<Account> accounts;
}
