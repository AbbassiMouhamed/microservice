package com.smartlingua.forum.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AnnouncementRequest(
        @NotBlank @Size(min = 2, max = 200) String title,
        @NotBlank @Size(max = 10000) String content
) {}
