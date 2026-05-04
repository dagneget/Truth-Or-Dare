export type PromptCategory = "funny" | "spicy" | "deep" | "extreme" | "wild" | "classic" | "party";

export const DEFAULT_TRUTHS: { text: string; category: PromptCategory }[] = [
  // Classic / Generic
  { text: "What is the most embarrassing thing you've done to get someone's attention?", category: "spicy" },
  { text: "What's a secret you've never told anyone in this room?", category: "deep" },
  { text: "What's the worst fashion choice you've ever made?", category: "classic" },
  { text: "Who in this room would you swap lives with for a day?", category: "classic" },
  { text: "What's something you're glad your parents don't know about?", category: "spicy" },
  
  // Funny
  { text: "What's the most ridiculous lie you've ever told?", category: "funny" },
  { text: "If you were a vegetable, what vegetable would you be and why?", category: "funny" },
  { text: "What's the weirdest thing you've ever eaten?", category: "funny" },
  { text: "What's your most useless talent?", category: "funny" },
  { text: "Have you ever walked into a wall or a clear glass door?", category: "funny" },
  
  // Deep
  { text: "What is your biggest fear for the future?", category: "deep" },
  { text: "What's the biggest lesson you've learned from a past relationship?", category: "deep" },
  { text: "If you could change one thing about your personality, what would it be?", category: "deep" },
  { text: "What does true happiness look like to you?", category: "deep" },
  { text: "What is the most brave thing you've ever done?", category: "deep" },
  
  // Wild / Extreme
  { text: "What's the most rebellious thing you did as a teenager?", category: "wild" },
  { text: "Have you ever been caught doing something you shouldn't have?", category: "wild" },
  { text: "What's the most illegal thing you've ever done?", category: "extreme" },
  { text: "If you had to delete every app on your phone except three, which would they be?", category: "wild" },
  { text: "What's the most money you've ever spent on something stupid?", category: "wild" },
];

export const DEFAULT_DARES: { text: string; category: PromptCategory }[] = [
  // Classic / Generic
  { text: "Do your best impression of someone in the room until someone guesses who it is.", category: "funny" },
  { text: "Let the group post a caption on your social story.", category: "party" },
  { text: "Speak in an accent for the next three rounds.", category: "funny" },
  { text: "Eat a spoonful of a condiment the group chooses.", category: "extreme" },
  { text: "Call your best friend and sing them happy birthday.", category: "party" },
  
  // Funny / Party
  { text: "Do a silly dance for 30 seconds with no music.", category: "funny" },
  { text: "Try to lick your elbow while everyone watches.", category: "funny" },
  { text: "Act like a chicken for 1 minute.", category: "funny" },
  { text: "Let someone in the room give you a new hairstyle.", category: "party" },
  { text: "Text your crush a random emoji.", category: "party" },
  
  // Wild / Extreme
  { text: "Let someone in the room send a text from your phone to a random contact.", category: "wild" },
  { text: "Eat a slice of lemon without making a face.", category: "extreme" },
  { text: "Wear your clothes backward for the rest of the game.", category: "wild" },
  { text: "Post a selfie on social media with no filter and a weird caption.", category: "wild" },
  { text: "Drink a mystery concoction made by the group.", category: "extreme" },
  
  // Classic
  { text: "Hold a plank for 1 minute.", category: "classic" },
  { text: "Give a 2-minute speech on why pineapples belong on pizza.", category: "classic" },
  { text: "Talk to a chair as if it's your long-lost love.", category: "classic" },
];

export const DEFAULT_PUNISHMENTS: string[] = [
  "Do 20 pushups while barking like a dog.",
  "Let the group draw on your face with a marker.",
  "Take a shot of hot sauce.",
  "Dance with no music for one minute.",
  "Let someone go through your phone photos for 30 seconds.",
  "Sing the chorus of a random song at the top of your lungs.",
  "Imitate a famous person until the group guesses who it is.",
];
