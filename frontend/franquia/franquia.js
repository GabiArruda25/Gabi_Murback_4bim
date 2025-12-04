
// Configuração da API, IP e porta.
const API_BASE_URL = 'http://localhost:3001';
let currentFranquiaId = null;
let operacao = null;

// Elementos do DOM
const form = document.getElementById('franquiaForm');
const searchId = document.getElementById('searchId');
const btnBuscar = document.getElementById('btnBuscar');
const btnIncluir = document.getElementById('btnIncluir');
const btnAlterar = document.getElementById('btnAlterar');
const btnExcluir = document.getElementById('btnExcluir');
const btnCancelar = document.getElementById('btnCancelar');
const btnSalvar = document.getElementById('btnSalvar');
const franquiasTableBody = document.getElementById('franquiasTableBody');
const messageContainer = document.getElementById('messageContainer');

// Carregar lista de franquias ao inicializar
document.addEventListener('DOMContentLoaded', () => {
    carregarFranquias();
});

// Event Listeners
btnBuscar.addEventListener('click', buscarFranquia);
btnIncluir.addEventListener('click', incluirFranquia);
btnAlterar.addEventListener('click', alterarFranquia);
btnExcluir.addEventListener('click', excluirFranquia);
btnCancelar.addEventListener('click', cancelarOperacao);
btnSalvar.addEventListener('click', salvarOperacao);

mostrarBotoes(true, false, false, false, false, false);
bloquearCampos(false);

// Função para mostrar mensagens
function mostrarMensagem(texto, tipo = 'info') {
    messageContainer.innerHTML = `<div class="message ${tipo}">${texto}</div>`;
    setTimeout(() => {
        messageContainer.innerHTML = '';
    }, 3000);
}

function bloquearCampos(bloquearPrimeiro) {
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach((input, index) => {
        if (index === 0) {
            input.disabled = bloquearPrimeiro;
        } else {
            input.disabled = !bloquearPrimeiro;
        }
    });
}

// Função para limpar formulário
function limparFormulario() {
    form.reset();
}

function mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar) {
    btnBuscar.style.display = btBuscar ? 'inline-block' : 'none';
    btnIncluir.style.display = btIncluir ? 'inline-block' : 'none';
    btnAlterar.style.display = btAlterar ? 'inline-block' : 'none';
    btnExcluir.style.display = btExcluir ? 'inline-block' : 'none';
    btnSalvar.style.display = btSalvar ? 'inline-block' : 'none';
    btnCancelar.style.display = btCancelar ? 'inline-block' : 'none';
}

// Função para buscar franquia por ID
async function buscarFranquia() {
    const id = searchId.value.trim();
    if (!id) {
        mostrarMensagem('Digite um ID para buscar', 'warning');
        return;
    }
    bloquearCampos(false);
    searchId.focus();
    try {
        const response = await fetch(`${API_BASE_URL}/franquias/${id}`);

        if (response.ok) {
            const franquia = await response.json();
            preencherFormulario(franquia);

            mostrarBotoes(true, false, true, true, false, false);
            mostrarMensagem('Franquia encontrada!', 'success');

        } else if (response.status === 404) {
            limparFormulario();
            searchId.value = id;
            mostrarBotoes(true, true, false, false, false, false);
            mostrarMensagem('Franquia não encontrada. Você pode incluir uma nova franquia.', 'info');
            bloquearCampos(false);
        } else {
            throw new Error('Erro ao buscar franquia');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao buscar franquia', 'error');
    }
}

// Função para preencher formulário com dados da franquia
function preencherFormulario(franquia) {
    currentFranquiaId = franquia.id_franquia;
    searchId.value = franquia.id_franquia;
    document.getElementById('nome_franquia').value = franquia.nome_franquia || '';
    document.getElementById('endereco_franquia').value = franquia.endereco_franquia || '';
    document.getElementById('cidade_franquia').value = franquia.cidade_franquia || '';
    document.getElementById('estado_franquia').value = franquia.estado_franquia || '';
    document.getElementById('telefone_franquia').value = franquia.telefone_franquia || '';
    document.getElementById('email_franquia').value = franquia.email_franquia || '';
}

// Função para incluir franquia
async function incluirFranquia() {
    mostrarMensagem('Digite os dados!', 'success');
    currentFranquiaId = searchId.value;
    limparFormulario();
    searchId.value = currentFranquiaId;
    bloquearCampos(true);

    mostrarBotoes(false, false, false, false, true, true);
    document.getElementById('nome_franquia').focus();
    operacao = 'incluir';
}

// Função para alterar franquia
async function alterarFranquia() {
    mostrarMensagem('Digite os dados!', 'success');
    bloquearCampos(true);
    mostrarBotoes(false, false, false, false, true, true);
    document.getElementById('nome_franquia').focus();
    operacao = 'alterar';
}

// Função para excluir franquia
async function excluirFranquia() {
    mostrarMensagem('Excluindo franquia...', 'info');
    currentFranquiaId = searchId.value;
    searchId.disabled = true;
    bloquearCampos(false);
    mostrarBotoes(false, false, false, false, true, true);
    operacao = 'excluir';
}

async function salvarOperacao() {
    console.log('Operação:', operacao + ' - currentFranquiaId: ' + currentFranquiaId + ' - searchId: ' + searchId.value);

    const formData = new FormData(form);
    const franquia = {
        nome_franquia: formData.get('nome_franquia'),
        endereco_franquia: formData.get('endereco_franquia'),
        cidade_franquia: formData.get('cidade_franquia'),
        estado_franquia: formData.get('estado_franquia'),
        telefone_franquia: formData.get('telefone_franquia'),
        email_franquia: formData.get('email_franquia')
    };
    let response = null;
    try {
        if (operacao === 'incluir') {
            response = await fetch(`${API_BASE_URL}/franquias`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(franquia)
            });
        } else if (operacao === 'alterar') {
            response = await fetch(`${API_BASE_URL}/franquias/${currentFranquiaId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(franquia)
            });
        } else if (operacao === 'excluir') {
            response = await fetch(`${API_BASE_URL}/franquias/${currentFranquiaId}`, {
                method: 'DELETE'
            });
            console.log('Franquia excluída' + response.status);
        }
        if (response.ok && (operacao === 'incluir' || operacao === 'alterar')) {
            const novaFranquia = await response.json();
            mostrarMensagem('Operação ' + operacao + ' realizada com sucesso!', 'success');
            limparFormulario();
            carregarFranquias();

        } else if (operacao !== 'excluir') {
            const error = await response.json();
            mostrarMensagem(error.error || 'Erro ao processar franquia', 'error');
        } else {
            mostrarMensagem('Franquia excluída com sucesso!', 'success');
            limparFormulario();
            carregarFranquias();
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao processar a franquia', 'error');
    }

    mostrarBotoes(true, false, false, false, false, false);
    bloquearCampos(false);
    document.getElementById('searchId').focus();
}

// Função para cancelar operação
function cancelarOperacao() {
    limparFormulario();
    mostrarBotoes(true, false, false, false, false, false);
    bloquearCampos(false);
    document.getElementById('searchId').focus();
    mostrarMensagem('Operação cancelada', 'info');
}

// Função para carregar lista de franquias
async function carregarFranquias() {
    try {
        const response = await fetch(`${API_BASE_URL}/franquias`);
        if (response.ok) {
            const franquias = await response.json();
            renderizarTabelaFranquias(franquias);
        } else {
            throw new Error('Erro ao carregar franquias');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao carregar lista de franquias', 'error');
    }
}

// Função para renderizar tabela de franquias
function renderizarTabelaFranquias(franquias) {
    franquiasTableBody.innerHTML = '';

    franquias.forEach(franquia => {
        const row = document.createElement('tr');
        row.innerHTML = `
                    <td>
                        <button class="btn-id" onclick="selecionarFranquia(${franquia.id_franquia})">
                            ${franquia.id_franquia}
                        </button>
                    </td>
                    <td>${franquia.nome_franquia}</td>
                    <td>${franquia.endereco_franquia || ''}</td>
                    <td>${franquia.cidade_franquia}</td>
                    <td>${franquia.estado_franquia}</td>
                    <td>${franquia.telefone_franquia || ''}</td>
                    <td>${franquia.email_franquia || ''}</td>
                `;
        franquiasTableBody.appendChild(row);
    });
}

// Função para selecionar franquia da tabela
async function selecionarFranquia(id) {
    searchId.value = id;
    await buscarFranquia();
}
