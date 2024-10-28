const express = require('express');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
const prisma = new PrismaClient();
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const { hashPassword } = require('../helper/auth.helper');
const logger = require('../config/logger');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const asyncHandler = require('../helper/asyncHandler');
const { sendEmail } = require('../helper/mailer');

const SUPERVISOR_SECRET_KEY = process.env.SUPERVISOR_SECRET_KEY;

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);

// POST /machine-repairs
router.post(
  '/machine-repairs',
  asyncHandler(async (req, res) => {
    // Extract query parameters
    const {
      sortBy = 'createdAt', // default sorting by createdAt
      sortOrder = 'asc', // default sort order
      page,
      itemsPerPage,
    } = req.query;

    // Extract filter from request body
    const { filter = {} } = req.body;

    // Set up pagination
    const skip = page ? (parseInt(page) - 1) * parseInt(itemsPerPage) : null;
    const take = itemsPerPage ? parseInt(itemsPerPage) : null;

    const filterQuery = Object.keys(filter).reduce((acc, key) => {
      return { ...acc, [key]: { contains: filter[key] } };
    }, {});

    // Fetch filtered, paginated, and sorted data
    const machineRepairs = await prisma.machineRepair.findMany({
      where: filterQuery,
      orderBy: { [sortBy]: sortOrder }, // Apply sorting
      ...(skip && { skip }), // Apply pagination
      ...(take && { take }), // Apply pagination
    });

    // Get total count for pagination metadata
    const totalCount = await prisma.machineRepair.count({
      where: filter,
    });

    // Return data with pagination info
    res.json({
      data: machineRepairs,
      pagination: {
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / take),
        currentPage: parseInt(page),
        itemsPerPage: take,
      },
    });
  }),
);

async function getImageUrl(bucket_name, image_path) {
  const { data, error } = await supabase.storage
    .from(bucket_name)
    .createSignedUrl(image_path, 60);

  if (error) {
    throw error;
  }

  return data.signedUrl;
}

router.get(
  '/machine-repairs/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const machineRepair = await prisma.machineRepair.findUnique({
      where: { id: parseInt(id) },
      include: {
        replaced_part_list: true,
      },
    });

    if (!machineRepair) {
      return res.status(404).json({ message: 'Réparation non trouvée.' });
    }

    const { bucket_name, image_path_list, client_signature, ...response } =
      machineRepair;

    if (bucket_name) {
      try {
        const imageUrls = await Promise.all(
          image_path_list.map(async (image_path) => {
            return await getImageUrl(bucket_name, image_path);
          }),
        );
        const signatureUrl = await getImageUrl(bucket_name, client_signature);
        res.json({ ...response, imageUrls, signatureUrl });
      } catch (error) {
        logger.error(error);
        res.status(500).json({ error: error.message });
      }
    }
  }),
);

router.patch(
  '/machine-repairs/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const data = req.body;

    const machineRepair = await prisma.machineRepair.findUnique({
      where: { id: parseInt(id) },
    });

    if (!machineRepair) {
      return res.status(404).json({ message: 'Réparation non trouvée.' });
    }

    const updatedMachineRepair = await prisma.machineRepair.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        ...(data.replaced_part_list
          ? {
              replaced_part_list: {
                set: data.replaced_part_list.map((part) => ({
                  name: part.name,
                })),
              },
            }
          : {}),
      },
    });

    res.json(updatedMachineRepair);
  }),
);

router.delete(
  '/machine-repairs/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const machineRepair = await prisma.machineRepair.findUnique({
      where: { id: parseInt(id) },
    });

    if (!machineRepair) {
      return res.status(404).json({ message: 'Réparation non trouvée.' });
    }

    await prisma.machineRepair.delete({
      where: { id: parseInt(id) },
    });

    res.json(machineRepair);
  }),
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: 'Veuillez remplir tous les champs.' });
    }

    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username, role: 'SUPERVISOR' },
    });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    // Compare the password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Mot de passe incorrect.' });
    }

    const token = jwt.sign(user, SUPERVISOR_SECRET_KEY, { expiresIn: '1d' });
    const expiresAt = Date.now() + 1 * 24 * 60 * 60 * 1000;
    res.json({ authentificated: true, token, expiresAt });
  }),
);

router.get(
  '/replaced-parts',
  asyncHandler(async (req, res) => {
    const replacedParts = await prisma.replacedParts.findMany();
    res.json(replacedParts);
  }),
);

router.put(
  '/replaced-parts',
  asyncHandler(async (req, res) => {
    const newReplacedParts = req.body;
    // check if newReplacedParts is array of object if key name string and price float
    if (
      !Array.isArray(newReplacedParts) ||
      !newReplacedParts.every(
        (part) =>
          typeof part.name === 'string' && typeof part.price === 'number',
      )
    ) {
      return res
        .status(400)
        .json({ message: 'Veuillez fournir une liste valide de pièces.' });
    }

    // drop all replaced parts
    await prisma.replacedParts.deleteMany();
    // create new replaced parts
    const replacedParts = await prisma.replacedParts.createMany({
      data: newReplacedParts,
    });
    res.json(replacedParts);
  }),
);

router.get(
  '/repairer_names',
  asyncHandler(async (req, res) => {
    const repairerNames = await prisma.repairer.findMany();
    res.json(repairerNames.map((repairer) => repairer.name));
  }),
);

router.put(
  '/repairer_names',
  asyncHandler(async (req, res) => {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Veuillez fournir un nom.' });
    }
    const repairer = await prisma.repairer.create({ data: { name } });
    res.json(repairer);
  }),
);

router.delete(
  '/repairer_names/:name',
  asyncHandler(async (req, res) => {
    const { name } = req.params;
    const repairer = await prisma.repairer.findUnique({ where: { name } });
    if (!repairer) {
      return res.status(404).json({ message: 'Réparateur non trouvé.' });
    }
    await prisma.repairer.delete({ where: { name } });
    res.json(repairer);
  }),
);

router.get(
  '/brands',
  asyncHandler(async (req, res) => {
    const brands = await prisma.brand.findMany();
    res.json(brands.map((brand) => brand.name));
  }),
);

router.get(
  '/allConfig',
  asyncHandler(async (req, res) => {
    const [brands, repairerNames, replacedParts, config] =
      await prisma.$transaction([
        prisma.brand.findMany(),
        prisma.repairer.findMany(),
        prisma.replacedParts.findMany(),
        prisma.config.findMany(),
      ]);
    res.json({
      brands: brands.map((brand) => brand.name),
      repairerNames: repairerNames.map((repairer) => repairer.name),
      replacedParts,
      config: config.reduce((acc, { key, value }) => {
        return { ...acc, [key]: value };
      }, {}),
    });
  }),
);

router.get(
  '/config',
  asyncHandler(async (req, res) => {
    const config = await prisma.config.findMany();
    res.json(config);
  }),
);

router.put(
  '/config',
  asyncHandler(async (req, res) => {
    const config = req.body;
    if (
      !config ||
      typeof config !== 'object' ||
      typeof config['key'] !== 'string' ||
      typeof config['value'] !== 'string'
    ) {
      return res
        .status(400)
        .json({ message: 'Veuillez fournir une configuration valide.' });
    }

    // update config
    const result = await prisma.config.createMany({
      data: [config],
      skipDuplicates: true,
    });

    res.json(result);
  }),
);

router.delete(
  '/config/:key',
  asyncHandler(async (req, res) => {
    const { key } = req.params;
    const config = await prisma.config.findUnique({ where: { key } });
    if (!config) {
      return res.status(404).json({ message: 'Configuration non trouvée.' });
    }
    await prisma.config.delete({ where: { key } });
    res.json(config);
  }),
);

router.patch(
  '/config/:key',
  asyncHandler(async (req, res) => {
    const { key } = req.params;
    const { value } = req.body;
    const config = await prisma.config.findUnique({ where: { key } });
    if (!config) {
      return res.status(404).json({ message: 'Configuration non trouvée.' });
    }
    const updatedConfig = await prisma.config.update({
      where: { key },
      data: { value },
    });
    res.json(updatedConfig);
  }),
);

router.put(
  '/brands',
  asyncHandler(async (req, res) => {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Veuillez fournir un nom.' });
    }
    const brand = await prisma.brand.create({ data: { name } });
    res.json(brand);
  }),
);

router.delete(
  '/brands/:name',
  asyncHandler(async (req, res) => {
    const { name } = req.params;
    const brand = await prisma.brand.findUnique({ where: { name } });
    if (!brand) {
      return res.status(404).json({ message: 'Marque non trouvée.' });
    }
    await prisma.brand.delete({ where: { name } });
    res.json(brand);
  }),
);

router.get(
  '/users',
  asyncHandler(async (req, res) => {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        // Add other fields you want to retrieve, but exclude password
      },
    });
    res.json(users);
  }),
);

router.delete(
  '/users/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    // get user
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }
    // check if it is not the last user with this role
    const users = await prisma.user.findMany({
      where: { role: user.role },
    });
    if (users.length === 1) {
      return res
        .status(400)
        .json({ message: `Impossible de supprimer le dernier ${user.role}.` });
    }
    // delete user
    await prisma.user.delete({
      where: { id: parseInt(id) },
    });

    res.json(user);
  }),
);

router.patch(
  '/users/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;
    const hashedPassword = await hashPassword(password);
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { password: hashedPassword },
    });
    res.json(updatedUser);
  }),
);

router.put(
  '/users',
  asyncHandler(async (req, res) => {
    const { username, password, role } = req.body;
    const hashedPassword = await hashPassword(password);
    const newUser = await prisma.user.create({
      data: { username, password: hashedPassword, role },
    });
    res.json(newUser);
  }),
);

router.put(
  '/machine-repairs/email/:id',
  upload.single('attachment'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const machineRepair = await prisma.machineRepair.findUnique({
      where: { id: parseInt(id) },
      select: { repair_or_maintenance: true, email: true },
    });

    if (!machineRepair) {
      return res.status(404).json({ message: 'Réparation non trouvée.' });
    }

    const { repair_or_maintenance, email } = machineRepair;
    const type = String(repair_or_maintenance).toLowerCase();
    const options = {
      to: email,
      subject: `Bon de ${type} - ${id}`,
      html: `Bonjour,<br>Vous trouverez ci-joint le bon pour ${type} n°${id}.
        <br><br>En vous remerciant,
        <br>Cordialement.
        <br><br>L'équipe de Forestar.`,
      attachments: [
        {
          filename: `bon_de_${type}_${id}.pdf`,
          content: req.file.buffer.toString('base64'),
          encoding: 'base64',
        },
      ],
      replyTo: process.env.REPLY_TO,
    };

    await sendEmail(options);

    res.json({ message: 'Email envoyé avec succès.' });
  }),
);

module.exports = router;
