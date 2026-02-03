package com.testdevsu.demo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "person")
@Inheritance(strategy = InheritanceType.JOINED)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Person {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 20)
    private String gender;

    @Column
    private Integer age;

    @Column(unique = true, nullable = false, length = 20)
    private String identification;

    @Column(length = 200)
    private String address;

    @Column(length = 20)
    private String phone;
}
