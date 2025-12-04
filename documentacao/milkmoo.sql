-- ================================
-- SQL para banco de dados MilkMoo
-- Sistema de Gestão de Franquias
-- PostgreSQL
-- ================================

-- Configuração do schema
SET search_path TO public;

-- ================================
-- Tabela pessoa (base para cliente e funcionário)
-- ================================
CREATE TABLE IF NOT EXISTS pessoa (
    cpf VARCHAR(11) PRIMARY KEY,
    nome_pessoa VARCHAR(100) NOT NULL,
    email_pessoa VARCHAR(100) NOT NULL UNIQUE,
    senha_pessoa VARCHAR(20) NOT NULL
);

-- ================================
-- Tabela cliente
-- ================================
CREATE TABLE IF NOT EXISTS cliente (
    cpf VARCHAR(11) PRIMARY KEY,
    FOREIGN KEY (cpf) REFERENCES pessoa(cpf)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ================================
-- Tabela cargo
-- ================================
CREATE TABLE IF NOT EXISTS cargo (
    id_cargo SERIAL PRIMARY KEY,
    nome_cargo VARCHAR(100) NOT NULL UNIQUE
);

-- ================================
-- Tabela funcionario
-- ================================
CREATE TABLE IF NOT EXISTS funcionario (
    cpf VARCHAR(11) PRIMARY KEY,
    id_cargo INT NOT NULL,
    salario DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (cpf) REFERENCES pessoa(cpf)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_cargo) REFERENCES cargo(id_cargo)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ================================
-- Tabela franquia (NOVA)
-- ================================
CREATE TABLE IF NOT EXISTS franquia (
    id_franquia SERIAL PRIMARY KEY,
    nome_franquia VARCHAR(100) NOT NULL,
    endereco_franquia VARCHAR(200),
    cidade_franquia VARCHAR(100) NOT NULL,
    estado_franquia VARCHAR(2) NOT NULL,
    telefone_franquia VARCHAR(20),
    email_franquia VARCHAR(100)
);

-- ================================
-- Tabela categoria
-- ================================
CREATE TABLE IF NOT EXISTS categoria (
    id_categoria SERIAL PRIMARY KEY,
    nome_categoria VARCHAR(100) NOT NULL UNIQUE
);

-- ================================
-- Tabela produto
-- ================================
CREATE TABLE IF NOT EXISTS produto (
    id_produto SERIAL PRIMARY KEY,
    nome_produto VARCHAR(100) NOT NULL UNIQUE,
    preco DECIMAL(10, 2) NOT NULL,
    id_categoria INT NOT NULL,
    quantidade_estoque INT NOT NULL,
    imagem_produto VARCHAR(255),
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ================================
-- Tabela pedido
-- ================================
CREATE TABLE IF NOT EXISTS pedido (
    id_pedido SERIAL PRIMARY KEY,
    cpf VARCHAR(11) NOT NULL,
    data_pedido DATE NOT NULL,
    valor_total DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (cpf) REFERENCES pessoa(cpf)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ================================
-- Tabela pedidoproduto
-- ================================
CREATE TABLE IF NOT EXISTS pedidoproduto (
    id_produto INT NOT NULL,
    id_pedido INT NOT NULL,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (id_produto, id_pedido),
    FOREIGN KEY (id_produto) REFERENCES produto(id_produto)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_pedido) REFERENCES pedido(id_pedido)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ================================
-- Tabela pagamento
-- ================================
CREATE TABLE IF NOT EXISTS pagamento (
    id_pagamento SERIAL PRIMARY KEY,
    id_pedido INT NOT NULL,
    data_pagamento DATE NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_pedido) REFERENCES pedido(id_pedido)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ================================
-- Tabela forma_pagamento
-- ================================
CREATE TABLE IF NOT EXISTS forma_pagamento (
    id_forma_pagamento SERIAL PRIMARY KEY,
    nome_forma VARCHAR(50) NOT NULL UNIQUE
);

-- ================================
-- Tabela pagamento_has_formapagamento
-- ================================
CREATE TABLE IF NOT EXISTS pagamento_has_formapagamento (
    id_pagamento_res SERIAL PRIMARY KEY,
    id_pagamento INT NOT NULL,
    id_forma_pagamento INT NOT NULL,
    valor_pago DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_pagamento) REFERENCES pagamento(id_pagamento)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_forma_pagamento) REFERENCES forma_pagamento(id_forma_pagamento)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ===================================================================
-- ============================ INSERTS ==============================
-- ===================================================================

-- Pessoa
INSERT INTO pessoa (cpf, nome_pessoa, email_pessoa, senha_pessoa) VALUES
('11111111111','Gabriela Arruda Murback','gabriela@milkmoo.com.br','1234'),
('22222222222','Carlos Oliveira','carlos@milkmoo.com.br','1234'),
('33333333333','Mariana Santos','mariana@milkmoo.com.br','1234'),
('44444444444','Pedro Henrique','pedro@milkmoo.com.br','1234'),
('55555555555','Juliana Costa','juliana@milkmoo.com.br','1234'),
('66666666666','Roberto Silva','roberto@milkmoo.com.br','1234'),
('77777777777','Fernanda Rocha','fernanda@milkmoo.com.br','1234'),
('88888888888','Lucas Ferreira','lucas@milkmoo.com.br','1234'),
('99999999999','Patrícia Melo','patricia@milkmoo.com.br','1234'),
('10101010101','Ricardo Gomes','ricardo@milkmoo.com.br','1234')
ON CONFLICT (cpf) DO NOTHING;

-- Cargo
INSERT INTO cargo (id_cargo, nome_cargo) VALUES
(1,'Atendente'),
(2,'Barista'),
(3,'Confeiteiro'),
(4,'Caixa'),
(5,'Gerente'),
(6,'Auxiliar de Limpeza'),
(7,'Estoquista'),
(8,'Entregador'),
(9,'Supervisor'),
(10,'Franqueado')
ON CONFLICT (id_cargo) DO NOTHING;

-- Funcionario
INSERT INTO funcionario (cpf, id_cargo, salario) VALUES
('11111111111',5,4500.00),
('22222222222',2,2800.00),
('33333333333',3,2600.00),
('44444444444',4,2100.00),
('55555555555',10,8000.00),
('66666666666',6,1800.00),
('77777777777',7,2000.00),
('88888888888',8,1900.00),
('99999999999',9,3500.00),
('10101010101',1,2200.00)
ON CONFLICT (cpf) DO NOTHING;

-- Cliente
INSERT INTO cliente (cpf) VALUES
('11111111111'),
('22222222222'),
('33333333333'),
('44444444444'),
('55555555555'),
('66666666666'),
('77777777777'),
('88888888888'),
('99999999999'),
('10101010101')
ON CONFLICT (cpf) DO NOTHING;

-- Franquia (NOVA)
INSERT INTO franquia (id_franquia, nome_franquia, endereco_franquia, cidade_franquia, estado_franquia, telefone_franquia, email_franquia) VALUES
(1,'MilkMoo Centro','Av. Brasil, 1000','São Paulo','SP','11987654321','centro@milkmoo.com.br'),
(2,'MilkMoo Shopping','Rua das Flores, 500','Curitiba','PR','41987654322','shopping@milkmoo.com.br'),
(3,'MilkMoo Jardins','Av. Paulista, 2000','São Paulo','SP','11987654323','jardins@milkmoo.com.br'),
(4,'MilkMoo Batel','Rua Comendador Araújo, 300','Curitiba','PR','41987654324','batel@milkmoo.com.br'),
(5,'MilkMoo Zona Sul','Av. Ibirapuera, 1500','São Paulo','SP','11987654325','zonasul@milkmoo.com.br')
ON CONFLICT (id_franquia) DO NOTHING;

-- Categoria
INSERT INTO categoria (id_categoria, nome_categoria) VALUES
(1,'Milkshakes'),
(2,'Salgados')
ON CONFLICT (id_categoria) DO NOTHING;

-- Produto
INSERT INTO produto (id_produto, nome_produto, preco, id_categoria, quantidade_estoque) VALUES
(1,'Milkshake Morango',18.00,1,150),
(2,'Milkshake Chocolate',18.00,1,150),
(3,'Milkshake Baunilha',18.00,1,150),
(4,'Milkshake Oreo',22.00,1,100),
(5,'Coxinha de Frango',8.00,2,200),
(6,'Esfiha de Carne',7.00,2,180),
(7,'Pão de Queijo Recheado',9.00,2,150),
(8,'Mini Pizza Calabresa',12.00,2,100)
ON CONFLICT (id_produto) DO NOTHING;

-- Pedido
INSERT INTO pedido (id_pedido, cpf, data_pedido, valor_total) VALUES
(1,'11111111111','2025-11-01',54.00), -- 3 Milkshake Morango
(2,'22222222222','2025-11-02',36.00), -- 2 Milkshake Chocolate
(3,'33333333333','2025-11-03',30.00), -- 3 Coxinha de Frango + 1 Esfiha
(4,'44444444444','2025-11-04',44.00), -- 2 Milkshake Oreo
(5,'55555555555','2025-11-05',45.00), -- 5 Pão de Queijo Recheado
(6,'66666666666','2025-11-06',36.00),
(7,'77777777777','2025-11-07',55.00),
(8,'88888888888','2025-11-08',31.00),
(9,'99999999999','2025-11-09',47.00),
(10,'10101010101','2025-11-10',60.00)
ON CONFLICT (id_pedido) DO NOTHING;

-- Forma de pagamento
INSERT INTO forma_pagamento (id_forma_pagamento, nome_forma) VALUES
(1,'Dinheiro'),
(2,'Cartão Débito'),
(3,'Cartão Crédito'),
(4,'Pix - 44997350434 - Gabriela Arruda Murback'),
(5,'Vale Alimentação'),
(6,'Transferência'),
(7,'Boleto'),
(8,'Cheque'),
(9,'Carteira Digital'),
(10,'Crediário')
ON CONFLICT (id_forma_pagamento) DO NOTHING;

-- Pagamento
INSERT INTO pagamento (id_pagamento, id_pedido, data_pagamento, valor_total) VALUES
(1,1,'2025-11-01',50.00),
(2,2,'2025-11-02',35.00),
(3,3,'2025-11-03',42.00),
(4,4,'2025-11-04',28.00),
(5,5,'2025-11-05',65.00)
ON CONFLICT (id_pagamento) DO NOTHING;

-- Pagamento_has_formapagamento
INSERT INTO pagamento_has_formapagamento (id_pagamento_res, id_pagamento, id_forma_pagamento, valor_pago) VALUES
(1,1,4,30.00),
(2,1,1,20.00),
(3,2,4,35.00),
(4,3,3,42.00),
(5,4,2,28.00)
ON CONFLICT (id_pagamento_res) DO NOTHING;

-- PedidoProduto
INSERT INTO pedidoproduto (id_produto, id_pedido, quantidade, preco_unitario) VALUES
(1,1,3,18.00), -- Milkshake Morango
(2,2,2,18.00), -- Milkshake Chocolate
(5,3,3,8.00), -- Coxinha de Frango
(6,3,1,7.00), -- Esfiha de Carne
(4,4,2,22.00), -- Milkshake Oreo
(7,5,5,9.00) -- Pão de Queijo Recheado
ON CONFLICT (id_produto, id_pedido) DO NOTHING;
