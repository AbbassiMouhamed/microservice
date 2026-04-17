package com.smartlingua.forum.repository;

import com.smartlingua.forum.domain.PostReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostReportRepository extends JpaRepository<PostReport, Long> {

    List<PostReport> findByPostId(Long postId);

    long countByPostId(Long postId);
}
