// Word lists organized by category and difficulty

export type Category = 'animals' | 'food' | 'school' | 'nature';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface WordEntry {
  word: string;
  category: Category;
}

const wordsByCategory: Record<Category, string[]> = {
  animals: [
    // Easy (2-5 letters)
    'cat', 'dog', 'fish', 'bird', 'frog', 'bear', 'lion', 'duck', 'pig', 'cow',
    'ant', 'bat', 'bee', 'owl', 'fox',
    // Medium (6-7 letters)
    'rabbit', 'turtle', 'monkey', 'parrot', 'kitten', 'puppy', 'giraffe', 'dolphin',
    'penguin', 'hamster', 'chicken', 'rooster',
    // Hard (8+ letters)
    'elephant', 'butterfly', 'alligator', 'crocodile', 'hippopotamus', 'kangaroo',
    'chimpanzee', 'dragonfly', 'jellyfish', 'porcupine'
  ],
  food: [
    // Easy
    'apple', 'pizza', 'cake', 'milk', 'egg', 'rice', 'pie', 'jam', 'corn', 'pea',
    'taco', 'soup', 'meat', 'bean',
    // Medium
    'cookie', 'banana', 'orange', 'cheese', 'carrot', 'muffin', 'waffle', 'noodle',
    'potato', 'tomato', 'cherry', 'grapes',
    // Hard
    'sandwich', 'broccoli', 'spaghetti', 'hamburger', 'pineapple', 'chocolate',
    'strawberry', 'watermelon', 'blueberry', 'pancakes'
  ],
  school: [
    // Easy
    'book', 'desk', 'pen', 'art', 'bus', 'map', 'bell', 'gym', 'test', 'read',
    'math', 'play', 'work', 'draw',
    // Medium
    'pencil', 'eraser', 'crayon', 'folder', 'locker', 'lesson', 'friend', 'recess',
    'school', 'paper', 'ruler', 'marker',
    // Hard
    'teacher', 'backpack', 'classroom', 'homework', 'computer', 'notebook',
    'lunchroom', 'principal', 'chalkboard', 'scissors'
  ],
  nature: [
    // Easy
    'tree', 'sun', 'rain', 'lake', 'rock', 'leaf', 'moon', 'star', 'hill', 'pond',
    'wind', 'snow', 'sand', 'dirt',
    // Medium
    'flower', 'forest', 'garden', 'island', 'river', 'sunset', 'desert', 'meadow',
    'nature', 'branch', 'clouds', 'stream',
    // Hard
    'rainbow', 'mountain', 'waterfall', 'butterfly', 'lightning', 'snowflake',
    'sunflower', 'hurricane', 'avalanche', 'earthquake'
  ]
};

const categoryDisplayNames: Record<Category, string> = {
  animals: 'Animals',
  food: 'Food',
  school: 'School',
  nature: 'Nature'
};

export function getCategoryDisplayName(category: Category): string {
  return categoryDisplayNames[category];
}

export function getWordsByDifficulty(difficulty: Difficulty): WordEntry[] {
  const words: WordEntry[] = [];
  const maxLength = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 7 : 100;
  const minLength = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 6 : 8;

  for (const [category, wordList] of Object.entries(wordsByCategory)) {
    for (const word of wordList) {
      if (word.length >= minLength && word.length <= maxLength) {
        words.push({ word: word.toUpperCase(), category: category as Category });
      }
    }
  }

  return words;
}

export function getRandomWord(difficulty: Difficulty): WordEntry {
  const words = getWordsByDifficulty(difficulty);
  return words[Math.floor(Math.random() * words.length)];
}

export function getAllCategories(): Category[] {
  return Object.keys(wordsByCategory) as Category[];
}
