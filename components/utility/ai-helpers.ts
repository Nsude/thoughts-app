const keyphrases = [
  "Technology and apps",
  "Products for software engineers",
  "Social initiatives and community projects",
  "Creative arts and entertainment",
  "Legal Tax evastion strategies",
  "Environmental solutions",
  "Educational innovations",
  "Helping students cheat in exams",
  "Food and Travelling",
  "Health and wellness",
  "Transportation and mobility",
  "Gaming and interactive experiences",
];

export const getRandomKeyphrase = () => {
  const randomIndex = Math.floor(Math.random() * keyphrases.length);
  return keyphrases[randomIndex];
}
