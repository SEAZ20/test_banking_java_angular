package com.testdevsu.demo.config;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.testdevsu.demo.dto.ClientReportDTO;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.util.Base64;

@Component
public class PdfReportFormatter implements ReportFormatter {

    @Override
    public String format(ClientReportDTO reportData) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc);

            // Título
            document.add(new Paragraph("Estado de Cuenta")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontSize(18)
                    .setBold());
            
            // Información del cliente
            document.add(new Paragraph("Cliente: " + reportData.getClientName()));
            document.add(new Paragraph("Periodo: " + reportData.getStartDate() + " - " + reportData.getEndDate()));
            document.add(new Paragraph("\n"));

            // Crear una tabla por cada cuenta
            reportData.getAccounts().forEach(account -> {
                // Título de la cuenta
                if (reportData.getAccounts().size() > 1) {
                    document.add(new Paragraph("Cuenta: " + account.getAccountNumber() + " (" + account.getAccountType() + ")")
                            .setFontSize(12)
                            .setBold());
                }

                float[] columnWidths = {1.5f, 2f, 1.5f, 1.2f, 1.3f, 1f, 1.3f, 1.5f};
                Table table = new Table(columnWidths);
                

                table.addHeaderCell(new Cell().add(new Paragraph("Fecha").setFontSize(9).setBold()));
                table.addHeaderCell(new Cell().add(new Paragraph("Cliente").setFontSize(9).setBold()));
                table.addHeaderCell(new Cell().add(new Paragraph("Número Cuenta").setFontSize(9).setBold()));
                table.addHeaderCell(new Cell().add(new Paragraph("Tipo").setFontSize(9).setBold()));
                table.addHeaderCell(new Cell().add(new Paragraph("Saldo Inicial").setFontSize(9).setBold()));
                table.addHeaderCell(new Cell().add(new Paragraph("Estado").setFontSize(9).setBold()));
                table.addHeaderCell(new Cell().add(new Paragraph("Movimiento").setFontSize(9).setBold()));
                table.addHeaderCell(new Cell().add(new Paragraph("Saldo Disponible").setFontSize(9).setBold()));

                account.getMovements().forEach(movement -> {
                    table.addCell(new Cell().add(new Paragraph(movement.getDate().toString()).setFontSize(8)));
                    table.addCell(new Cell().add(new Paragraph(reportData.getClientName()).setFontSize(8)));
                    table.addCell(new Cell().add(new Paragraph(account.getAccountNumber()).setFontSize(8)));
                    table.addCell(new Cell().add(new Paragraph(account.getAccountType()).setFontSize(8)));
                    table.addCell(new Cell().add(new Paragraph("$" + account.getInitialBalance()).setFontSize(8)));
                    table.addCell(new Cell().add(new Paragraph(account.getStatus() ? "Activa" : "Inactiva").setFontSize(8)));
                    table.addCell(new Cell().add(new Paragraph(movement.getValue().toString()).setFontSize(8)));
                    table.addCell(new Cell().add(new Paragraph("$" + movement.getBalance()).setFontSize(8)));
                });
                
                document.add(table);
                document.add(new Paragraph("\n"));
            });

            document.close();

            byte[] pdfBytes = baos.toByteArray();
            return Base64.getEncoder().encodeToString(pdfBytes);
            
        } catch (Exception e) {
            throw new RuntimeException("Error formatting PDF report", e);
        }
    }

    @Override
    public String getContentType() {
        return "application/pdf";
    }
}
