/**
 * Editable planning assumptions for this portfolio demo, NOT clinical minima or
 * researched Canadian prices. Real needs depend on the individual animal.
 * Qualitative care notes link to the RSPCA; numeric thresholds are our model.
 */
export const PETS = Object.freeze([
  { id: 'cat', name: 'Adult cat', icon: '../../assets/icons/cat.svg', family: 'mammal', space: 1,
    minutes: 60, monthly: 100, setup: 350, activity: 'calm', experience: 'first',
    summary: 'A companion with room to climb, hide, scratch, and play.',
    care: 'Plan daily interaction, litter care, enrichment, and veterinary care. Individual cats vary in temperament and needs.',
    source: 'https://www.rspca.org.uk/adviceandwelfare/pets/cats' },
  { id: 'dog', name: 'Adult dog', icon: '../../assets/icons/dog.svg', family: 'mammal', space: 1,
    minutes: 120, monthly: 180, setup: 500, activity: 'active', experience: 'first',
    summary: 'A companion for walks, play, training, and a reliable routine.',
    care: 'Exercise and companionship depend on age, health, breed, and temperament. Home size alone cannot establish suitability.',
    source: 'https://www.rspca.org.uk/adviceandwelfare/pets/dogs' },
  { id: 'rabbits', name: 'Bonded rabbit pair', icon: '../../assets/icons/rabbits.svg', family: 'mammal', space: 2,
    minutes: 90, monthly: 140, setup: 550, activity: 'moderate', experience: 'experienced',
    summary: 'Two social companions with dedicated room to move and explore.',
    care: 'Rabbits need suitable rabbit companionship, generous exercise space, daily care, and a vet familiar with rabbits.',
    source: 'https://www.rspca.org.uk/adviceandwelfare/pets/rabbits' },
  { id: 'fish', name: 'Freshwater aquarium', icon: '../../assets/icons/fish.svg', family: 'fish', space: 1,
    minutes: 30, monthly: 40, setup: 250, activity: 'calm', experience: 'experienced',
    summary: 'An observation-focused hobby with careful habitat maintenance.',
    care: 'Research species, compatible tank mates, tank cycling, water testing, filtration, and tank size before buying fish.',
    source: 'https://www.rspca.org.uk/adviceandwelfare/pets/fish' }
].map(pet => Object.freeze(pet)));
