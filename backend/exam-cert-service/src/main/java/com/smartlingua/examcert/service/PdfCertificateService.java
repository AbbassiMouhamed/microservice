package com.smartlingua.examcert.service;

import com.smartlingua.examcert.domain.SkillLevel;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
public class PdfCertificateService {

    public byte[] generate(
            UUID certificateId,
            String studentName,
            String examTitle,
            SkillLevel skillLevel,
            OffsetDateTime issuedAt,
            String signatureBase64
    ) {
        try (PDDocument doc = new PDDocument(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PDPage page = new PDPage(PDRectangle.A4);
            doc.addPage(page);

            var titleFont = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
            var bodyFont = new PDType1Font(Standard14Fonts.FontName.HELVETICA);

            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                float margin = 72;
                float y = page.getMediaBox().getHeight() - margin;

                cs.beginText();
                cs.setFont(titleFont, 22);
                cs.newLineAtOffset(margin, y);
                cs.showText("SmartLingua Certificate");
                cs.endText();

                y -= 50;

                cs.beginText();
                cs.setFont(bodyFont, 12);
                cs.newLineAtOffset(margin, y);
                cs.showText("This certifies that:");
                cs.endText();

                y -= 22;

                cs.beginText();
                cs.setFont(titleFont, 16);
                cs.newLineAtOffset(margin, y);
                cs.showText(studentName);
                cs.endText();

                y -= 30;

                cs.beginText();
                cs.setFont(bodyFont, 12);
                cs.newLineAtOffset(margin, y);
                cs.showText("Has successfully completed the final exam:");
                cs.endText();

                y -= 22;

                cs.beginText();
                cs.setFont(titleFont, 14);
                cs.newLineAtOffset(margin, y);
                cs.showText(examTitle);
                cs.endText();

                y -= 30;

                cs.beginText();
                cs.setFont(bodyFont, 12);
                cs.newLineAtOffset(margin, y);
                cs.showText("Skill level validated: " + skillLevel);
                cs.endText();

                y -= 18;

                cs.beginText();
                cs.setFont(bodyFont, 12);
                cs.newLineAtOffset(margin, y);
                cs.showText("Issued at: " + issuedAt.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME));
                cs.endText();

                y -= 18;

                cs.beginText();
                cs.setFont(bodyFont, 12);
                cs.newLineAtOffset(margin, y);
                cs.showText("Certificate ID: " + certificateId);
                cs.endText();

                y -= 30;

                String sigShort = signatureBase64.length() > 24 ? signatureBase64.substring(0, 24) + "..." : signatureBase64;
                cs.beginText();
                cs.setFont(bodyFont, 10);
                cs.newLineAtOffset(margin, y);
                cs.showText("Digital signature (base64): " + sigShort);
                cs.endText();
            }

            doc.save(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new IllegalStateException("Failed to generate certificate PDF", e);
        }
    }
}
