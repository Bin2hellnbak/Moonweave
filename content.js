// Edit this file to change the site text or add games. No build step required.
window.MOONWEAVE = {
  name: 'Moonweave',
  intro: 'A growing collection of games, made to be played.',
  defaultTheme: 'system', // dark, light, or system
  defaultAccent: 'purple', // purple, blue, or rose
  games: [
    {
      title: 'Molopony',
      description: 'A board, a roll of the dice, and your next move.',
      tags: ['Board game', 'Multiplayer', 'Mobile'],
      platform: 'Unity Play',
      cover: 'assets/molopony-full-board.jpg',
      screenshots: [
        { src: 'assets/molopony-full-board.jpg', alt: 'Six-player Molopony board with every property owned and 110 holiday homes' },
        { src: 'assets/molopony-doubles.jpg', alt: 'Glowing dice rolling after a double' },
        { src: 'assets/molopony-buy.jpg', alt: 'Buying Ipswich and viewing its title deed' },
        { src: 'assets/molopony-mega-trade.jpg', alt: 'A mega trade swapping 28 developed deeds and tens of thousands in cash' },
        { src: 'assets/molopony-victory.jpg', alt: 'You win: a crowned player celebrating while banknotes rain over the board' }
      ],
      url: 'https://play.unity.com/en/games/ca80f454-c6a9-4d45-bdf2-18549747b6c5/molopony'
    },
    {
      title: 'Darts Together!',
      description: 'Step up to the oche, take aim and challenge the bot. Make every dart count.',
      tags: ['Sports', 'Multiplayer', 'Mobile'],
      platform: 'Unity Play',
      cover: 'assets/darts-together-cover.svg',
      url: 'https://play.unity.com/en/games/f83290b8-8241-4da0-be8c-68585ac003c3/darts-together'
    }
  ]
};
