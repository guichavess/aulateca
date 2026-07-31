html_content = """<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Template AulaTeca</title>
<style>
    :root {
        --roxo: #6366F1;
        --amarelo: #FFB830;
        --lavanda: #C7D2FE;
        --bg-page: #ffffff;
        --text-dark: #333333;
    }
    *, *::before, *::after { box-sizing: border-box; }
    
    body {
        margin: 0;
        padding: 0;
        font-family: 'Comic Sans MS', 'Arial', sans-serif;
        background-color: #e2e8f0;
    }
    
    @page {
        size: A4;
        margin: 15mm 15mm;
    }
    
    .page {
        width: 210mm;
        min-height: 297mm;
        padding: 15mm 15mm 25mm 15mm; /* Extra bottom padding for footer */
        margin: 10mm auto;
        background: var(--bg-page);
        border-radius: 5px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.15);
        position: relative;
    }
    
    @media print {
        body { background: white; }
        .page { 
            margin: 0; 
            border-radius: 0; 
            box-shadow: none; 
            width: 100%; 
            min-height: 100%; 
            page-break-after: always; 
        }
    }

    /* Header */
    .header {
        display: table;
        width: 100%;
        border-bottom: 3px solid var(--roxo);
        padding-bottom: 10px;
        margin-bottom: 20px;
    }
    .header-title { 
        display: table-cell; 
        font-size: 20pt; 
        font-weight: bold; 
        color: var(--roxo); 
        vertical-align: bottom; 
    }
    .header-grade { 
        display: table-cell; 
        text-align: right; 
        font-size: 16pt; 
        font-weight: bold; 
        color: var(--amarelo); 
        vertical-align: bottom; 
    }

    /* Footer */
    .footer {
        position: absolute;
        bottom: 15mm;
        left: 15mm;
        right: 15mm;
        border-top: 2px dashed var(--lavanda);
        padding-top: 10px;
        display: table;
        width: calc(100% - 30mm);
    }
    .footer-logo { 
        display: table-cell; 
        vertical-align: middle; 
        font-size: 12pt; 
        color: var(--roxo); 
        font-weight: bold; 
    }
    .footer-logo svg { 
        vertical-align: middle; 
        margin-right: 5px; 
    }
    .footer-page { 
        display: table-cell; 
        text-align: right; 
        vertical-align: middle; 
        font-size: 12pt; 
        color: var(--roxo); 
        font-weight: bold; 
    }

    /* Capa */
    .capa-scene {
        background: linear-gradient(135deg, var(--lavanda) 0%, #e0e7ff 100%);
        border: 4px solid var(--roxo);
        border-radius: 20px;
        height: 220mm;
        position: relative;
        padding: 30px;
        text-align: center;
    }
    .capa-title {
        font-size: 32pt;
        color: var(--roxo);
        background: rgba(255,255,255,0.95);
        padding: 20px 40px;
        border-radius: 15px;
        display: inline-block;
        margin-top: 30px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        border: 2px solid var(--amarelo);
    }
    .mascot-capa {
        position: absolute;
        bottom: 20px;
        right: 20px;
        width: 180px;
    }

    /* Guia do Professor */
    .guia-box {
        background: var(--lavanda);
        border-left: 6px solid var(--roxo);
        padding: 15px 20px;
        margin-bottom: 20px;
        border-radius: 0 10px 10px 0;
        page-break-inside: avoid;
    }
    .guia-box h3 { 
        margin-top: 0; 
        color: var(--roxo); 
        font-size: 16pt; 
        margin-bottom: 10px;
    }
    .guia-box p { 
        margin: 5px 0; 
        font-size: 12pt; 
        color: var(--text-dark); 
        line-height: 1.4;
    }

    /* Caixas de Exercicio */
    .caixa-exercicio {
        background: white;
        border: 2px solid var(--lavanda);
        border-radius: 15px;
        padding: 20px;
        margin-bottom: 25px;
        box-shadow: 0 4px 8px rgba(99, 102, 241, 0.15);
        page-break-inside: avoid;
    }
    .enunciado { 
        font-size: 14pt; 
        font-weight: bold; 
        color: var(--roxo); 
        margin-bottom: 15px; 
    }
    .linha-escrita {
        border-bottom: 1px solid #999;
        height: 35px;
        margin-top: 15px;
    }

    /* Autoavaliação */
    .avaliacao-item {
        display: table;
        width: 100%;
        background: #fdfdfd;
        border: 2px solid var(--lavanda);
        border-radius: 10px;
        padding: 15px;
        margin-bottom: 15px;
        page-break-inside: avoid;
    }
    .aval-text { 
        display: table-cell; 
        width: 60%; 
        font-size: 14pt; 
        vertical-align: middle; 
        color: var(--text-dark); 
        font-weight: bold;
    }
    .aval-emojis { 
        display: table-cell; 
        width: 40%; 
        text-align: right; 
        vertical-align: middle; 
    }
    .emoji { 
        font-size: 26pt; 
        margin-left: 10px; 
        display: inline-block;
        border: 2px solid transparent;
        border-radius: 50%;
        padding: 5px;
    }
    
    .desenho-box {
        border: 3px dashed var(--amarelo);
        border-radius: 15px;
        height: 180px;
        margin-top: 20px;
        text-align: center;
        color: #777;
        padding-top: 75px;
        font-size: 14pt;
        background-color: #fffaf0;
    }

    /* SVG Teca (Polvo) */
    .teca-svg { width: 35px; height: 35px; }
</style>
</head>
<body>

<!-- CAPA -->
<div class="page">
    <div class="capa-scene">
        <div class="capa-title">O Mistério das Palavras</div>
        
        <!-- Mascote Teca em SVG (Alternativa visual as imagens do Nano Banana) -->
        <svg class="mascot-capa" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="40" r="30" fill="#6366F1"/>
            <circle cx="35" cy="35" r="6" fill="#FFF"/>
            <circle cx="65" cy="35" r="6" fill="#FFF"/>
            <circle cx="35" cy="35" r="2.5" fill="#333"/>
            <circle cx="65" cy="35" r="2.5" fill="#333"/>
            <path d="M 40 50 Q 50 60 60 50" stroke="#FFF" stroke-width="3" fill="none" stroke-linecap="round"/>
            <path d="M 25 55 Q 10 70 20 90" stroke="#6366F1" stroke-width="12" fill="none" stroke-linecap="round"/>
            <path d="M 40 65 Q 35 80 40 95" stroke="#6366F1" stroke-width="12" fill="none" stroke-linecap="round"/>
            <path d="M 60 65 Q 65 80 60 95" stroke="#6366F1" stroke-width="12" fill="none" stroke-linecap="round"/>
            <path d="M 75 55 Q 90 70 80 90" stroke="#6366F1" stroke-width="12" fill="none" stroke-linecap="round"/>
            <circle cx="20" cy="80" r="3" fill="#FFB830"/>
            <circle cx="40" cy="85" r="3" fill="#FFB830"/>
            <circle cx="60" cy="85" r="3" fill="#FFB830"/>
            <circle cx="80" cy="80" r="3" fill="#FFB830"/>
            <!-- Lupa (Lote 1 pose detetive simulada) -->
            <circle cx="80" cy="40" r="12" stroke="#FFB830" stroke-width="3" fill="rgba(255,255,255,0.5)"/>
            <line x1="88" y1="48" x2="98" y2="58" stroke="#333" stroke-width="4" stroke-linecap="round"/>
        </svg>
    </div>
    <div class="footer">
        <div class="footer-logo">
            <svg class="teca-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="40" fill="#6366F1"/>
                <circle cx="35" cy="40" r="8" fill="#FFF"/>
                <circle cx="65" cy="40" r="8" fill="#FFF"/>
                <circle cx="35" cy="40" r="4" fill="#333"/>
                <circle cx="65" cy="40" r="4" fill="#333"/>
                <path d="M 40 65 Q 50 75 60 65" stroke="#FFB830" stroke-width="4" fill="none" stroke-linecap="round"/>
            </svg>
            AulaTeca | aulateca.com
        </div>
        <div class="footer-page">1</div>
    </div>
</div>

<!-- GUIA DO PROFESSOR -->
<div class="page">
    <div class="header">
        <div class="header-title">O Mistério das Palavras - Guia do Prof.</div>
        <div class="header-grade">⭐ 3º Ano</div>
    </div>

    <div class="guia-box">
        <h3>🎯 Objetivo</h3>
        <p>Desenvolver a fluência leitora e a compreensão de textos curtos com foco em elementos investigativos e raciocínio lógico.</p>
    </div>

    <div class="guia-box">
        <h3>📚 Habilidades BNCC</h3>
        <p><strong>(EF03LP01)</strong> Ler e escrever palavras com correspondências regulares contextuais entre grafemas e fonemas.</p>
        <p><strong>(EF03LP11)</strong> Ler e compreender, com autonomia, textos injuntivos instrucionais (receitas, manuais de jogos, etc).</p>
    </div>

    <div class="guia-box">
        <h3>⏱️ Tempo e Materiais</h3>
        <p><strong>Tempo estimado:</strong> 50 minutos.</p>
        <p><strong>Materiais:</strong> Lápis, borracha, lápis de cor e tesoura sem ponta.</p>
    </div>

    <div class="guia-box">
        <h3>💡 Mediação e Inclusão</h3>
        <p>Para alunos com dificuldades de leitura, utilize a estratégia de leitura compartilhada em duplas. Forneça a versão do material com fonte ampliada para alunos com baixa visão.</p>
    </div>

    <div class="footer">
        <div class="footer-logo">
            <svg class="teca-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="40" fill="#6366F1"/>
                <circle cx="35" cy="40" r="8" fill="#FFF"/>
                <circle cx="65" cy="40" r="8" fill="#FFF"/>
                <circle cx="35" cy="40" r="4" fill="#333"/>
                <circle cx="65" cy="40" r="4" fill="#333"/>
                <path d="M 40 65 Q 50 75 60 65" stroke="#FFB830" stroke-width="4" fill="none" stroke-linecap="round"/>
            </svg>
            AulaTeca | aulateca.com
        </div>
        <div class="footer-page">2</div>
    </div>
</div>

<!-- EXERCÍCIOS -->
<div class="page">
    <div class="header">
        <div class="header-title">O Mistério das Palavras</div>
        <div class="header-grade">⭐ 3º Ano</div>
    </div>

    <div class="caixa-exercicio">
        <div class="enunciado">1. Ajude a Teca a descobrir as palavras escondidas! Complete as letras que faltam:</div>
        <p style="font-size:18pt; font-family: monospace; letter-spacing: 8px; text-align: center; color: var(--text-dark);">M _ S T _ R I O</p>
        <p style="font-size:18pt; font-family: monospace; letter-spacing: 8px; text-align: center; color: var(--text-dark);">D _ T E _ T I V E</p>
        <p style="font-size:18pt; font-family: monospace; letter-spacing: 8px; text-align: center; color: var(--text-dark);">L _ P A</p>
    </div>

    <div class="caixa-exercicio">
        <div class="enunciado">2. Você é o detetive agora! Escreva uma pequena frase usando uma das palavras que você encontrou acima:</div>
        <div class="linha-escrita"></div>
        <div class="linha-escrita"></div>
        <div class="linha-escrita"></div>
    </div>

    <div class="footer">
        <div class="footer-logo">
            <svg class="teca-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="40" fill="#6366F1"/>
                <circle cx="35" cy="40" r="8" fill="#FFF"/>
                <circle cx="65" cy="40" r="8" fill="#FFF"/>
                <circle cx="35" cy="40" r="4" fill="#333"/>
                <circle cx="65" cy="40" r="4" fill="#333"/>
                <path d="M 40 65 Q 50 75 60 65" stroke="#FFB830" stroke-width="4" fill="none" stroke-linecap="round"/>
            </svg>
            AulaTeca | aulateca.com
        </div>
        <div class="footer-page">3</div>
    </div>
</div>

<!-- AUTOAVALIAÇÃO -->
<div class="page">
    <div class="header">
        <div class="header-title">Meu Desempenho</div>
        <div class="header-grade">⭐ 3º Ano</div>
    </div>

    <p style="font-size: 14pt; color: var(--text-dark); margin-bottom: 25px;">Marque a carinha que melhor representa como você se saiu nesta missão:</p>

    <div class="avaliacao-item">
        <div class="aval-text">Consegui ler as palavras sem ajuda.</div>
        <div class="aval-emojis">
            <span class="emoji">😁</span>
            <span class="emoji">🤔</span>
            <span class="emoji">😟</span>
        </div>
    </div>

    <div class="avaliacao-item">
        <div class="aval-text">Entendi o que o exercício pediu para fazer.</div>
        <div class="aval-emojis">
            <span class="emoji">😁</span>
            <span class="emoji">🤔</span>
            <span class="emoji">😟</span>
        </div>
    </div>

    <div class="avaliacao-item">
        <div class="aval-text">Gostei de brincar de detetive com a Teca!</div>
        <div class="aval-emojis">
            <span class="emoji">😁</span>
            <span class="emoji">🤔</span>
            <span class="emoji">😟</span>
        </div>
    </div>

    <div class="desenho-box">
        Faça um desenho de como seria a sua lupa de detetive!
    </div>

    <div class="footer">
        <div class="footer-logo">
            <svg class="teca-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="40" fill="#6366F1"/>
                <circle cx="35" cy="40" r="8" fill="#FFF"/>
                <circle cx="65" cy="40" r="8" fill="#FFF"/>
                <circle cx="35" cy="40" r="4" fill="#333"/>
                <circle cx="65" cy="40" r="4" fill="#333"/>
                <path d="M 40 65 Q 50 75 60 65" stroke="#FFB830" stroke-width="4" fill="none" stroke-linecap="round"/>
            </svg>
            AulaTeca | aulateca.com
        </div>
        <div class="footer-page">4</div>
    </div>
</div>

</body>
</html>
"""

with open('aulateca-template.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

print("HTML file generated successfully.")