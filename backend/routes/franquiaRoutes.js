const express = require('express');
const router = express.Router();
const franquiaController = require('./../controllers/franquiaController');

// CRUD de Franquias

router.get('/abrirCrudFranquia', franquiaController.abrirCrudFranquia);
router.get('/', franquiaController.listarFranquias);
router.post('/', franquiaController.criarFranquia);
router.get('/:id', franquiaController.obterFranquia);
router.put('/:id', franquiaController.atualizarFranquia);
router.delete('/:id', franquiaController.deletarFranquia);

module.exports = router;
