const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// the `/api/products` endpoint

// get all products with associated Category and Tag data
router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        { model: Category },
        { model: Tag, through: ProductTag } 
      ]
    });
    res.json(products);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get a single product by its ID with associated Category and Tag data
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Category },
        { model: Tag, through: ProductTag } 
      ]
    });
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.json(product);
  } catch (err) {
    res.status(500).json(err);
  }
});

// create a new product
router.post('/', async (req, res) => {
  try {
    const { tagIds, ...productData } = req.body;
    const product = await Product.create(productData);
    
    if (tagIds && tagIds.length) {
      const productTagIdArr = tagIds.map((tag_id) => ({
        product_id: product.id,
        tag_id,
      }));
      await ProductTag.bulkCreate(productTagIdArr);
    }
    
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json(err);
  }
});

// update product data
router.put('/:id', async (req, res) => {
  try {
    const { tagIds, ...productData } = req.body;
    
    const [updated] = await Product.update(productData, {
      where: { id: req.params.id }
    });
    
    if (updated) {
      if (tagIds && tagIds.length) {
        const productTags = await ProductTag.findAll({
          where: { product_id: req.params.id }
        });
        
        const existingTagIds = productTags.map(({ tag_id }) => tag_id);
        const newProductTags = tagIds
          .filter((tag_id) => !existingTagIds.includes(tag_id))
          .map((tag_id) => ({
            product_id: req.params.id,
            tag_id,
          }));
        
        const tagsToRemove = productTags
          .filter(({ tag_id }) => !tagIds.includes(tag_id))
          .map(({ id }) => id);
        
        await Promise.all([
          ProductTag.destroy({ where: { id: tagsToRemove } }),
          ProductTag.bulkCreate(newProductTags)
        ]);
      }
      
      const updatedProduct = await Product.findByPk(req.params.id, {
        include: [
          { model: Category },
          { model: Tag, through: ProductTag }
        ]
      });
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (err) {
    res.status(400).json(err);
  }
});

// delete a product by its ID
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Product.destroy({
      where: { id: req.params.id }
    });
    
    if (deleted) {
      res.status(204).end();
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
