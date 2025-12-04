const { query } = require('../database');
const path = require('path');

exports.abrirCrudFranquia = (req, res) => {
  console.log('franquiaController - Rota /abrirCrudFranquia - abrir o crudFranquia');
  res.sendFile(path.join(__dirname, '../../frontend/franquia/franquia.html'));
}

exports.listarFranquias = async (req, res) => {
  try {
    const result = await query('SELECT * FROM franquia ORDER BY id_franquia');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar franquias:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.criarFranquia = async (req, res) => {
  try {
    const { nome_franquia, endereco_franquia, cidade_franquia, estado_franquia, telefone_franquia, email_franquia } = req.body;

    // Validação básica
    if (!nome_franquia || !cidade_franquia || !estado_franquia) {
      return res.status(400).json({
        error: 'Nome, cidade e estado da franquia são obrigatórios'
      });
    }

    const result = await query(
      'INSERT INTO franquia (nome_franquia, endereco_franquia, cidade_franquia, estado_franquia, telefone_franquia, email_franquia) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [nome_franquia, endereco_franquia, cidade_franquia, estado_franquia, telefone_franquia, email_franquia]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar franquia:', error);

    if (error.code === '23502') {
      return res.status(400).json({
        error: 'Dados obrigatórios não fornecidos'
      });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.obterFranquia = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID deve ser um número válido' });
    }

    const result = await query(
      'SELECT * FROM franquia WHERE id_franquia = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Franquia não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter franquia:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.atualizarFranquia = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nome_franquia, endereco_franquia, cidade_franquia, estado_franquia, telefone_franquia, email_franquia } = req.body;

    // Verifica se a franquia existe
    const existingResult = await query(
      'SELECT * FROM franquia WHERE id_franquia = $1',
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Franquia não encontrada' });
    }

    const current = existingResult.rows[0];
    const updatedFields = {
      nome_franquia: nome_franquia !== undefined ? nome_franquia : current.nome_franquia,
      endereco_franquia: endereco_franquia !== undefined ? endereco_franquia : current.endereco_franquia,
      cidade_franquia: cidade_franquia !== undefined ? cidade_franquia : current.cidade_franquia,
      estado_franquia: estado_franquia !== undefined ? estado_franquia : current.estado_franquia,
      telefone_franquia: telefone_franquia !== undefined ? telefone_franquia : current.telefone_franquia,
      email_franquia: email_franquia !== undefined ? email_franquia : current.email_franquia
    };

    const updateResult = await query(
      'UPDATE franquia SET nome_franquia = $1, endereco_franquia = $2, cidade_franquia = $3, estado_franquia = $4, telefone_franquia = $5, email_franquia = $6 WHERE id_franquia = $7 RETURNING *',
      [updatedFields.nome_franquia, updatedFields.endereco_franquia, updatedFields.cidade_franquia, updatedFields.estado_franquia, updatedFields.telefone_franquia, updatedFields.email_franquia, id]
    );

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar franquia:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.deletarFranquia = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Verifica se a franquia existe
    const existingResult = await query(
      'SELECT * FROM franquia WHERE id_franquia = $1',
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Franquia não encontrada' });
    }

    await query(
      'DELETE FROM franquia WHERE id_franquia = $1',
      [id]
    );

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar franquia:', error);

    if (error.code === '23503') {
      return res.status(400).json({
        error: 'Não é possível deletar franquia com dependências associadas'
      });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
