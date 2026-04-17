package com.smartlingua.forum.dto;

import jakarta.validation.constraints.Size;

public record ReportRequest(
        @Size(max = 500) String reason
) {}
