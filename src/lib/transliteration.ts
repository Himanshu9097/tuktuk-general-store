/**
 * Utility for generating Hindi names from English terms
 * Uses common grocery dictionary mappings + intelligent phonetic Devanagari transliteration
 */

const GROCERY_TRANSLATION_DICT: Record<string, string> = {
  'suji': 'सूजी',
  'sooji': 'सूजी',
  'rava': 'रवा',
  'rice': 'चावल',
  'basmati rice': 'बासमती चावल',
  'dal': 'दाल',
  'moong dal': 'मूंग दाल',
  'masoor dal': 'मसूर दाल',
  'toor dal': 'तूर दाल',
  'arhar dal': 'अरहर दाल',
  'chana dal': 'चना दाल',
  'urad dal': 'उड़द दाल',
  'sugar': 'चीनी',
  'cheeni': 'चीनी',
  'sakkar': 'शक्कर',
  'shakkar': 'शक्कर',
  'salt': 'नमक',
  'namak': 'नमक',
  'besan': 'बेसन',
  'atta': 'आटा',
  'wheat atta': 'गेहूं आटा',
  'gehu atta': 'गेहूं आटा',
  'maida': 'मैदा',
  'poha': 'पोहा',
  'chuda': 'चूड़ा',
  'oil': 'तेल',
  'mustard oil': 'सरसों तेल',
  'sarson oil': 'सरसों तेल',
  'refined oil': 'रिफाइंड तेल',
  'ghee': 'घी',
  'desi ghee': 'देसी घी',
  'haldi': 'हल्दी',
  'turmeric': 'हल्दी',
  'mirch': 'मिर्च',
  'chilli': 'मिर्च',
  'red chilli': 'लाल मिर्च',
  'lal mirch': 'लाल मिर्च',
  'dhaniya': 'धनिया',
  'coriander': 'धनिया',
  'jeera': 'जीरा',
  'cumin': 'जीरा',
  'garam masala': 'गरम मसाला',
  'masala': 'मसाला',
  'tea': 'चाय पत्ती',
  'chai': 'चाय पत्ती',
  'coffee': 'कॉफी',
  'jaggery': 'गुड़',
  'gud': 'गुड़',
  'gur': 'गुड़',
  'peanut': 'मूंगफली',
  'moongphali': 'मूंगफली',
  'badam': 'बादाम',
  'almond': 'बादाम',
  'kaju': 'काजू',
  'cashew': 'काजू',
  'kishmish': 'किशमिश',
  'raisins': 'किशमिश',
  'kismis': 'किशमिश',
  'poha/chuda': 'पोहा / चूड़ा',
  'sattu': 'सत्तू',
  'dalia': 'दलिया',
  'hing': 'हींग',
  'asafoetida': 'हींग',
  'methi': 'मेथी',
  'fenugreek': 'मेथी',
  'saunf': 'सौंफ',
  'fennel': 'सौंफ',
  'ajwain': 'अजवायन',
  'sabudana': 'साबूदाना',
  'sago': 'साबूदाना',
  'makhana': 'मखाना',
  'fox nuts': 'मखाना',
  'paneer': 'पनीर',
  'milk': 'दूध',
  'doodh': 'दूध',
  'curd': 'दही',
  'dahi': 'दही',
  'butter': 'मक्खन',
  'makkhan': 'मक्खन',
  'soap': 'साबुन',
  'detergent': 'सर्फ / डिटर्जेंट',
  'surf': 'सर्फ',
  'potato': 'आलू',
  'aloo': 'आलू',
  'onion': 'प्याज',
  'pyaz': 'प्याज',
  'tomato': 'टमाटर',
  'tamatar': 'टमाटर',
  'garlic': 'लहसुन',
  'lahsun': 'लहसुन',
  'ginger': 'अदरक',
  'adrak': 'अदरक',
};

// Hindi character phonetic transliterator for arbitrary English words
const CONSONANTS: Record<string, string> = {
  'bh': 'भ', 'ch': 'च', 'chh': 'छ', 'dh': 'ध', 'gh': 'घ',
  'jh': 'झ', 'kh': 'ख', 'ph': 'फ', 'sh': 'श', 'th': 'थ',
  'b': 'ब', 'c': 'क', 'd': 'द', 'f': 'फ', 'g': 'ग',
  'h': 'ह', 'j': 'ज', 'k': 'क', 'l': 'ल', 'm': 'म',
  'n': 'न', 'p': 'प', 'q': 'क', 'r': 'र', 's': 'स',
  't': 'त', 'v': 'व', 'w': 'व', 'x': 'क्स', 'y': 'य', 'z': 'ज़'
};

const VOWEL_SIGNS: Record<string, string> = {
  'aa': 'ा', 'ee': 'ी', 'oo': 'ू', 'ai': 'ै', 'au': 'ौ',
  'a': '', 'e': 'े', 'i': 'ि', 'o': 'ो', 'u': 'ु'
};

const INITIAL_VOWELS: Record<string, string> = {
  'aa': 'आ', 'ee': 'ई', 'oo': 'ऊ', 'ai': 'ऐ', 'au': 'औ',
  'a': 'अ', 'e': 'ए', 'i': 'इ', 'o': 'ओ', 'u': 'उ'
};

export function transliterateEnglishToHindi(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';

  const lower = trimmed.toLowerCase();

  // Direct lookup
  if (GROCERY_TRANSLATION_DICT[lower]) {
    return GROCERY_TRANSLATION_DICT[lower];
  }

  // Check multi-word phrase components
  const words = lower.split(/[\s,()/-]+/);
  if (words.length > 1) {
    const translatedWords = words.map(w => {
      if (!w) return '';
      if (GROCERY_TRANSLATION_DICT[w]) return GROCERY_TRANSLATION_DICT[w];
      return phoneticTransliterateWord(w);
    });
    return translatedWords.filter(Boolean).join(' ');
  }

  return phoneticTransliterateWord(lower);
}

function phoneticTransliterateWord(word: string): string {
  if (GROCERY_TRANSLATION_DICT[word]) {
    return GROCERY_TRANSLATION_DICT[word];
  }

  let result = '';
  let i = 0;
  let isStart = true;

  while (i < word.length) {
    // 3-letter consonant check
    const sub3 = word.substring(i, i + 3);
    if (CONSONANTS[sub3]) {
      result += CONSONANTS[sub3];
      i += 3;
      isStart = false;
      continue;
    }

    // 2-letter consonant or vowel check
    const sub2 = word.substring(i, i + 2);
    if (CONSONANTS[sub2]) {
      result += CONSONANTS[sub2];
      i += 2;
      isStart = false;
      continue;
    }

    if (isStart && INITIAL_VOWELS[sub2]) {
      result += INITIAL_VOWELS[sub2];
      i += 2;
      isStart = false;
      continue;
    }

    if (!isStart && VOWEL_SIGNS[sub2]) {
      result += VOWEL_SIGNS[sub2];
      i += 2;
      continue;
    }

    // Single-letter check
    const char = word[i];
    if (isStart && INITIAL_VOWELS[char]) {
      result += INITIAL_VOWELS[char];
      i += 1;
      isStart = false;
      continue;
    }

    if (!isStart && VOWEL_SIGNS[char] !== undefined) {
      result += VOWEL_SIGNS[char];
      i += 1;
      continue;
    }

    if (CONSONANTS[char]) {
      result += CONSONANTS[char];
      i += 1;
      isStart = false;
      continue;
    }

    // If character is whitespace or punctuation
    result += char;
    i += 1;
    isStart = true;
  }

  return result;
}
