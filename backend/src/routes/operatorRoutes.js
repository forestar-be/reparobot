const express = require('express');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
const prisma = new PrismaClient();
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);
const bucketName = process.env.BUCKET_IMAGE_NAME;

function generateUniqueString() {
  const randomString = Math.random().toString(36).substring(2, 15);
  const timestamp = new Date().getTime();
  return `${timestamp}_${randomString}`;
}

// Function to convert Base64 string to Blob
function base64ToBlob(base64, contentType = '', sliceSize = 512) {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
}

router.post('/submit', upload.single('machine_photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('Aucun fichier reçu.');
    }

    const {
      first_name,
      last_name,
      address,
      phone,
      email,
      machine_type,
      repair_or_maintenance,
      robot_code,
      fault_description,
      signature, // Base64 string
    } = req.body;

    const requiredFields = [
      first_name,
      last_name,
      address,
      phone,
      email,
      machine_type,
      repair_or_maintenance,
      fault_description,
      signature,
    ];

    for (const field of requiredFields) {
      if (!field || field === '') {
        return res.status(400).send(`Le champ ${field} est requis.`);
      }
    }

    // decode uri encoded strings
    const firstNameDecoded = decodeURIComponent(first_name);
    const lastNameDecoded = decodeURIComponent(last_name);
    const addressDecoded = decodeURIComponent(address);
    const phoneDecoded = decodeURIComponent(phone);
    const emailDecoded = decodeURIComponent(email);
    const machineTypeDecoded = decodeURIComponent(machine_type);
    const repairOrMaintenanceDecoded = decodeURIComponent(
      repair_or_maintenance,
    );
    const robotCodeDecoded = decodeURIComponent(robot_code);
    const faultDescriptionDecoded = decodeURIComponent(fault_description);

    const webpBuffer = req.file.buffer; // WebP image buffer
    const fileName = req.file.originalname;

    // Upload the WebP image to Supabase Storage
    const imagePath = `images/${generateUniqueString()}_${fileName}`;
    const { data: imageUpload, error: imageError } = await supabase.storage
      .from(bucketName)
      .upload(imagePath, webpBuffer, {
        contentType: 'image/webp',
      });

    if (imageError) {
      throw new Error(
        `Erreur lors du téléchargement de l'image : ${imageError.message}`,
      );
    }

    // Convert base64 signature to a buffer and upload to Supabase
    const signatureBuffer = base64ToBlob(signature, 'image/png');
    const signatureFileName = `signature_${generateUniqueString()}_${first_name}_${last_name}.png`;

    const signaturePath = `signatures/${signatureFileName}`;
    const { data: signatureUpload, error: signatureError } =
      await supabase.storage
        .from(bucketName)
        .upload(signaturePath, signatureBuffer, {
          contentType: 'image/png',
        });

    if (signatureError) {
      throw new Error(
        `Erreur lors du téléchargement de la signature : ${signatureError.message}`,
      );
    }

    // Save the URLs to PostgreSQL using Prisma
    const newRepair = await prisma.machineRepair.create({
      data: {
        first_name: firstNameDecoded,
        last_name: lastNameDecoded,
        address: addressDecoded,
        phone: phoneDecoded,
        email: emailDecoded,
        machine_type: machineTypeDecoded,
        repair_or_maintenance: repairOrMaintenanceDecoded,
        robot_code: robotCodeDecoded,
        fault_description: faultDescriptionDecoded,
        client_signature: signaturePath,
        file_url: imagePath,
        bucket_name: bucketName,
      },
    });

    res
      .status(200)
      .json({ message: 'Données enregistrées avec succès.', newRepair });
  } catch (error) {
    console.error(`Erreur dans /submit: ${error.message}`);
    res.status(500).send('Erreur interne du serveur.');
  }
});

module.exports = router;
