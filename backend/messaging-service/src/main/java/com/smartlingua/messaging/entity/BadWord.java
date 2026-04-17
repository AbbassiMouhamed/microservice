package com.smartlingua.messaging.entity;

import jakarta.persistence.*;
import java.util.Locale;

@Entity
@Table(name = "msg_bad_words")
public class BadWord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 255)
    private String word;

    public BadWord() {}
    public BadWord(String word) {
        this.word = word == null ? null : word.trim().toLowerCase(Locale.ROOT);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getWord() { return word; }
    public void setWord(String word) {
        this.word = word == null ? null : word.trim().toLowerCase(Locale.ROOT);
    }
}
