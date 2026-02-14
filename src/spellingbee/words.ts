// Spelling Bee word lists with definitions and sentences

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface SpellingWord {
  word: string;
  definition: string;
  sentence: string;
}

// 2nd grade appropriate words
const easyWords: SpellingWord[] = [
  { word: 'cat', definition: 'A small furry pet', sentence: 'The cat sat on the mat.' },
  { word: 'dog', definition: 'A pet that barks', sentence: 'My dog loves to play fetch.' },
  { word: 'run', definition: 'To move fast on your feet', sentence: 'I like to run in the park.' },
  { word: 'big', definition: 'Large in size', sentence: 'The elephant is very big.' },
  { word: 'sun', definition: 'The bright star in the sky', sentence: 'The sun is shining today.' },
  { word: 'hat', definition: 'Something you wear on your head', sentence: 'She wore a red hat.' },
  { word: 'cup', definition: 'Something you drink from', sentence: 'I drink milk from a cup.' },
  { word: 'bed', definition: 'Where you sleep', sentence: 'I made my bed this morning.' },
  { word: 'fish', definition: 'An animal that swims', sentence: 'The fish swims in the pond.' },
  { word: 'bird', definition: 'An animal with feathers that flies', sentence: 'A bird built a nest in the tree.' },
  { word: 'tree', definition: 'A tall plant with leaves', sentence: 'We planted a tree in our yard.' },
  { word: 'book', definition: 'Something you read', sentence: 'I read a book before bed.' },
  { word: 'rain', definition: 'Water falling from clouds', sentence: 'The rain made puddles outside.' },
  { word: 'play', definition: 'To have fun', sentence: 'Let us play a game together.' },
  { word: 'jump', definition: 'To push off the ground', sentence: 'I can jump very high.' },
  { word: 'stop', definition: 'To not move anymore', sentence: 'Stop at the red light.' },
  { word: 'help', definition: 'To assist someone', sentence: 'Can you help me please?' },
  { word: 'look', definition: 'To see with your eyes', sentence: 'Look at the beautiful rainbow!' },
  { word: 'come', definition: 'To move toward', sentence: 'Please come to my party.' },
  { word: 'make', definition: 'To create something', sentence: 'I will make a card for mom.' },
];

const mediumWords: SpellingWord[] = [
  { word: 'house', definition: 'A building where people live', sentence: 'Our house has a blue door.' },
  { word: 'friend', definition: 'Someone you like and play with', sentence: 'My friend came over to play.' },
  { word: 'school', definition: 'A place where you learn', sentence: 'I walk to school every day.' },
  { word: 'write', definition: 'To put words on paper', sentence: 'I write in my journal.' },
  { word: 'laugh', definition: 'The sound when something is funny', sentence: 'The joke made me laugh.' },
  { word: 'because', definition: 'For the reason that', sentence: 'I am happy because it is sunny.' },
  { word: 'people', definition: 'More than one person', sentence: 'Many people came to the fair.' },
  { word: 'water', definition: 'What you drink when thirsty', sentence: 'I drink water every day.' },
  { word: 'should', definition: 'Ought to do something', sentence: 'You should brush your teeth.' },
  { word: 'around', definition: 'In a circle or nearby', sentence: 'We walked around the block.' },
  { word: 'animal', definition: 'A living creature', sentence: 'A dog is my favorite animal.' },
  { word: 'please', definition: 'A polite word when asking', sentence: 'May I have some more, please?' },
  { word: 'family', definition: 'Your parents and siblings', sentence: 'I love my family very much.' },
  { word: 'change', definition: 'To make different', sentence: 'I will change into my pajamas.' },
  { word: 'follow', definition: 'To go after someone', sentence: 'Follow the leader in this game.' },
  { word: 'answer', definition: 'A reply to a question', sentence: 'Do you know the answer?' },
  { word: 'before', definition: 'Earlier in time', sentence: 'Wash your hands before eating.' },
  { word: 'learn', definition: 'To gain knowledge', sentence: 'I learn new things at school.' },
  { word: 'thought', definition: 'An idea in your mind', sentence: 'I thought about what to do.' },
  { word: 'picture', definition: 'An image or drawing', sentence: 'I drew a picture of my cat.' },
];

const hardWords: SpellingWord[] = [
  { word: 'different', definition: 'Not the same', sentence: 'We all have different favorite colors.' },
  { word: 'together', definition: 'With each other', sentence: 'We work together as a team.' },
  { word: 'important', definition: 'Having great value', sentence: 'It is important to be kind.' },
  { word: 'beautiful', definition: 'Very pretty', sentence: 'The sunset was beautiful.' },
  { word: 'something', definition: 'An unknown thing', sentence: 'I heard something outside.' },
  { word: 'through', definition: 'From one side to another', sentence: 'We walked through the forest.' },
  { word: 'favorite', definition: 'The one you like most', sentence: 'Pizza is my favorite food.' },
  { word: 'remember', definition: 'To keep in your mind', sentence: 'I remember my first day of school.' },
  { word: 'surprise', definition: 'Something unexpected', sentence: 'The party was a big surprise!' },
  { word: 'question', definition: 'Something you ask', sentence: 'I have a question for you.' },
  { word: 'special', definition: 'One of a kind', sentence: 'Today is a special day.' },
  { word: 'terrible', definition: 'Very bad', sentence: 'The storm was terrible.' },
  { word: 'suddenly', definition: 'Happening quickly without warning', sentence: 'Suddenly, it started to rain.' },
  { word: 'probably', definition: 'Most likely', sentence: 'It will probably snow tomorrow.' },
  { word: 'yesterday', definition: 'The day before today', sentence: 'Yesterday was my birthday.' },
  { word: 'exercise', definition: 'Moving your body to stay healthy', sentence: 'I exercise every morning.' },
  { word: 'beginning', definition: 'The start of something', sentence: 'The beginning of the movie was exciting.' },
  { word: 'everything', definition: 'All things', sentence: 'I packed everything for the trip.' },
  { word: 'daughter', definition: 'A female child', sentence: 'She is their daughter.' },
  { word: 'knowledge', definition: 'What you know and learn', sentence: 'Books give us knowledge.' },
];

const wordsByDifficulty: Record<Difficulty, SpellingWord[]> = {
  easy: easyWords,
  medium: mediumWords,
  hard: hardWords
};

export function getRandomWord(difficulty: Difficulty): SpellingWord {
  const words = wordsByDifficulty[difficulty];
  return words[Math.floor(Math.random() * words.length)];
}

export function getWordsForRound(difficulty: Difficulty, count: number): SpellingWord[] {
  const words = [...wordsByDifficulty[difficulty]];
  const selected: SpellingWord[] = [];

  for (let i = 0; i < count && words.length > 0; i++) {
    const index = Math.floor(Math.random() * words.length);
    selected.push(words.splice(index, 1)[0]);
  }

  return selected;
}

export function getTotalWordCount(difficulty: Difficulty): number {
  return wordsByDifficulty[difficulty].length;
}
