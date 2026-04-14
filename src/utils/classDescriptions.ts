import type { SkinLesionClass } from '../types';

export const CLASS_INFO: Record<SkinLesionClass, {
  name: string;
  description: string;
  action: string;
  risk: 'low' | 'moderate' | 'high';
}> = {
  mel: {
    name: 'Melanoma',
    description: 'Melanoma is the most dangerous form of skin cancer. It develops from melanocytes and can spread rapidly if not caught early. Asymmetry, irregular borders, varied color, and diameter >6mm are warning signs.',
    action: 'Seek urgent evaluation by a dermatologist within 1–2 weeks. Do not delay. Early surgical excision greatly improves prognosis.',
    risk: 'high',
  },
  nv: {
    name: 'Melanocytic Nevi (Mole)',
    description: 'Melanocytic nevi are benign growths of pigmented skin cells (melanocytes). Most moles are harmless, but any changes in size, shape, or color should be monitored.',
    action: 'Routine monitoring recommended. If the mole changes rapidly, consult a dermatologist. Annual skin check-ups are advised.',
    risk: 'low',
  },
  bcc: {
    name: 'Basal Cell Carcinoma',
    description: 'BCC is the most common form of skin cancer. It grows slowly and rarely spreads to other organs, but can cause significant local tissue destruction if untreated.',
    action: 'Schedule a dermatology appointment within 4–6 weeks. BCC is highly treatable when caught early, typically through excision or topical therapy.',
    risk: 'high',
  },
  akiec: {
    name: 'Actinic Keratosis / Intraepithelial Carcinoma',
    description: 'AK is a pre-cancerous skin lesion caused by prolonged sun exposure. It can progress to squamous cell carcinoma if untreated. Appears as rough, scaly patches.',
    action: 'Consult a dermatologist within 4–6 weeks for cryotherapy, topical fluorouracil, or photodynamic therapy. Sun protection is critical.',
    risk: 'moderate',
  },
  bkl: {
    name: 'Benign Keratosis',
    description: 'Benign keratoses include seborrheic keratoses and solar lentigines. These are non-cancerous skin growths that commonly appear with age. They may look alarming but are generally harmless.',
    action: 'No immediate treatment required. Monitor for changes. Cosmetic removal is available if desired. Annual skin check recommended.',
    risk: 'low',
  },
  df: {
    name: 'Dermatofibroma',
    description: 'Dermatofibromas are benign fibrous nodules found most often on the legs. They are harmless, firm bumps that typically develop after minor injury. They rarely require treatment.',
    action: 'No treatment necessary. Surgical removal may be considered if painful or cosmetically bothersome. Unlikely to be concerning.',
    risk: 'low',
  },
  vasc: {
    name: 'Vascular Lesion',
    description: 'Vascular lesions include angiomas, hemangiomas, and pyogenic granulomas. These arise from blood vessels in the skin. While usually benign, some types can bleed or grow rapidly.',
    action: 'Consult a dermatologist if growing or bleeding. Many vascular lesions can be treated with laser therapy or simple excision.',
    risk: 'moderate',
  },
};

export const RISK_COLORS: Record<string, string> = {
  low: '#1D9E75',
  moderate: '#EF9F27',
  high: '#E24B4A',
};

export const TOP3_LABELS: Record<string, string> = {
  mel: 'Melanoma',
  nv: 'Nevus (Mole)',
  bcc: 'Basal Cell Carcinoma',
  akiec: 'Actinic Keratosis',
  bkl: 'Benign Keratosis',
  df: 'Dermatofibroma',
  vasc: 'Vascular Lesion',
};
