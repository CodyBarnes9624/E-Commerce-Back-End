const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint


  router.get('/', async (req, res) => {
    try {
      const categories = await Category.findAll({
        include: [{ model: Product }] 
      });
      res.json(categories);
    } catch (err) {
      res.status(500).json(err);
    }
  });


  router.get('/:id', async (req, res) => {
    try {
      const category = await Category.findByPk(req.params.id, {
        include: [{ model: Product }] 
      });
      if (!category) {
        res.status(404).json({ message: 'Category not found' });
        return;
      }
      res.json(category);
    } catch (err) {
      res.status(500).json(err);
    }
  });


router.post('/', async (req, res) => {
  try {
    const newCategory = await Category.create(req.body);
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(400).json(err);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const [updated] = await Category.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedCategory = await Category.findByPk(req.params.id);
      res.json(updatedCategory);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (err) {
    res.status(400).json(err);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Category.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      res.status(204).end();
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
