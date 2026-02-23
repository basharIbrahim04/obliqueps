
-- Create storage bucket for order files (STL, OBJ, 3MF)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('order-files', 'order-files', true, 104857600);

-- Allow anyone to upload files to the bucket (orders are public/anonymous)
CREATE POLICY "Anyone can upload order files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'order-files');

-- Allow anyone to read order files (so owner can download from email link)
CREATE POLICY "Anyone can read order files"
ON storage.objects FOR SELECT
USING (bucket_id = 'order-files');
