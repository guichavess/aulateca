import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  console.log('Iniciando o Puppeteer para gerar o PDF...');
  
  // Launch the browser
  const browser = await puppeteer.launch({
    headless: "new"
  });
  
  const page = await browser.newPage();
  
  // Set the viewport (though @page CSS rules govern the PDF output)
  await page.setViewport({ width: 1200, height: 1600 });
  
  // Go to the template preview page
  // Assuming the dev server is running on 3002 as detected
  const url = 'http://127.0.0.1:3002/template-preview';
  console.log(`Acessando a página: ${url}`);
  
  try {
    await page.goto(url, { waitUntil: 'networkidle0' });
    
    // Give it a tiny bit extra time just to ensure images (which are local) load completely
    await new Promise(r => setTimeout(r, 1000));
    
    // Generate the PDF
    const pdfPath = path.resolve(__dirname, '../atividade.pdf');
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true, // Important for background images/colors
      margin: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      }
    });
    
    console.log(`✅ PDF gerado com sucesso em: ${pdfPath}`);
  } catch (err) {
    console.error('❌ Erro ao gerar o PDF:', err.message);
    console.log('Por favor, certifique-se de que o servidor de dev (npm run dev) está rodando.');
  } finally {
    await browser.close();
  }
})();
