// Configuração da API
const API_BASE_URL = 'http://localhost:3001';

// Elementos do DOM
const messageContainer = document.getElementById('messageContainer');
const pedidoNumero = document.getElementById('pedidoNumero');
const pedidoTotal = document.getElementById('pedidoTotal');
const pixSection = document.getElementById('pix-section');
const cartaoSection = document.getElementById('cartao-section');
const qrcodeContainer = document.getElementById('qrcode');
const codigoPix = document.getElementById('codigoPix');
const btnCopiarPix = document.getElementById('btnCopiarPix');
const btnPagoPix = document.getElementById('btnPagoPix');
const formCartao = document.getElementById('formCartao');
const modal = document.getElementById('modalConfirmacao');
const modalNumeroPedido = document.getElementById('modalNumeroPedido');
const modalValorPedido = document.getElementById('modalValorPedido');
const btnFecharModal = document.getElementById('btnFecharModal');

// Variáveis globais
let pedidoId = null;
let valorTotal = 0;

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Obter dados da URL
    const urlParams = new URLSearchParams(window.location.search);
    pedidoId = urlParams.get('pedido_id');
    valorTotal = parseFloat(urlParams.get('total')) || 0;

    // Verificar se temos um pedido válido
    if (!pedidoId || isNaN(valorTotal) || valorTotal <= 0) {
        mostrarMensagem('Pedido inválido ou não encontrado.', 'error');
        return;
    }

    // Atualizar interface
    atualizarInterface();
    
    // Configurar event listeners
    configurarEventListeners();
    
    // Inicializar PIX (método padrão)
    inicializarPix();
});

// Configurar event listeners
function configurarEventListeners() {
    // Alternar entre PIX e Cartão
    document.querySelectorAll('input[name="metodo-pagamento"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'pix') {
                pixSection.style.display = 'block';
                cartaoSection.style.display = 'none';
            } else {
                pixSection.style.display = 'none';
                cartaoSection.style.display = 'block';
            }
        });
    });

    // Botão copiar PIX
    btnCopiarPix.addEventListener('click', copiarCodigoPix);
    
    // Botão de confirmação de pagamento PIX
    btnPagoPix.addEventListener('click', confirmarPagamentoPix);
    
    // Formulário de cartão
    formCartao.addEventListener('submit', processarPagamentoCartao);
    
    // Fechar modal
    btnFecharModal.addEventListener('click', () => {
        modal.style.display = 'none';
        window.location.href = '../cardapio/cardapio.html';
    });
    
    // Máscara para número do cartão
    document.getElementById('numeroCartao').addEventListener('input', formatarNumeroCartao);
    
    // Máscara para validade
    document.getElementById('validade').addEventListener('input', formatarValidade);
}

// Atualizar interface
function atualizarInterface() {
    pedidoNumero.textContent = pedidoId;
    pedidoTotal.textContent = valorTotal.toFixed(2).replace('.', ',');
}

// Inicializar PIX
async function inicializarPix() {
    try {
        const qrCodeData = {
            pedidoId: pedidoId,
            valor: valorTotal,
            chavePix: "+5544997350434",
            nomeBeneficiario: "Gabriela Arruda Murback",
            cidade: "Mambore",
            txId: `PED${pedidoId}${Date.now()}`
        };

        // Função para criar campos EMV
        function emv(id, value) {
            const size = String(value.length).padStart(2, '0');
            return `${id}${size}${value}`;
        }

        // Montagem do payload PIX no formato EMV
        const merchantAccount = emv("00", "BR.GOV.BCB.PIX") + emv("01", qrCodeData.chavePix);
        
        const payload =
            emv("00", "01") +                           // Payload Format Indicator
            emv("26", merchantAccount) +                // Merchant Account Information
            emv("52", "0000") +                         // Merchant Category Code
            emv("53", "986") +                          // Transaction Currency (986 = BRL)
            emv("54", qrCodeData.valor.toFixed(2)) +    // Transaction Amount
            emv("58", "BR") +                           // Country Code
            emv("59", qrCodeData.nomeBeneficiario) +    // Merchant Name
            emv("60", qrCodeData.cidade) +              // Merchant City
            emv("62", emv("05", qrCodeData.txId)) +     // Additional Data Field
            "6304";                                      // CRC placeholder

        // Calcular CRC16-CCITT
        function crc16(str) {
            let crc = 0xFFFF;
            for (let i = 0; i < str.length; i++) {
                crc ^= str.charCodeAt(i) << 8;
                for (let j = 0; j < 8; j++) {
                    crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : (crc << 1);
                }
                crc &= 0xFFFF;
            }
            return crc.toString(16).toUpperCase().padStart(4, "0");
        }

        const crc = crc16(payload);
        const codigoPixText = payload + crc;

        // Exibir código PIX
        codigoPix.value = codigoPixText;

        // Gerar QR Code
        if (typeof QRCode !== "undefined") {
            qrcodeContainer.innerHTML = "";
            new QRCode(qrcodeContainer, {
                text: codigoPixText,
                width: 220,
                height: 220,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        }

    } catch (error) {
        console.error("Erro ao inicializar PIX:", error);
        mostrarMensagem("Erro ao configurar pagamento PIX. Tente novamente.", "error");
    }
}

// Copiar código PIX
function copiarCodigoPix() {
    codigoPix.select();
    document.execCommand('copy');
    mostrarMensagem('Código PIX copiado para a área de transferência!', 'success');
}

// Confirmar pagamento PIX
async function confirmarPagamentoPix() {
    try {
        mostrarMensagem('Processando pagamento PIX...', 'info');
        
        setTimeout(async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/pedidos/${pedidoId}/status`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'pago' })
                });
                
                if (!response.ok) throw new Error('Erro ao atualizar status do pedido');
                
                mostrarMensagem('Pagamento confirmado com sucesso!', 'success');
                
                modalNumeroPedido.textContent = pedidoId;
                modalValorPedido.textContent = `R$ ${valorTotal.toFixed(2).replace('.', ',')}`;
                modal.style.display = 'flex';
                
            } catch (error) {
                console.error('Erro ao confirmar pagamento:', error);
                mostrarMensagem('Erro ao confirmar pagamento. Tente novamente.', 'error');
            }
        }, 2000);
        
    } catch (error) {
        console.error('Erro ao processar pagamento PIX:', error);
        mostrarMensagem('Erro ao processar pagamento PIX. Tente novamente.', 'error');
    }
}

// Processar pagamento com cartão
async function processarPagamentoCartao(e) {
    e.preventDefault();
    
    if (!validarCartao()) {
        return;
    }
    
    try {
        mostrarMensagem('Processando pagamento com cartão...', 'info');
        
        setTimeout(async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/pedidos/${pedidoId}/status`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'pago' })
                });
                
                if (!response.ok) throw new Error('Erro ao atualizar status do pedido');
                
                mostrarMensagem('Pagamento aprovado com sucesso!', 'success');
                
                modalNumeroPedido.textContent = pedidoId;
                modalValorPedido.textContent = `R$ ${valorTotal.toFixed(2).replace('.', ',')}`;
                modal.style.display = 'flex';
                
            } catch (error) {
                console.error('Erro ao processar pagamento:', error);
                mostrarMensagem('Erro ao processar pagamento. Verifique os dados e tente novamente.', 'error');
            }
        }, 2000);
        
    } catch (error) {
        console.error('Erro ao processar cartão:', error);
        mostrarMensagem('Erro ao processar cartão. Tente novamente.', 'error');
    }
}

// Validar cartão de crédito
function validarCartao() {
    const numero = document.getElementById('numeroCartao').value.replace(/\D/g, '');
    const nome = document.getElementById('nomeTitular').value.trim();
    const validade = document.getElementById('validade').value;
    const cvv = document.getElementById('cvv').value;
    
    if (!validarNumeroCartao(numero)) {
        mostrarMensagem('Número de cartão inválido.', 'error');
        return false;
    }
    
    if (nome.length < 3) {
        mostrarMensagem('Nome do titular inválido.', 'error');
        return false;
    }
    
    if (!/^\d{2}\/\d{2}$/.test(validade)) {
        mostrarMensagem('Data de validade inválida. Use o formato MM/AA.', 'error');
        return false;
    }
    
    if (!/^\d{3,4}$/.test(cvv)) {
        mostrarMensagem('CVV inválido. Deve conter 3 ou 4 dígitos.', 'error');
        return false;
    }
    
    return true;
}

// Validar número do cartão usando o algoritmo de Luhn
function validarNumeroCartao(numero) {
    numero = numero.replace(/\D/g, '');
    
    if (!/^\d{13,19}$/.test(numero)) {
        return false;
    }
    
    let soma = 0;
    let deveDobrar = false;
    
    for (let i = numero.length - 1; i >= 0; i--) {
        let digito = parseInt(numero.charAt(i));
        
        if (deveDobrar) {
            digito *= 2;
            if (digito > 9) {
                digito = (digito % 10) + 1;
            }
        }
        
        soma += digito;
        deveDobrar = !deveDobrar;
    }
    
    return (soma % 10) === 0;
}

// Formatar número do cartão
function formatarNumeroCartao(e) {
    let value = e.target.value.replace(/\D/g, '');
    value = value.substring(0, 16);
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    e.target.value = value;
}

// Formatar data de validade
function formatarValidade(e) {
    let value = e.target.value.replace(/\D/g, '');
    value = value.substring(0, 4);
    
    if (value.length > 2) {
        value = value.substring(0, 2) + '/' + value.substring(2);
    }
    
    e.target.value = value;
}

// Mostrar mensagem
function mostrarMensagem(mensagem, tipo = 'info') {
    messageContainer.innerHTML = `
        <div class="message ${tipo}">
            ${mensagem}
        </div>
    `;
    
    if (tipo !== 'info') {
        setTimeout(() => {
            messageContainer.innerHTML = '';
        }, 5000);
    }
}