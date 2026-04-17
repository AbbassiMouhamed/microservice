package com.smartlingua.forum.repository;

import com.smartlingua.forum.domain.ForumPost;
import com.smartlingua.forum.domain.PostStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface ForumPostRepository extends JpaRepository<ForumPost, Long> {

    Page<ForumPost> findByStatus(PostStatus status, Pageable pageable);

    List<ForumPost> findByAuthorId(String authorId);

    @Query("SELECT p FROM ForumPost p WHERE p.status = 'ACTIVE' ORDER BY SIZE(p.likes) DESC, p.createdAt DESC")
    List<ForumPost> findTrending(Pageable pageable);

    @Query("SELECT p FROM ForumPost p WHERE p.status = 'ACTIVE' AND p.category = :cat ORDER BY p.createdAt DESC")
    List<ForumPost> findRecommendations(@Param("cat") String category, Pageable pageable);

    List<ForumPost> findByStatusOrderByUpdatedAtDesc(PostStatus status);

    long countByCreatedAtAfter(Instant since);
}
