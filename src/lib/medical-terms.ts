import { getPlaceholderImage, type ImagePlaceholder } from './placeholder-images';

export type MedicalTerm = {
  id: string;
  term: string;
  definition: string;
  image?: ImagePlaceholder;
};

export const medicalTerms: MedicalTerm[] = [
  {
    id: 'influenza',
    term: 'Influenza',
    definition: 'An acute, contagious, viral infection of the respiratory tract, characterized by fever, chills, muscular pain, and prostration. It is caused by various strains of orthomyxoviruses.',
    image: getPlaceholderImage('influenza'),
  },
  {
    id: 'heart-attack',
    term: 'Myocardial Infarction (Heart Attack)',
    definition: 'The irreversible death (necrosis) of heart muscle secondary to prolonged lack of oxygen supply (ischemia). It is most often caused by a blockage of a coronary artery by a blood clot.',
    image: getPlaceholderImage('heart-attack'),
  },
  {
    id: 'diabetes',
    term: 'Diabetes Mellitus',
    definition: "A chronic metabolic disorder in which the body's ability to produce or respond to the hormone insulin is impaired, resulting in abnormal metabolism of carbohydrates and elevated levels of glucose in the blood and urine.",
    image: getPlaceholderImage('diabetes'),
  },
  {
    id: 'asthma',
    term: 'Asthma',
    definition: 'A chronic respiratory disease characterized by inflammation of the airways, which causes them to narrow and swell, leading to wheezing, shortness of breath, chest tightness, and coughing.',
    image: getPlaceholderImage('asthma'),
  },
  {
    id: 'appendicitis',
    term: 'Appendicitis',
    definition: 'Inflammation of the appendix, a small, finger-shaped pouch that projects from your colon on the lower right side of your abdomen. Appendicitis causes pain in your lower right abdomen.',
    image: getPlaceholderImage('appendicitis'),
  },
];
