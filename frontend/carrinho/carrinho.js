// Configuração da API
const API_BASE_URL = 'http://localhost:3001';

// Elementos do DOM
const carrinhoVazio = document.getElementById('carrinhoVazio');
const carrinhoConteudo = document.getElementById('carrinhoConteudo');
const itensCarrinho = document.getElementById('itensCarrinho');
const subtotalElement = document.getElementById('subtotal');
const totalElement = document.getElementById('total');
const messageContainer = document.getElementById('messageContainer');
const btnLimparCarrinho = document.getElementById('btnLimparCarrinho');
const btnFinalizarPagamento = document.getElementById('btnFinalizarPagamento');

// Variáveis globais
let carrinho = [];
let usuarioLogado = null;

// ========================================
// INICIALIZAÇÃO - ORDEM CORRETA
// ========================================
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('🚀 [CARRINHO] Inicializando...');
        
        // 1. VERIFICAR USUÁRIO NO BACKEND PRIMEIRO
        const autenticado = await verificarUsuarioLogado();
        
        // 2. SE NÃO ESTÁ LOGADO, REDIRECIONAR IMEDIATAMENTE
        if (!autenticado || !usuarioLogado) {
            console.log('❌ [AUTH] Usuário não autenticado!');
            mostrarMensagem('Você precisa estar logado para acessar o carrinho', 'error');
            setTimeout(() => {
                window.location.href = '../auth/login.html';
            }, 2000);
            return;
        }
        
        console.log('✅ [AUTH] Usuário autenticado:', usuarioLogado.nome);
        
        // 3. ATUALIZAR HEADER COM NOME DO USUÁRIO
        atualizarHeaderUsuario();
        
        // 4. CARREGAR CARRINHO
        carregarCarrinho();
        
        // 5. ATUALIZAR INTERFACE
        atualizarInterface();
        
        // 6. CONFIGURAR EVENT LISTENERS
        configurarEventListeners();
        
        console.log('✅ [CARRINHO] Inicializado com sucesso!');
        console.log('👤 [USUÁRIO ATUAL]:', usuarioLogado.nome);
        console.log('🛒 [CARRINHO]:', carrinho.length, 'itens');
        
    } catch (error) {
        console.error('❌ [ERRO FATAL] Erro ao inicializar:', error);
        mostrarMensagem('Erro ao carregar o carrinho', 'error');
        setTimeout(() => {
            window.location.href = '../auth/login.html';
        }, 2000);
    }
});

// ========================================
// VERIFICAR USUÁRIO LOGADO - VERSÃO ROBUSTA
// ========================================
async function verificarUsuarioLogado() {
    try {
        console.log('\n🔍 [AUTH] Verificando autenticação...');
        console.log('╔════════════════════════════════════════╗');
        
        const response = await fetch(`${API_BASE_URL}/auth/user`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache'
            }
        });
        
        console.log('📨 [BACKEND] Status:', response.status);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📦 [BACKEND] Dados recebidos:', JSON.stringify(data, null, 2));
        
        if (data.logged && data.cpf && data.nome) {
            usuarioLogado = {
                id: data.cpf,
                nome: data.nome,
                email: data.email || '',
                tipo: data.is_funcionario ? 'funcionario' : 'cliente',
                cargo: data.cargo || null,
                isGerente: data.cargo === 'gerente'
            };
            
            console.log('✅ [AUTH] Usuário autenticado!');
            console.log('   👤 Nome:', usuarioLogado.nome);
            console.log('   🆔 CPF:', usuarioLogado.id);
            console.log('╚════════════════════════════════════════╝\n');
            
            sessionStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
            
            return true;
        } else {
            console.log('❌ [AUTH] Usuário não autenticado');
            console.log('╚════════════════════════════════════════╝\n');
            usuarioLogado = null;
            sessionStorage.removeItem('usuarioLogado');
            return false;
        }
        
    } catch (error) {
        console.error('❌ [AUTH] Erro ao verificar usuário:', error);
        console.log('╚════════════════════════════════════════╝\n');
        usuarioLogado = null;
        sessionStorage.removeItem('usuarioLogado');
        return false;
    }
}

// ========================================
// ATUALIZAR HEADER COM INFO DO USUÁRIO
// ========================================
function atualizarHeaderUsuario() {
    if (!usuarioLogado) {
        console.log('⚠️ [HEADER] Sem usuário para exibir');
        return;
    }
    
    const headerElement = document.querySelector('.header h1');
    if (!headerElement) {
        console.log('⚠️ [HEADER] Elemento h1 não encontrado');
        return;
    }
    
    // Remover info de usuário anterior se existir
    const existingUserInfo = document.querySelector('.user-info-header');
    if (existingUserInfo) {
        existingUserInfo.remove();
    }
    
    // Criar ou obter o container esquerdo
    let headerLeft = document.querySelector('.header-left');
    if (!headerLeft) {
        headerLeft = document.createElement('div');
        headerLeft.className = 'header-left';
        headerElement.parentNode.insertBefore(headerLeft, headerElement);
        headerLeft.appendChild(headerElement);
    }
    
    // Criar div com informações do usuário
    const userInfoDiv = document.createElement('div');
    userInfoDiv.className = 'user-info-header';
    
    // Adicionar badge de gerente se aplicável
    let badgeHTML = '';
    if (usuarioLogado.tipo === 'funcionario' && usuarioLogado.cargo && usuarioLogado.cargo.toLowerCase() === 'gerente') {
        badgeHTML = `<span class="user-badge">👑 Gerente</span>`;
    }
    
    userInfoDiv.innerHTML = `
        <span class="user-greeting">Olá,</span>
        <span class="user-name-display">${usuarioLogado.nome}</span>
        ${badgeHTML}
    `;
    
    headerLeft.appendChild(userInfoDiv);
    
    console.log('✅ [HEADER] Atualizado com:', usuarioLogado.nome);
}

// ========================================
// CARREGAR CARRINHO - DO sessionStorage
// ========================================
function carregarCarrinho() {
    try {
        console.log('📂 [CARRINHO] Carregando do sessionStorage...');
        
        const carrinhoSalvo = sessionStorage.getItem('carrinho');
        
        if (carrinhoSalvo) {
            try {
                carrinho = JSON.parse(carrinhoSalvo);
                
                carrinho = carrinho.map(item => ({
                    ...item,
                    quantidade: parseInt(item.quantidade) || 1,
                    preco: parseFloat(item.preco) || 0
                }));
                
                console.log('✅ [CARRINHO] Carregado:', carrinho.length, 'itens');
            } catch (error) {
                console.error('❌ [CARRINHO] Erro ao parsear:', error);
                carrinho = [];
                sessionStorage.removeItem('carrinho');
            }
        } else {
            console.log('ℹ️ [CARRINHO] Vazio');
            carrinho = [];
        }
        
        return carrinho;
    } catch (error) {
        console.error('❌ [CARRINHO] Erro ao carregar:', error);
        carrinho = [];
        return [];
    }
}

// ========================================
// SALVAR CARRINHO - NO sessionStorage
// ========================================
function salvarCarrinho() {
    try {
        console.log('💾 [CARRINHO] Salvando no sessionStorage...');
        
        sessionStorage.setItem('carrinho', JSON.stringify(carrinho || []));
        
        console.log('✅ [CARRINHO] Salvo:', carrinho.length, 'itens');
        return true;
    } catch (error) {
        console.error('❌ [CARRINHO] Erro ao salvar:', error);
        mostrarMensagem('Erro ao salvar o carrinho. Tente novamente.', 'error');
        return false;
    }
}

// ========================================
// FINALIZAR PAGAMENTO
// ========================================
function finalizarPagamento() {
    console.log('\n💳 [FINALIZAR] Iniciando finalização...');
    console.log('╔════════════════════════════════════════╗');
    
    // 1. VERIFICAR CARRINHO
    console.log('📋 [FINALIZAR] Verificando carrinho...');
    
    if (!carrinho || carrinho.length === 0) {
        console.log('❌ [FINALIZAR] Carrinho vazio!');
        mostrarMensagem('Seu carrinho está vazio!', 'error');
        return;
    }
    console.log('✅ [FINALIZAR] Carrinho OK:', carrinho.length, 'itens');
    
    // 2. VERIFICAR USUÁRIO
    console.log('👤 [FINALIZAR] Verificando usuário...');
    
    if (!usuarioLogado || !usuarioLogado.id || !usuarioLogado.nome) {
        console.log('❌ [FINALIZAR] Sem usuário válido!');
        console.log('╚════════════════════════════════════════╝\n');
        mostrarMensagem('Sessão expirada. Faça login novamente.', 'error');
        setTimeout(() => {
            window.location.href = '../auth/login.html';
        }, 2000);
        return;
    }
    
    console.log('✅ [FINALIZAR] Usuário OK:', usuarioLogado.nome);
    
    // 3. SALVAR DADOS ANTES DO REDIRECIONAMENTO
    console.log('💾 [FINALIZAR] Salvando dados...');
    
    const carrinhoJSON = JSON.stringify(carrinho);
    const usuarioJSON = JSON.stringify(usuarioLogado);
    
    sessionStorage.setItem('carrinho', carrinhoJSON);
    sessionStorage.setItem('usuarioLogado', usuarioJSON);
    localStorage.setItem('carrinho', carrinhoJSON);
    localStorage.setItem('usuarioLogado', usuarioJSON);
    
    console.log('✅ [FINALIZAR] Dados salvos!');
    console.log('╚════════════════════════════════════════╝');
    
    // 4. REDIRECIONAR
    console.log('🚀 [FINALIZAR] Redirecionando...');
    
    setTimeout(() => {
        window.location.href = '../finalizacao/finalizacao.html';
    }, 100);
}

// ========================================
// EVENT LISTENERS
// ========================================
function configurarEventListeners() {
    if (btnLimparCarrinho) {
        btnLimparCarrinho.addEventListener('click', limparCarrinho);
    }
    
    if (btnFinalizarPagamento) {
        btnFinalizarPagamento.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('🖱️ [CLICK] Botão Finalizar Pagamento clicado');
            finalizarPagamento();
        });
    } else {
        console.warn('⚠️ Botão btnFinalizarPagamento não encontrado!');
    }
}

// ========================================
// MOSTRAR MENSAGENS
// ========================================
function mostrarMensagem(texto, tipo = 'info') {
    if (!messageContainer) {
        console.log(`[${tipo.toUpperCase()}] ${texto}`);
        return;
    }
    
    messageContainer.innerHTML = `<div class="message ${tipo}">${texto}</div>`;
    
    if (messageContainer.timeoutId) {
        clearTimeout(messageContainer.timeoutId);
    }
    
    messageContainer.timeoutId = setTimeout(() => {
        if (messageContainer) {
            messageContainer.innerHTML = '';
        }
    }, 4000);
}

// ========================================
// REMOVER ITEM DO CARRINHO
// ========================================
function removerDoCarrinho(idProduto) {
    if (!idProduto) return;
    
    const index = carrinho.findIndex(item => item && item.id_produto === idProduto);
    if (index !== -1) {
        const nomeItem = carrinho[index]?.nome_produto || 'Item';
        carrinho.splice(index, 1);
        const salvou = salvarCarrinho();
        if (salvou) {
            atualizarInterface();
            mostrarMensagem(`${nomeItem} removido do carrinho!`, 'success');
        }
    }
}

// ========================================
// ATUALIZAR QUANTIDADE
// ========================================
function atualizarQuantidade(idProduto, novaQuantidade) {
    if (!idProduto || isNaN(novaQuantidade) || novaQuantidade < 0) return;
    
    const item = carrinho.find(item => item && item.id_produto === idProduto);
    if (item) {
        if (novaQuantidade <= 0) {
            removerDoCarrinho(idProduto);
        } else {
            item.quantidade = parseInt(novaQuantidade);
            const salvou = salvarCarrinho();
            if (salvou) {
                atualizarInterface();
            }
        }
    }
}

// ========================================
// LIMPAR CARRINHO
// ========================================
function limparCarrinho() {
    if (!carrinho || carrinho.length === 0) {
        mostrarMensagem('O carrinho já está vazio!', 'info');
        return;
    }
    
    if (confirm('Tem certeza que deseja remover todos os itens do carrinho?')) {
        carrinho = [];
        const salvou = salvarCarrinho();
        if (salvou) {
            atualizarInterface();
            mostrarMensagem('Carrinho limpo com sucesso!', 'success');
        }
    }
}

// ========================================
// CALCULAR SUBTOTAL
// ========================================
function calcularSubtotal() {
    return carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0);
}

// ========================================
// CALCULAR TOTAL
// ========================================
function calcularTotal() {
    return calcularSubtotal();
}

// ========================================
// ATUALIZAR INTERFACE
// ========================================
function atualizarInterface() {
    if (!carrinhoVazio || !carrinhoConteudo) return;
    
    if (carrinho.length === 0) {
        carrinhoVazio.style.display = 'block';
        carrinhoConteudo.style.display = 'none';
    } else {
        carrinhoVazio.style.display = 'none';
        carrinhoConteudo.style.display = 'grid';
        renderizarItens();
        atualizarResumo();
    }
}

// ========================================
// RENDERIZAR ITENS
// ========================================
function renderizarItens() {
    if (!itensCarrinho) return;
    
    itensCarrinho.innerHTML = '';
    
    carrinho.forEach(item => {
        const itemElement = criarElementoItem(item);
        itensCarrinho.appendChild(itemElement);
    });
}

// ========================================
// CONSTRUIR URL DA IMAGEM
// ========================================
function construirUrlImagem(idProduto) {
    if (!idProduto) {
        return 'https://via.placeholder.com/80?text=Sem+Imagem';
    }
    
    return `${API_BASE_URL}/uploads/images/${idProduto}.png`;
}

// ========================================
// CRIAR ELEMENTO DO ITEM
// ========================================
function criarElementoItem(item) {
    if (!item) return document.createElement('div');
    
    const itemElement = document.createElement('div');
    itemElement.className = 'item-carrinho';
    
    try {
        const imagemUrl = construirUrlImagem(item.id_produto);
        const nomeProduto = item.nome_produto || 'Produto sem nome';
        const preco = parseFloat(item.preco) || 0;
        const quantidade = parseInt(item.quantidade) || 1;
        const subtotal = preco * quantidade;
        
        itemElement.innerHTML = `
            <div class="item-imagem">
                <img src="${imagemUrl}" 
                     alt="${nomeProduto}" 
                     onerror="this.onerror=null; this.src='https://via.placeholder.com/80?text=Sem+Imagem';">
            </div>
            <div class="item-info">
                <h4>${nomeProduto}</h4>
                <p class="item-preco">R$ ${preco.toFixed(2).replace('.', ',')}</p>
            </div>
            <div class="quantidade-controles">
                <button class="btn-quantidade" data-action="decrease" data-id="${item.id_produto}">-</button>
                <input type="number" class="quantidade-input" value="${quantidade}" min="1" data-id="${item.id_produto}" readonly>
                <button class="btn-quantidade" data-action="increase" data-id="${item.id_produto}">+</button>
            </div>
            <div class="item-subtotal">R$ ${subtotal.toFixed(2).replace('.', ',')}</div>
            <button class="btn-remover" data-id="${item.id_produto}">🗑️</button>
        `;
        
        const btnsQuantidade = itemElement.querySelectorAll('.btn-quantidade');
        btnsQuantidade.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const action = btn.getAttribute('data-action');
                const idProduto = parseInt(btn.getAttribute('data-id'));
                const item = carrinho.find(i => i && i.id_produto === idProduto);
                
                if (!item) return;
                
                if (action === 'increase') {
                    atualizarQuantidade(idProduto, item.quantidade + 1);
                } else if (action === 'decrease') {
                    if (item.quantidade > 1) {
                        atualizarQuantidade(idProduto, item.quantidade - 1);
                    } else {
                        removerDoCarrinho(idProduto);
                    }
                }
            });
        });
        
        const btnRemover = itemElement.querySelector('.btn-remover');
        if (btnRemover) {
            btnRemover.addEventListener('click', (e) => {
                e.preventDefault();
                const idProduto = parseInt(btnRemover.getAttribute('data-id'));
                if (confirm('Tem certeza que deseja remover este item do carrinho?')) {
                    removerDoCarrinho(idProduto);
                }
            });
        }
        
    } catch (error) {
        console.error('❌ Erro ao criar elemento do item:', error);
        itemElement.innerHTML = '<div class="error">Erro ao carregar o item</div>';
    }
    
    return itemElement;
}

// ========================================
// ATUALIZAR RESUMO
// ========================================
function atualizarResumo() {
    const subtotal = calcularSubtotal();
    const total = calcularTotal();
    
    if (subtotalElement) {
        subtotalElement.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    }
    if (totalElement) {
        totalElement.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    }
}

// ========================================
// FUNÇÕES GLOBAIS EXPORTADAS
// ========================================
window.adicionarAoCarrinho = (produto, quantidade = 1) => {
    const itemExistente = carrinho.find(item => item.id_produto === produto.id_produto);
    
    if (itemExistente) {
        itemExistente.quantidade += quantidade;
    } else {
        carrinho.push({
            id_produto: produto.id_produto,
            nome_produto: produto.nome_produto,
            preco: produto.preco,
            quantidade: quantidade
        });
    }
    
    salvarCarrinho();
    atualizarInterface();
    mostrarMensagem(`${produto.nome_produto} adicionado ao carrinho!`, 'success');
};

window.obterQuantidadeItens = () => {
    return carrinho.reduce((total, item) => total + item.quantidade, 0);
};

window.obterTotalCarrinho = () => {
    return calcularTotal();
};

console.log('✅ carrinho.js corrigido carregado com sucesso!');