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
      data,
    });

    res.json(updatedMachineRepair);
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
    res.json(replacedParts.map((part) => part.name));
  }),
);

router.put(
  '/replaced-parts',
  asyncHandler(async (req, res) => {
    const newReplacedParts = req.body;
    // drop all replaced parts
    await prisma.replacedParts.deleteMany();
    // create new replaced parts
    const replacedParts = await prisma.replacedParts.createMany({
      data: newReplacedParts.map((part) => ({ name: part })),
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

module.exports = router;
