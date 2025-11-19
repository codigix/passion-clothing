-- Add missing PDF-related columns to purchase_orders table

ALTER TABLE purchase_orders 
ADD COLUMN po_pdf_path VARCHAR(500) NULL COMMENT 'Path to generated PO PDF file';

ALTER TABLE purchase_orders 
ADD COLUMN invoice_pdf_path VARCHAR(500) NULL COMMENT 'Path to generated Invoice PDF file';

ALTER TABLE purchase_orders 
ADD COLUMN po_pdf_generated_at DATETIME NULL COMMENT 'Timestamp when PO PDF was generated';

ALTER TABLE purchase_orders 
ADD COLUMN invoice_pdf_generated_at DATETIME NULL COMMENT 'Timestamp when Invoice PDF was generated';

ALTER TABLE purchase_orders 
ADD COLUMN accounting_notification_sent TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Flag to track if accounting department was notified with PDFs';

ALTER TABLE purchase_orders 
ADD COLUMN accounting_notification_sent_at DATETIME NULL COMMENT 'Timestamp when accounting department notification was sent';

ALTER TABLE purchase_orders 
ADD COLUMN accounting_sent_by INT NULL COMMENT 'User ID who sent notification to accounting';

ALTER TABLE purchase_orders 
ADD COLUMN pdf_generation_status ENUM('pending', 'generating', 'completed', 'failed') DEFAULT 'pending' COMMENT 'Current status of PDF generation';

ALTER TABLE purchase_orders 
ADD COLUMN pdf_error_message TEXT NULL COMMENT 'Error message if PDF generation fails';

-- Verify the columns were added
DESCRIBE purchase_orders;