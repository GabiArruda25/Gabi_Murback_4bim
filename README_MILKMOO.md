# Sistema MilkMoo - Gestão de Franquias

## Descrição
Sistema de gestão para a rede de franquias MilkMoo, adaptado do projeto original de padaria. Mantém toda a estrutura funcional e adiciona gerenciamento de franquias.

## Alterações Realizadas

### 1. Tema Atualizado
- **De:** Padaria Doce Sabor
- **Para:** MilkMoo Franquias
- Todos os textos, títulos e referências foram atualizados para refletir o tema de franquia

### 2. Banco de Dados
- **Nome do banco:** `milkmoo`
- **Usuário:** `postgres`
- **Senha:** `Lageado001.`
- Arquivo SQL: `documentacao/milkmoo.sql`

### 3. Nova Funcionalidade: CRUD de Franquias
Adicionado gerenciamento completo de franquias no menu de Cadastros (visível apenas para gerentes).

**Campos da Franquia:**
- ID (auto-incremento)
- Nome da Franquia
- Endereço
- Cidade
- Estado (UF)
- Telefone
- Email

**Arquivos criados:**
- Backend:
  - `backend/controllers/franquiaController.js`
  - `backend/routes/franquiaRoutes.js`
- Frontend:
  - `frontend/franquia/franquia.html`
  - `frontend/franquia/franquia.css`
  - `frontend/franquia/franquia.js`

### 4. Informações de Pagamento Atualizadas
- **PIX:** 44997350434
- **Titular:** Gabriela Arruda Murback

## Instruções de Instalação

### Pré-requisitos
- Node.js e npm instalados
- PostgreSQL instalado
- pgAdmin4 (ou similar)

### Passo 1: Criar o Banco de Dados

1. Abra o pgAdmin4
2. Conecte-se ao servidor PostgreSQL
3. Crie um novo banco de dados chamado `milkmoo`
4. Abra uma janela de Query Tool
5. Copie e execute o conteúdo do arquivo `documentacao/milkmoo.sql`

### Passo 2: Configurar o Backend

O arquivo `backend/database.js` já está configurado com:
```javascript
user: 'postgres'
password: 'Lageado001.'
database: 'milkmoo'
```

Se necessário, ajuste essas configurações conforme seu ambiente.

### Passo 3: Instalar Dependências

```bash
cd backend
npm install
```

### Passo 4: Iniciar o Servidor

```bash
node backend/server.js
```

O servidor estará rodando em `http://localhost:3001`

### Passo 5: Executar o Frontend

1. Abra o arquivo `index.html` na raiz do projeto
2. Use o Live Server do VS Code ou similar
3. O sistema redirecionará automaticamente para `frontend/menu.html`

## Estrutura do Projeto

```
padaria-dw-bd-4bimestre/
├── backend/
│   ├── config/
│   ├── controllers/
│   │   ├── franquiaController.js (NOVO)
│   │   └── ...
│   ├── routes/
│   │   ├── franquiaRoutes.js (NOVO)
│   │   └── ...
│   ├── database.js (MODIFICADO)
│   └── server.js (MODIFICADO)
├── frontend/
│   ├── franquia/ (NOVO)
│   │   ├── franquia.html
│   │   ├── franquia.css
│   │   └── franquia.js
│   ├── menu.html (MODIFICADO)
│   ├── blog/blog.html (MODIFICADO)
│   ├── contato/contato.html (MODIFICADO)
│   └── ...
├── documentacao/
│   ├── milkmoo.sql (NOVO)
│   └── ...
└── index.html
```

## Funcionalidades

### Para Clientes
- Visualizar cardápio de produtos
- Fazer pedidos
- Acompanhar compras
- Contato

### Para Gerentes
- CRUD completo de:
  - Pessoas
  - Cargos
  - **Franquias (NOVO)**
  - Produtos
  - Categorias
  - Pedidos
  - Pagamentos
  - Formas de Pagamento
- Relatórios:
  - Vendas mensais
  - Produtos mais vendidos
  - Clientes que mais compram

## Acesso ao Sistema

### Login de Teste (Gerente)
- **Email:** gabriela@milkmoo.com.br
- **Senha:** 1234
- **Cargo:** Gerente

## Dados de Exemplo

O banco de dados já vem populado com:
- 10 pessoas (clientes e funcionários)
- 10 cargos
- 5 franquias
- 10 categorias de produtos
- 10 produtos
- 10 pedidos
- 10 formas de pagamento

## Observações Importantes

1. **Estrutura Mantida:** Toda a estrutura original do projeto foi preservada
2. **Compatibilidade:** O sistema continua funcionando exatamente como antes, apenas com o tema atualizado
3. **Nova Tabela:** A tabela `franquia` foi adicionada sem afetar as tabelas existentes
4. **Menu de Cadastros:** O link para CRUD de Franquias aparece apenas para usuários com perfil de gerente

## Suporte

Para dúvidas ou problemas, consulte a documentação original do projeto ou entre em contato através do email: contato@milkmoo.com.br

---

**© 2025 MilkMoo Franquias - Todos os direitos reservados**
