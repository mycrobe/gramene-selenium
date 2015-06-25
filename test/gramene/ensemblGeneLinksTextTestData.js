module.exports = [{
  title: 'Splice variants',
  expectedTitleSubstring: 'Splice variants',
  expectedText: 'Configuring the display',
  asyncPanelSelector: '#SpliceImage'
}, {
  title: 'Supporting evidence',
  expectedTitleSubstring: 'Supporting evidence',
  expectedText: 'align',
  asyncPanelSelector: '#SupportingEvidence'
}, {
  title: 'Summary',
  expectedTitleSubstring: 'Summary',
  expectedText: 'This gene has proteins that correspond to the following UniProtKB identifiers',
  asyncPanelSelector: '#GeneSummary'
}, {
  title: 'External references',
  expectedTitleSubstring: 'External references',
  expectedText: 'The following database identifiers correspond to the transcripts of this gene',
  asyncPanelSelector: '#SimilarityMatches'
}, {
  title: 'Sequence',
  expectedTitleSubstring: 'Marked-up sequence',
  expectedText: 'All exons in this region',
  asyncPanelSelector: '#GeneSeq' // TODO: do BLAST
}, {
  title: 'GO: biological process',
  expectedTitleSubstring: 'GO: biological process',
  expectedText: 'The following terms describe the biological_process of this entry',
  asyncPanelSelector: '#Ontology'
}, {
  title: 'GO: molecular function',
  expectedTitleSubstring: 'GO: molecular function',
  expectedText: 'The following terms describe the molecular_function of this entry',
  asyncPanelSelector: '#Ontology'
}, {
  title: 'GO: cellular component',
  expectedTitleSubstring: 'GO: cellular component',
  expectedText: 'The following terms describe the cellular_component of this entry',
  asyncPanelSelector: '#Ontology'
}, {
  title: 'Plant Compara',
  expectedTitleSubstring: 'Plant Compara',
  expectedText: 'Transcription factor TEOSINTE BRANCHED 1',
  asyncPanelSelector: '.content' // TODO follow links here,
}, {
  title: 'Genomic alignments',
  expectedTitleSubstring: 'Genomic alignments',
  expectedText: 'CACACACTGCTCTTAGTGCCAGGACCT',
  asyncPanelSelector: 'pre' // TODO test ana lignment
}, {
  title: 'Gene tree',
  expectedTitleSubstring: 'Gene tree',
  expectedText: 'Number of speciation nodes',
  asyncPanelSelector: '#ComparaTreeSummary'
}, {
  title: 'Orthologues',
  expectedTitleSubstring: 'Orthologues',
  expectedText: 'Ensembl identifier & gene name',
  asyncPanelSelector: '#ComparaOrthologs'
}, {
  title: 'Pan-taxonomic Compara',
  expectedTitleSubstring: 'Pan-taxonomic Compara',
  expectedText: 'Show transcript table',
  asyncPanelSelector: '.content' // TODO follow links here
}, {
  title: 'Phenotype',
  expectedTitleSubstring: 'Phenotype',
  expectedText: 'phenotypes directly associated',
  asyncPanelSelector: '#GenePhenotype'
}, {
  title: 'Variation image',
  expectedTitleSubstring: 'Variation image',
  expectedText: 'Please note the default \'Context\' settings will probably filter out some intronic SNPs',
  asyncPanelSelector: '#VariationImage'
}, {
  title: 'External data',
  expectedTitleSubstring: 'External data',
  expectedText: 'o change the sources of external annotations that are available in the External Data menu',
  asyncPanelSelector: '#ExternalData' // TODO configure some
}, {
  title: 'Paralogues',
  expectedTitleSubstring: 'Paralogues',
  expectedText: 'Ensembl identifier & gene name',
  asyncPanelSelector: '#ComparaParalogs'
}, {
  title: 'Variation table',
  expectedTitleSubstring: 'Variation table',
  expectedText: 'Summary of variation consequences in',
  asyncPanelSelector: '#VariationTable'
//}, {
//  title: 'Gene history',
//  expectedTitleSubstring: 'ID History',
//  expectedText: 'There is no history for AC233950.1_FG002.2 stored in the database.',
//  asyncPanelSelector: '#GeneHistory'
}];
