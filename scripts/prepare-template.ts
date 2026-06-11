import * as fs from 'fs';
import * as path from 'path';
import PizZip from 'pizzip';

const TEMPLATE_PATH = path.resolve(__dirname, '../templates/perficient-resume.docx');

function buildTemplatedBody(): string {
  return `<w:body>
<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>{firstName} {lastName}</w:t></w:r></w:p>
<w:p><w:pPr><w:pStyle w:val="BodyText"/><w:jc w:val="right"/><w:rPr><w:rFonts w:ascii="Aptos" w:hAnsi="Aptos"/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Aptos" w:hAnsi="Aptos"/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr><w:t>{title}</w:t></w:r></w:p>
<w:p/>
<w:p><w:pPr><w:pStyle w:val="05Header3"/><w:rPr><w:color w:val="auto"/></w:rPr></w:pPr><w:r><w:rPr><w:color w:val="auto"/></w:rPr><w:t>PROFESSIONAL OVERVIEW</w:t></w:r></w:p>
<w:p><w:pPr><w:pStyle w:val="09BodyCopy"/></w:pPr><w:r><w:t>{professionalOverview}</w:t></w:r></w:p>
<w:p/>
<w:tbl><w:tblPr><w:tblW w:w="10260" w:type="dxa"/><w:tblInd w:w="108" w:type="dxa"/><w:tblBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="F2F2F2"/><w:left w:val="single" w:sz="4" w:space="0" w:color="F2F2F2"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="F2F2F2"/><w:right w:val="single" w:sz="4" w:space="0" w:color="F2F2F2"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="F2F2F2"/><w:insideV w:val="single" w:sz="4" w:space="0" w:color="F2F2F2"/></w:tblBorders><w:tblLook w:val="01E0" w:firstRow="1" w:lastRow="1" w:firstColumn="1" w:lastColumn="1" w:noHBand="0" w:noVBand="0"/></w:tblPr><w:tblGrid><w:gridCol w:w="1777"/><w:gridCol w:w="8483"/></w:tblGrid>
<w:tr><w:trPr><w:cantSplit/><w:trHeight w:val="259"/></w:trPr><w:tc><w:tcPr><w:tcW w:w="1777" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr><w:p><w:pPr><w:pStyle w:val="09BodyCopy"/></w:pPr><w:r><w:rPr><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr><w:t>Roles</w:t></w:r></w:p></w:tc><w:tc><w:tcPr><w:tcW w:w="8483" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr><w:p><w:r><w:t>{#roles}</w:t></w:r></w:p><w:p><w:pPr><w:pStyle w:val="ListParagraph"/></w:pPr><w:r><w:t>{.}</w:t></w:r></w:p><w:p><w:r><w:t>{/roles}</w:t></w:r></w:p></w:tc></w:tr>
<w:tr><w:trPr><w:trHeight w:val="259"/></w:trPr><w:tc><w:tcPr><w:tcW w:w="1777" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr><w:p><w:pPr><w:pStyle w:val="09BodyCopy"/></w:pPr><w:r><w:rPr><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr><w:t>Solutions</w:t></w:r></w:p></w:tc><w:tc><w:tcPr><w:tcW w:w="8483" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr><w:p><w:r><w:t>{#solutions}</w:t></w:r></w:p><w:p><w:pPr><w:pStyle w:val="ListParagraph"/></w:pPr><w:r><w:t>{.}</w:t></w:r></w:p><w:p><w:r><w:t>{/solutions}</w:t></w:r></w:p></w:tc></w:tr>
<w:tr><w:trPr><w:trHeight w:val="259"/></w:trPr><w:tc><w:tcPr><w:tcW w:w="1777" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr><w:p><w:pPr><w:pStyle w:val="09BodyCopy"/></w:pPr><w:r><w:rPr><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr><w:t>Industries</w:t></w:r></w:p></w:tc><w:tc><w:tcPr><w:tcW w:w="8483" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr><w:p><w:r><w:t>{#industries}</w:t></w:r></w:p><w:p><w:pPr><w:pStyle w:val="ListParagraph"/></w:pPr><w:r><w:t>{.}</w:t></w:r></w:p><w:p><w:r><w:t>{/industries}</w:t></w:r></w:p></w:tc></w:tr>
<w:tr><w:trPr><w:trHeight w:val="259"/></w:trPr><w:tc><w:tcPr><w:tcW w:w="1777" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr><w:p><w:pPr><w:pStyle w:val="09BodyCopy"/></w:pPr><w:r><w:rPr><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr><w:t>Technologies</w:t></w:r></w:p></w:tc><w:tc><w:tcPr><w:tcW w:w="8483" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr><w:p><w:r><w:t>{#technologies}</w:t></w:r></w:p><w:p><w:pPr><w:pStyle w:val="ListParagraph"/></w:pPr><w:r><w:t>{.}</w:t></w:r></w:p><w:p><w:r><w:t>{/technologies}</w:t></w:r></w:p></w:tc></w:tr>
</w:tbl>
<w:p/>
<w:p><w:pPr><w:pStyle w:val="08Heading6"/></w:pPr><w:r><w:t>KEY ENGAGEMENTS</w:t></w:r></w:p>
<w:tbl><w:tblPr><w:tblW w:w="10260" w:type="dxa"/><w:tblInd w:w="108" w:type="dxa"/><w:tblBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="F2F2F2"/><w:left w:val="single" w:sz="4" w:space="0" w:color="F2F2F2"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="F2F2F2"/><w:right w:val="single" w:sz="4" w:space="0" w:color="F2F2F2"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="F2F2F2"/><w:insideV w:val="single" w:sz="4" w:space="0" w:color="F2F2F2"/></w:tblBorders><w:tblLook w:val="0000" w:firstRow="0" w:lastRow="0" w:firstColumn="0" w:lastColumn="0" w:noHBand="0" w:noVBand="0"/></w:tblPr><w:tblGrid><w:gridCol w:w="2587"/><w:gridCol w:w="1800"/><w:gridCol w:w="5873"/></w:tblGrid>
<w:tr><w:tc><w:tcPr><w:tcW w:w="2587" w:type="dxa"/></w:tcPr><w:p><w:pPr><w:pStyle w:val="09BodyCopy"/></w:pPr><w:r><w:t>{#keyEngagements}{company}</w:t></w:r></w:p></w:tc><w:tc><w:tcPr><w:tcW w:w="1800" w:type="dxa"/></w:tcPr><w:p><w:pPr><w:pStyle w:val="09BodyCopy"/></w:pPr><w:r><w:t>{role}</w:t></w:r></w:p></w:tc><w:tc><w:tcPr><w:tcW w:w="5873" w:type="dxa"/></w:tcPr><w:p><w:pPr><w:pStyle w:val="09BodyCopy"/></w:pPr><w:r><w:t>{description}{/keyEngagements}</w:t></w:r></w:p></w:tc></w:tr>
</w:tbl>
<w:p/>
<w:tbl><w:tblPr><w:tblW w:w="10267" w:type="dxa"/><w:tblInd w:w="90" w:type="dxa"/><w:tblCellMar><w:left w:w="115" w:type="dxa"/><w:right w:w="115" w:type="dxa"/></w:tblCellMar><w:tblLook w:val="0000" w:firstRow="0" w:lastRow="0" w:firstColumn="0" w:lastColumn="0" w:noHBand="0" w:noVBand="0"/></w:tblPr><w:tblGrid><w:gridCol w:w="5227"/><w:gridCol w:w="5040"/></w:tblGrid>
<w:tr><w:trPr><w:trHeight w:val="336"/></w:trPr><w:tc><w:tcPr><w:tcW w:w="5227" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr><w:p><w:pPr><w:pStyle w:val="09BodyCopy"/><w:rPr><w:b/><w:bCs/></w:rPr></w:pPr><w:r><w:rPr><w:b/><w:bCs/></w:rPr><w:t>Education</w:t></w:r></w:p><w:p><w:r><w:t>{#education}</w:t></w:r></w:p><w:p><w:pPr><w:rPr><w:rFonts w:ascii="Aptos" w:hAnsi="Aptos"/><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Aptos" w:hAnsi="Aptos"/><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr><w:t>{degree}, {institution} {year}</w:t></w:r></w:p><w:p><w:r><w:t>{/education}</w:t></w:r></w:p></w:tc><w:tc><w:tcPr><w:tcW w:w="5040" w:type="dxa"/></w:tcPr><w:p><w:pPr><w:pStyle w:val="09BodyCopy"/><w:rPr><w:b/><w:bCs/></w:rPr></w:pPr><w:r><w:rPr><w:b/><w:bCs/></w:rPr><w:t>Professional Training/Certifications</w:t></w:r></w:p><w:p><w:r><w:t>{#certifications}</w:t></w:r></w:p><w:p><w:pPr><w:rPr><w:rFonts w:ascii="Aptos" w:hAnsi="Aptos"/><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Aptos" w:hAnsi="Aptos"/><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr><w:t>{.}</w:t></w:r></w:p><w:p><w:r><w:t>{/certifications}</w:t></w:r></w:p></w:tc></w:tr>
</w:tbl>
<w:p/>
<w:p><w:pPr><w:pStyle w:val="08Heading6"/></w:pPr><w:r><w:t>PROFESSIONAL AND BUSINESS EXPERIENCE</w:t></w:r></w:p>
<w:p><w:pPr><w:pStyle w:val="07Heading5"/></w:pPr><w:r><w:t>PERFICIENT, INC.</w:t></w:r></w:p>
<w:p/>
<w:p><w:r><w:t>{#experience}</w:t></w:r></w:p>
<w:p><w:pPr><w:pStyle w:val="Title"/></w:pPr><w:r><w:t>{role}</w:t></w:r></w:p>
<w:p><w:pPr><w:rPr><w:rFonts w:ascii="Aptos" w:hAnsi="Aptos"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Aptos" w:hAnsi="Aptos"/><w:b/><w:bCs/></w:rPr><w:t xml:space="preserve">CLIENT: </w:t></w:r><w:r><w:rPr><w:rFonts w:ascii="Aptos" w:hAnsi="Aptos"/></w:rPr><w:t>{client}</w:t></w:r></w:p>
<w:p><w:pPr><w:rPr><w:rFonts w:ascii="Aptos" w:hAnsi="Aptos"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Aptos" w:hAnsi="Aptos"/><w:b/><w:bCs/></w:rPr><w:t xml:space="preserve">PERIOD: </w:t></w:r><w:r><w:rPr><w:rFonts w:ascii="Aptos" w:hAnsi="Aptos"/></w:rPr><w:t>{period}</w:t></w:r></w:p>
<w:p><w:pPr><w:pStyle w:val="09BodyCopy"/></w:pPr><w:r><w:t>{projectDescription}</w:t></w:r></w:p>
<w:p/>
<w:p><w:pPr><w:rPr><w:rFonts w:ascii="Aptos" w:hAnsi="Aptos"/><w:b/><w:bCs/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Aptos" w:hAnsi="Aptos"/><w:b/><w:bCs/></w:rPr><w:t>Responsibilities:</w:t></w:r></w:p>
<w:p><w:r><w:t>{#responsibilities}</w:t></w:r></w:p>
<w:p><w:pPr><w:pStyle w:val="ListParagraph"/></w:pPr><w:r><w:t>{.}</w:t></w:r></w:p>
<w:p><w:r><w:t>{/responsibilities}</w:t></w:r></w:p>
<w:p/>
<w:p><w:pPr><w:rPr><w:rFonts w:ascii="Aptos" w:hAnsi="Aptos"/><w:b/><w:bCs/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Aptos" w:hAnsi="Aptos"/><w:b/><w:bCs/></w:rPr><w:t>Business/Technology Value</w:t></w:r></w:p>
<w:p><w:r><w:t>{#businessValue}</w:t></w:r></w:p>
<w:p><w:pPr><w:pStyle w:val="ListParagraph"/></w:pPr><w:r><w:t>{.}</w:t></w:r></w:p>
<w:p><w:r><w:t>{/businessValue}</w:t></w:r></w:p>
<w:p/>
<w:p><w:r><w:t>{/experience}</w:t></w:r></w:p>
<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1080" w:bottom="1440" w:left="1080" w:header="720" w:footer="720" w:gutter="0"/></w:sectPr>
</w:body>`;
}

function main() {
  console.log('Reading template from:', TEMPLATE_PATH);

  const content = fs.readFileSync(TEMPLATE_PATH);
  const zip = new PizZip(content);

  const originalXml = zip.file('word/document.xml')!.asText();
  const documentTagMatch = originalXml.match(/<w:document[^>]*>/);

  if (!documentTagMatch) {
    throw new Error('Could not find <w:document> opening tag in template');
  }

  const newXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n${documentTagMatch[0]}${buildTemplatedBody()}</w:document>`;

  zip.file('word/document.xml', newXml);

  const output = zip.generate({ type: 'nodebuffer' });
  fs.writeFileSync(TEMPLATE_PATH, output);

  console.log('Template prepared successfully at:', TEMPLATE_PATH);
}

main();
