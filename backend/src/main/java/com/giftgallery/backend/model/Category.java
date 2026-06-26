package com.giftgallery.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true)
    private String name;

    private String slug;

    private String iconUrl;

    private String description;

    @PrePersist
    protected void onCreate() {
        if (this.name != null) {
            this.slug = this.name.toLowerCase().replace(" ", "-");
        }
    }
}