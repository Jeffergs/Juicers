from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from pypdf import PdfReader
import pypdfium2 as pdfium
from pathlib import Path
import json
out=Path('output/pdf'); temp=Path('tmp/pdfs')
rows=[('Colesterol HDL','mg/dL',54,39),('Colesterol LDL','mg/dL',96,146),('Triglicerideos','mg/dL',105,182),('Hematocrito','%',44,50),('Hemoglobina','g/dL',14.8,16.2),('Creatinina','mg/dL',0.9,1.1),('Glicose','mg/dL',86,98),('Hemoglobina glicada','%',5.1,5.6),('Vitamina D','ng/mL',32,25),('Vitamina B12','pg/mL',480,390)]
for i,(date,name) in enumerate([('01/09/2026','juicers-demo-01-setembro-compativel.pdf'),('01/10/2026','juicers-demo-02-outubro-compativel.pdf')]):
 p=out/name;c=canvas.Canvas(str(p),pagesize=A4,pageCompression=0);w,h=A4
 c.setTitle('Juicers - Exame ficticio de demonstracao')
 c.setFillColor(HexColor('#132b30'));c.rect(0,h-112,w,112,fill=1,stroke=0)
 c.setFont('Helvetica-Bold',23);c.setFillColor(HexColor('#2fd6be'));c.drawString(40,h-48,'JUICERS | DEMONSTRACAO')
 c.setFont('Helvetica-Bold',12);c.setFillColor(HexColor('#ffffff'));c.drawString(40,h-77,'EXAME FICTICIO - SEM VALIDADE CLINICA')
 c.setFillColor(HexColor('#18282d'));c.setFont('Helvetica',11)
 c.drawString(40,h-145,'Paciente: Pessoa de Demonstracao (identidade ficticia)')
 c.drawString(40,h-167,'Data da coleta: '+date)
 c.drawString(40,h-189,'Finalidade: testar importacao e variacao dos graficos da Juicers.')
 y=h-234;c.setFillColor(HexColor('#e4f5f2'));c.rect(40,y-9,w-80,29,fill=1,stroke=0)
 c.setFillColor(HexColor('#18282d'));c.setFont('Helvetica-Bold',11);c.drawString(50,y,'INDICADOR');c.drawString(345,y,'RESULTADO SIMULADO')
 for row in rows:
  y-=34;c.setFont('Helvetica',11);value=str(row[2+i]).replace('.',',')
  c.drawString(50,y,f'{row[0]}: {value} {row[1]}')
  c.setStrokeColor(HexColor('#dde5e5'));c.line(40,y-12,w-40,y-12)
 c.setFont('Helvetica-Bold',10);c.drawString(40,125,'DADOS INTEIRAMENTE SIMULADOS PARA APRESENTACAO')
 c.setFont('Helvetica',9)
 for j,line in enumerate(['Documento cenografico, sem laboratorio ou profissional emissor.', 'Valores escolhidos apenas para produzir variacao visual entre duas datas.', 'Nao representa exame real, diagnostico ou efeito de qualquer tratamento.']):c.drawString(40,106-j*15,line)
 c.save()
 text='\n'.join(page.extract_text() for page in PdfReader(p).pages)
 (temp/(name+'.txt')).write_text(text,encoding='utf-8')
 doc=pdfium.PdfDocument(str(p));page=doc[0];page.render(scale=1.3).to_pil().save(temp/(name+'.png'))
 print(str(p))

