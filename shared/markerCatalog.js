// Existing display thresholds, shared by the UI and API. Not a diagnostic model.
export const RULES_VERSION = 'juicers-markers-v1';
export const MARKERS = [
  { category: 'Cardiovascular', key: 'hdl', aliases: ['colesterolHdl', 'colesterol_hdl', 'hdlColesterol'], id: 'hdl', name: 'HDL', unit: 'mg/dL', ref: '> 40', reverse: true, attention: 40, risk: 30 },
  { category: 'Cardiovascular', key: 'ldl', aliases: ['colesterolLdl', 'colesterol_ldl', 'ldlColesterol'], id: 'ldl', name: 'LDL', unit: 'mg/dL', ref: '< 100', attention: 130, risk: 190 },
  { category: 'Cardiovascular', key: 'nonHdl', aliases: ['naoHdl', 'nãoHdl', 'colesterolNaoHdl', 'colesterolNãoHdl'], id: 'nonHdl', name: 'Colesterol não-HDL', unit: 'mg/dL', ref: '< 130', attention: 130, risk: 160 },
  { category: 'Cardiovascular', key: 'vldl', aliases: ['colesterolVldl'], id: 'vldl', name: 'VLDL', unit: 'mg/dL', ref: '< 30', attention: 30, risk: 40 },
  { category: 'Cardiovascular', key: 'triglycerides', aliases: ['triglicerideos', 'triglicerídeos'], id: 'triglycerides', name: 'Triglicerídeos', unit: 'mg/dL', ref: '< 150', attention: 150, risk: 200 },

  { category: 'Endócrino', key: 'glucose', aliases: ['glicose', 'glicemia', 'glicemiaJejum'], id: 'glucose', name: 'Glicose', unit: 'mg/dL', ref: '70–99', attention: 100, risk: 126 },
  { category: 'Endócrino', key: 'hba1c', aliases: ['hemoglobinaGlicada', 'hbA1c', 'a1c'], id: 'hba1c', name: 'Hemoglobina Glicada', unit: '%', ref: '4.1–6.0', attention: 5.7, risk: 6.5 },

  { category: 'Renal', key: 'creatinine', aliases: ['creatinina'], id: 'creatinine', name: 'Creatinina', unit: 'mg/dL', ref: '0.6–1.3', attention: 1.3, risk: 1.6 },

  { category: 'Hematológico', key: 'hemoglobin', aliases: ['hemoglobina'], id: 'hemoglobin', name: 'Hemoglobina', unit: 'g/dL', ref: '12.8–17.8', attention: 17.8, risk: 18.5 },
  { category: 'Hematológico', key: 'hematocrit', aliases: ['hematocrito', 'hematócrito'], id: 'hematocrit', name: 'Hematócrito', unit: '%', ref: '37–52.4', attention: 52.4, risk: 55 },
  { category: 'Hematológico', key: 'erythrocytes', aliases: ['eritrocitos', 'eritrócitos', 'hemacias', 'hemácias'], id: 'erythrocytes', name: 'Eritrócitos', unit: 'milhões/mm³', ref: '4.10–6.11', attention: 6.11, risk: 6.5 },
  { category: 'Hematológico', key: 'leukocytes', aliases: ['leucocitos', 'leucócitos'], id: 'leukocytes', name: 'Leucócitos', unit: 'mil/mm³', ref: '4.12–11.11', attention: 11.11, risk: 13 },
  { category: 'Hematológico', key: 'platelets', aliases: ['plaquetas'], id: 'platelets', name: 'Plaquetas', unit: 'mil/mm³', ref: '162–425', attention: 425, risk: 500 },

  { category: 'Micronutrientes', key: 'vitaminD', aliases: ['vitaminaD', '25ohVitaminaD', 'vitamina_d'], id: 'vitaminD', name: 'Vitamina D', unit: 'ng/mL', ref: '20–60', reverse: true, attention: 20, risk: 10 },
  { category: 'Micronutrientes', key: 'vitaminB12', aliases: ['vitaminaB12', 'b12', 'vitamina_b12'], id: 'vitaminB12', name: 'Vitamina B12', unit: 'pg/mL', ref: '187–883', reverse: true, attention: 187, risk: 130 },
  { category: 'Micronutrientes', key: 'ferritin', aliases: ['ferritina'], id: 'ferritin', name: 'Ferritina', unit: 'ng/mL', ref: '21.81–274.66', attention: 275, risk: 400 },
  { category: 'Micronutrientes', key: 'iron', aliases: ['ferro'], id: 'iron', name: 'Ferro', unit: 'µg/dL', ref: '65–175', attention: 175, risk: 220 },
]

