package com.smartlingua.forum.repository;

import com.smartlingua.forum.domain.PostLike;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {

    Optional<PostLike> findByPostIdAndUserId(Long postId, String userId);

    long countByPostId(Long postId);

    boolean existsByPostIdAndUserId(Long postId, String userId);
}
