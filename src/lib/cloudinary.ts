import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadPdfBuffer(
  buffer: Buffer,
  folder: 'surat_masuk' | 'surat_keluar',
  filename: string
): Promise<{ url: string; publicId: string }> {
  const cleanName = filename.replace(/\.pdf$/i, '').replace(/[^a-zA-Z0-9_-]/g, '_');
  const publicId = `${cleanName}_${Date.now().toString(36)}`;
  const base64Data = `data:application/pdf;base64,${buffer.toString('base64')}`;

  const res = await cloudinary.uploader.upload(base64Data, {
    resource_type: 'raw',
    folder: `sipasd/${folder}`,
    public_id: `${publicId}.pdf`,
    overwrite: true,
  });

  return {
    url: res.secure_url,
    publicId: res.public_id,
  };
}

export async function deletePdf(publicId: string): Promise<boolean> {
  try {
    const res = await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    return res.result === 'ok';
  } catch {
    return false;
  }
}
